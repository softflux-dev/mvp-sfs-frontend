// src/app/admin/reports/tabs/leaveReportTab.jsx — 
import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import Filter          from "../../../../components/filterBar/filter";
import PaginatedTable  from "../../../../components/dynamicTable";
import { useHRLeaves } from "../../../../hooks/leave";
import { getEmployeesApi } from "../../../../api/modules/employee";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";

const tableHeader = [
  { id: "name",       label: "Employee"    },
  { id: "leaveType",  label: "Type"        },
  { id: "fromDate",   label: "From Date"   },
  { id: "toDate",     label: "To Date"     },
  { id: "days",       label: "Days"        },
  { id: "approvedBy", label: "Approved By" },
  { id: "status",     label: "Status"      },
];

const displayRows = [
  "leave_report_member",
  "leave_report_type",
  "leave_report_from",
  "leave_report_to",
  "leave_report_days",
  "leave_report_approved_by",
  "leave_report_status",
];

const LEAVE_TYPE_LABELS = {
  sick:      "Sick Leave",
  casual:    "Casual Leave",
  annual:    "Annual Leave",
  maternity: "Maternity Leave",
  emergency: "Emergency Leave",
};

const REVIEWER_LABEL_OVERRIDES = {
  "6a056b5fc2585be29bcd8027": "Super Admin",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const startOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const LeaveReportTab = forwardRef((props, ref) => {
  const { leaves, loading, fetchLeaves } = useHRLeaves();

  useEffect(() => {
    fetchLeaves({ limit: 500, page: 1 });
  }, []);

  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    getEmployeesApi({ limit: 500 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setEmployees(res.data.data.employees || []);
      }
    });
  }, []);

  const [currentDate, setCurrentDate] = useState(startOfCurrentMonth());
  const [uiFilters,   setUiFilters]   = useState({});

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const tableData = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59);

    return leaves
      .filter((l) => {
        if (!l.fromDate) return false;
        const from = new Date(l.fromDate);
        const to   = l.toDate ? new Date(l.toDate) : from;
        const inMonth = from <= monthEnd && to >= monthStart;

        const matchEmp    = !uiFilters.employee  || l.employee?._id === uiFilters.employee;
        const matchType   = !uiFilters.leaveType || l.leaveType === uiFilters.leaveType;
        const matchStatus = !uiFilters.status    || l.status === uiFilters.status;

        return inMonth && matchEmp && matchType && matchStatus;
      })
      .map((l) => ({
        id:          l._id,
        name:        l.employee?.fullName || "—",
        leaveType:   LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
        fromDate:    fmtDate(l.fromDate),
        toDate:      fmtDate(l.toDate),
        days:        l.totalDays ?? 1,
        approvedBy:  REVIEWER_LABEL_OVERRIDES[l.reviewedBy?._id]
          || l.reviewedBy?.name
          || l.reviewedBy?.fullName
          || "—",
        leaveStatus: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : "Pending",
      }));
  }, [leaves, year, month, uiFilters]);

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const doc = createReportDoc("Leave Report", `${monthName} ${year}`);

      const approved = tableData.filter((l) => l.leaveStatus === "Approved").length;
      const pending  = tableData.filter((l) => l.leaveStatus === "Pending").length;
      const rejected = tableData.filter((l) => l.leaveStatus === "Rejected").length;

      let y = addSummaryCards(doc, [
        { label: "Total Requests", value: tableData.length },
        { label: "Approved",       value: approved, color: [4, 195, 115] },
        { label: "Pending",        value: pending,  color: [249, 151, 47] },
        { label: "Rejected",       value: rejected, color: [255, 0, 0] },
      ]);

      addReportTable(doc, {
        head: ["Employee", "Type", "From", "To", "Days", "Approved By", "Status"],
        body: tableData.map((l) => [
          l.name, l.leaveType, l.fromDate, l.toDate, String(l.days), l.approvedBy, l.leaveStatus,
        ]),
        startY: y,
      });

      savePdf(doc, `leave-report-${monthName}-${year}.pdf`.toLowerCase());
    },
  }));

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            size="small"
            sx={{ bgcolor: "#F5F5F5", borderRadius: "8px", width: 32, height: 32, "&:hover": { bgcolor: "#E0E0E0" } }}
          >
            <ChevronLeft size={16} />
          </IconButton>

          <Box sx={{ px: 2, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px", display: "flex", alignItems: "center", gap: 1 }}>
            <Calendar size={14} color="#67768B" />
            <Typography fontSize="13px" fontWeight={600} color="text.primary">
              {monthName} {year}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            size="small"
            sx={{ background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)", borderRadius: "8px", width: 32, height: 32, "&:hover": { opacity: 0.9 } }}
          >
            <ChevronRight size={16} color="#fff" />
          </IconButton>
        </Box>

        <Filter
          mode="leave_report"
          employees={employees}
          onFilterChange={(f) => setUiFilters(f)}
        />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
        />
      </Box>
    </Box>
  );
});

export default LeaveReportTab;