// src/app/hrPortal/employees/employeeDetailTabs/leaveTab.jsx — Phase 5 (Leave Management Enhancement)
// REPLACES the earlier version. Balance cards now use the shared StatsCard
// component instead of a custom card — StatsCard's fixed minHeight (130px)
// and height:"100%" guarantee every card is the same size regardless of
// whether it has a subtitle, unlike the earlier custom card which grew/shrank
// depending on whether a progress bar was shown. Leave History still uses
// PaginatedTable with server-side pagination, reusing the existing
// "leave_report_*" cell cases — no dynamicTable.jsx patch needed.

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import StatsCard      from "../../../../components/cards/statsCard";
import PaginatedTable  from "../../../../components/dynamicTable";
import { hrGetEmployeeLeaveBalanceApi, hrGetLeavesApi } from "../../../../api/modules/leave";

import calendarIcon  from "../../../../assets/icons/tasks.svg";
import presentIcon   from "../../../../assets/icons/attendance-icon.svg";

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave", maternity: "Maternity Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave", unpaid: "Unpaid Leave",
};

// ── Leave History table (spec §7.1) — reuses existing "leave_report_*" cases ─
const tableHeader = [
  { id: "leaveType",  label: "Type"     },
  { id: "fromDate",   label: "From"     },
  { id: "toDate",     label: "To"       },
  { id: "days",       label: "Days"     },
  { id: "paidUnpaid", label: "Paid / Unpaid" },
  { id: "leaveStatus",label: "Status"   },
];

const displayRows = [
  "leave_report_type",
  "leave_report_from",
  "leave_report_to",
  "leave_report_days",
  "paidUnpaid",        // no dedicated case — falls through to the table's
                        // default renderer (plain text), so no patch is needed
  "leave_report_status",
];

const LeaveTab = ({ employee }) => {
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // ── Balance summary (fetched once) ────────────────────────────────────────
  useEffect(() => {
    if (!employee?.id) return;
    setBalanceLoading(true);
    hrGetEmployeeLeaveBalanceApi(employee.id)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) setBalanceData(res.data.data);
      })
      .finally(() => setBalanceLoading(false));
  }, [employee?.id]);

  // ── Leave History (paginated, server-side) ────────────────────────────────
  const fetchHistory = useCallback(async (pageNum, limit) => {
    if (!employee?.id) return;
    setHistoryLoading(true);
    try {
      const res = await hrGetLeavesApi({ employee: employee.id, page: pageNum + 1, limit });
      if (res?.status === 200 || res?.status === 201) {
        setHistory(res.data.data.leaves || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchHistory(page, rowsPerPage); }, [fetchHistory, page, rowsPerPage]);

  const handlePageChange = (_e, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const tableData = history.map((l) => ({
    id: l._id,
    leaveType: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
    fromDate: l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    toDate:   l.toDate   ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })   : "—",
    days: l.totalDays ?? 1,
    paidUnpaid: l.status === "approved" ? `Paid: ${l.paidDays ?? 0} · Unpaid: ${l.unpaidDays ?? 0}` : "—",
    leaveStatus: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : "Pending",
  }));

  const balance = balanceData?.balance;
  const short   = balanceData?.short;
  const pendingDays = balanceData?.pendingDays ?? 0;
  const unpaidTaken = balanceData?.unpaidTaken ?? 0;

  // ── Balance cards — spec §7.1, built entirely from StatsCard ─────────────
  // Each card's subtitle carries the "/ total" context, colored to match the
  // same green/amber/red logic used elsewhere in leave management.
  const cards = balance ? [
    {
      title: "Annual Leave Allocation",
      value: balance.annual.total,
      icon: calendarIcon,
      subtitle: "days entitled this year",
    },
    {
      title: "Current Leave Balance",
      value: balance.annual.remaining,
      icon: presentIcon,
      isHighlighted: true,
      subtitle: `of ${balance.annual.total} total`,
    },
    {
      title: "Paid Leave Used",
      value: balance.annual.used,
      icon: presentIcon,
      subtitle: "days consumed this year",
    },
    {
      title: "Unpaid Leave Taken",
      value: unpaidTaken,
      icon: calendarIcon,
      subtitle: "does not reduce balance",
      subtitleColor: unpaidTaken > 0 ? "#B45309" : undefined,
    },
    {
      title: "Sick Leave Balance",
      value: balance.sick.remaining,
      icon: presentIcon,
      subtitle: `of ${balance.sick.total} total`,
    },
    {
      title: "Casual Leave Balance",
      value: balance.casual.remaining,
      icon: calendarIcon,
      subtitle: `of ${balance.casual.total} total`,
    },
    {
      title: "Emergency Leave",
      value: balance.emergency.remaining,
      icon: presentIcon,
      subtitle: `of ${balance.emergency.total} total`,
    },
    {
      title: "Maternity Leave",
      value: balance.maternity.remaining,
      icon: calendarIcon,
      subtitle: `of ${balance.maternity.total} total`,
    },
    ...(short ? [{
      title: "Short Leaves",
      value: short.remaining,
      icon: presentIcon,
      subtitle: `of ${short.total} this month`,
    }] : []),
    {
      title: "Pending Leave Requests",
      value: pendingDays,
      icon: calendarIcon,
      subtitle: "days awaiting action",
      subtitleColor: pendingDays > 0 ? "#B45309" : undefined,
    },
  ] : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Leave Balance section (spec §7.1) ────────────────────────────── */}
      <Box>
        <Typography fontSize="15px" fontWeight={700} mb={1.5}>
          Leave Balance ({balanceData?.year || new Date().getFullYear()})
        </Typography>

        {balanceLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} sx={{ color: "#AA2493" }} /></Box>
        ) : !balance ? (
          <Typography fontSize="13px" color="text.secondary">Leave balance not available.</Typography>
        ) : (
          <Grid container spacing={2}>
            {cards.map((c) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={c.title}>
                <StatsCard
                  title={c.title}
                  value={c.value}
                  icon={c.icon}
                  isHighlighted={c.isHighlighted}
                  subtitle={c.subtitle}
                  subtitleColor={c.subtitleColor}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ── Leave History (spec §7.1) — PaginatedTable, server-side paging ── */}
      <Box bgcolor="#fff" borderRadius="20px" p={2}>
        <Typography fontSize="15px" fontWeight={700} mb={1} px={1}>Leave History</Typography>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={historyLoading}
          serverSidePagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Box>
  );
};

export default LeaveTab;