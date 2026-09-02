// src/app/admin/leaves/escalatedLeaves.jsx — Phase 3 (Leave Management Enhancement)
// Admin-only queue for leave requests that exceeded the approval threshold.
// UPDATED: reuses hrPortal/leaves/leaveRequestDetailDialog.jsx instead of a
// separate custom dialog — that dialog already renders the full Admin
// Decision panel (Approve All / Approve Custom Range / Reject & Close) when
// opened by an Admin viewer on an escalated request, via its own
// `awaitingAdminDecision && isAdminViewer` block. No functional duplication.

import { useState, useEffect, useCallback } from "react";
import { Box, Grid, Chip, CircularProgress } from "@mui/material";
import HeaderText      from "../../../components/headerText";
import PaginatedTable  from "../../../components/dynamicTable";
import LeaveRequestDetailDialog from "../../hrPortal/leaves/leaveRequestDetailDialog";
import viewIcon from "../../../assets/icons/view.svg";
import { adminGetEscalatedLeavesApi } from "../../../api/modules/leave";

const tableHeader = [
  { id: "name",          label: "Employee"       },
  { id: "leaveType",     label: "Type"           },
  { id: "appliedDays",   label: "Applied Days"   },
  { id: "approvedDays",  label: "Approved Days"  },
  { id: "appliedDates",  label: "Applied Dates"  },
  { id: "approvedDates", label: "Approved Dates" },
  { id: "reason",        label: "Reason"         },
  { id: "status",        label: "Status"         },
  { id: "actions",       label: "Action"         },
];

// Inclusive day count between two dates — mirrors how totalDays is likely
// computed server-side (from/to both counted).
const diffDaysInclusive = (from, to) => {
  if (!from || !to) return 0;
  const ms = new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.floor(ms / 86400000) + 1;
};

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave", maternity: "Maternity Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave", unpaid: "Unpaid Leave",
};

const STATUS_CHIP = {
  pending:  { bg: "#FF972F1A", color: "#FF972F", label: "Awaiting Your Approval" },
  approved: { bg: "#04C3731A", color: "#04C373", label: "Approved — HR Finalizing" },
  rejected: { bg: "#FF00001A", color: "#FF0000", label: "Rejected & Closed" },
};

// ── Reshape a raw escalated-leave document into what
// leaveRequestDetailDialog.jsx expects (same shape leaveRequestsTab.jsx
// builds for its own rows) ───────────────────────────────────────────────
const toDialogLeaveShape = (l) => {
  if (!l) return {};
  const fromDate = l.fromDate ? new Date(l.fromDate) : null;
  const toDate   = l.toDate   ? new Date(l.toDate)   : null;
  const fmt = (d) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return {
    id: l._id,
    name: l.employee?.fullName || "—",
    avatar: l.employee?.avatar || "",
    empId: l.employee?.empId || "",
    role: l.employee?.role?.roleName || "—",
    employeeMongoId: l.employee?._id || "",

    leaveType: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType,
    leaveTypeRaw: l.leaveType,

    days: l.totalDays,
    fromDate: fmt(fromDate),
    toDate:   fmt(toDate),
    _rawFromDate: fromDate,
    _rawToDate:   toDate,

    reason: l.reason || "—",
    reasonFull: l.reason || "",

    submittedDate: l.createdAt ? fmt(new Date(l.createdAt)) : "—",

    // Dialog expects "Pending" / "Approved" / "Rejected" — Leave.status is
    // stored lowercase.
    status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : "Pending",
    hrNotes: l.hrNotes || "",
    paymentPreference: l.paymentPreference || "paid",
    audit: l.audit || [],

    escalationRequired: !!l.escalation?.required,
    escalationHrLocked: !!l.escalation?.hrLocked,
    escalationAdminStatus: l.escalation?.adminStatus || "none",
    _adminCapFromDate: l.escalation?.adminApprovedFromDate ? new Date(l.escalation.adminApprovedFromDate) : null,
    _adminCapToDate:   l.escalation?.adminApprovedToDate   ? new Date(l.escalation.adminApprovedToDate)   : null,
  };
};

const EscalatedLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetEscalatedLeavesApi({ status: statusFilter, limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        setLeaves(res.data.data.leaves || []);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const tableData = leaves.map((l) => {
    const appliedFrom = new Date(l.fromDate);
    const appliedTo   = new Date(l.toDate);
    const appliedDatesLabel = `${appliedFrom.toLocaleDateString()} – ${appliedTo.toLocaleDateString()}`;

    const adminStatus      = l.escalation?.adminStatus || "pending";
    const approvedFromDate = l.escalation?.adminApprovedFromDate ? new Date(l.escalation.adminApprovedFromDate) : null;
    const approvedToDate   = l.escalation?.adminApprovedToDate   ? new Date(l.escalation.adminApprovedToDate)   : null;

    let approvedDays       = "—";
    let approvedDatesLabel = "—";

    if (adminStatus === "approved") {
      if (approvedFromDate && approvedToDate) {
        approvedDays = diffDaysInclusive(approvedFromDate, approvedToDate);
        approvedDatesLabel = `${approvedFromDate.toLocaleDateString()} – ${approvedToDate.toLocaleDateString()}`;
      } else {
        approvedDays = l.totalDays;
        approvedDatesLabel = appliedDatesLabel;
      }
    } else if (adminStatus === "rejected") {
      approvedDays = 0;
      approvedDatesLabel = "Rejected";
    }

    return {
      id: l._id,
      name: l.employee?.fullName || "—",
      avatar: l.employee?.avatar || "",
      empId: l.employee?.empId || "",
      leaveType: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType,
      days: l.totalDays,
      appliedDays: l.totalDays,
      appliedDates: appliedDatesLabel,
      approvedDays,
      approvedDates: approvedDatesLabel,
      dates: appliedDatesLabel,
      _rawFromDate: appliedFrom,
      _rawToDate: appliedTo,
      reason: l.reason || "—",
      adminStatus,
      raw: l,
    };
  });

  const openDialog = (row) => {
    setSelectedLeave(toDialogLeaveShape(row.raw));
    setViewOpen(true);
  };

  return (
    <>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12 }}>
          <HeaderText title="Escalated Leave Requests" subtitle="Requests exceeding the approval threshold — your decision unlocks or closes them" />
        </Grid>
      </Grid>

      <Box display="flex" gap={1.5} mb={2}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Box
            key={s}
            onClick={() => setStatusFilter(s)}
            sx={{
              px: 2, py: 0.75, borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              backgroundColor: statusFilter === s ? "#AA2493" : "#F5F5F5",
              color: statusFilter === s ? "#fff" : "text.secondary",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Box>
        ))}
      </Box>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} sx={{ color: "#AA2493" }} /></Box>
        ) : (
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={tableData.map((r) => ({
              ...r,
              status: (
                <Chip
                  label={STATUS_CHIP[r.adminStatus]?.label || r.adminStatus}
                  size="small"
                  sx={{ height: "22px", fontSize: "11px", fontWeight: 600, backgroundColor: STATUS_CHIP[r.adminStatus]?.bg, color: STATUS_CHIP[r.adminStatus]?.color }}
                />
              ),
            }))}
            displayRows={["name", "leaveType", "appliedDays", "approvedDays", "appliedDates", "approvedDates", "reason", "status", "actions"]}
            isLoading={false}
            viewIcon={viewIcon}
            onViewClick={openDialog}
          />
        )}
      </Box>

      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onEscalationResolved={fetchLeaves}
      />
    </>
  );
};

export default EscalatedLeaves;