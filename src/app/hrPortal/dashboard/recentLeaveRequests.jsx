// app/hrPortal/dashboard/recentLeaveRequests.jsx —
import { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PaginatedTable           from "../../../components/dynamicTable";
import LeaveRequestDetailDialog from "../leaves/leaveRequestDetailDialog";
import ConfirmationDialog       from "../../../components/popups/confirmation";
import SuccessPopup             from "../../../components/popups/confirmationDialog";
import { useHRLeaves }          from "../../../hooks/leave";
import viewIcon    from "../../../assets/icons/view.svg";
import approveIcon from "../../../assets/icons/complete-active.svg";
import rejectIcon  from "../../../assets/icons/close-icon.svg";

const tableHeader = [
  { id: "employee", label: "Employee"          },
  { id: "type",     label: "Type"              },
  { id: "dates",    label: "Start & End Dates" },
  { id: "status",   label: "Status"            },
  { id: "actions",  label: "Actions"           },
];

// Switched to "lm_actions" — the SAME renderer leaveRequestsTab.jsx uses.
// Only viewIcon/onViewClick are passed below (no onApproveClick/onRejectClick),
// so it renders just the View icon here instead of the Approve/Reject pair.
const displayRows = [
  "hr_leave_employee",
  "hr_leave_type",
  "hr_leave_dates",
  "hr_leave_status",
  "lm_actions",
];

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave",
  maternity: "Maternity Leave", unpaid: "Unpaid Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave",
};

const RecentLeaveRequests = ({ leaves: propLeaves = [], loading: propLoading = false, onRefresh }) => {
  const { reviewLeave, actionLoading } = useHRLeaves();

  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });
  const [apiError,      setApiError]      = useState("");

  const confirmRef = useRef();

  // Dates formatted CLIENT-SIDE from raw ISO — same as leaveRequestsTab.jsx —
  // fixes the one-day-earlier display.
  const tableData = propLeaves.map((l) => ({
    id:              l.id || l._id,
    name:            l.name     || "—",
    avatar:          l.avatar   || "",
    empId:           l.empId    || "",
    role:            l.role     || "—",
    designation:     l.designation || l.role || "—",
    leaveType:       LEAVE_TYPE_LABELS[l.leaveTypeRaw] || l.leaveType || "—",
    leaveTypeRaw:    l.leaveTypeRaw || "",
    fromDate:        l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    toDate:          l.toDate   ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })   : "—",
    _rawFromDate:    l.fromDate ? new Date(l.fromDate) : null,
    _rawToDate:      l.toDate   ? new Date(l.toDate)   : null,
    submittedDate:   l.submittedDate ? new Date(l.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    days:            l.days     || 1,
    reason:          l.reason?.length > 35 ? l.reason.slice(0, 35) + "..." : l.reason || "—",
    reasonFull:      l.reason   || "",
    status:          "Pending",
    hrNotes:         l.hrNotes  || "",
    paymentPreference: l.paymentPreference || "paid",
    audit:           l.audit || [],
    employeeMongoId: l.employeeMongoId || "",
    escalationRequired:     !!l.escalationRequired,
    escalationHrLocked:     !!l.escalationHrLocked,
    escalationAdminStatus:  l.escalationAdminStatus || "none",
    _adminCapFromDate: l._adminCapFromDate ? new Date(l._adminCapFromDate) : null,
    _adminCapToDate:   l._adminCapToDate   ? new Date(l._adminCapToDate)   : null,
  }));

  // NEW payload-based signature — matches hooks/leave.js reviewLeave(leaveId, payload)
  const handleApprove = (row, payload) => {
    confirmRef.current?.open({
      title: payload?.decision === "approve_custom" ? "Approve Custom Range?" : "Approve Leave?",
      description: `Confirm this decision for ${row.name}'s leave request?`,
      confirmText: "Yes, Confirm",
      cancelText:  "Cancel",
      icon: approveIcon,
      onConfirm: async () => {
        const result = await reviewLeave(row.id, payload);
        if (result.success) {
          setActionSuccess({ open: true, message: result.message || "Leave reviewed successfully." });
          setViewOpen(false);
          onRefresh?.();
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleReject = (row, payload) => {
    confirmRef.current?.open({
      title: "Reject Leave?",
      description: payload?.hrNotes ? `Reject leave for ${row.name}?\nReason: "${payload.hrNotes}"` : `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText:  "Cancel",
      icon: rejectIcon,
      onConfirm: async () => {
        const result = await reviewLeave(row.id, { decision: "reject_all", hrNotes: payload?.hrNotes || "" });
        if (result.success) {
          setActionSuccess({ open: true, message: "Leave rejected." });
          setViewOpen(false);
          onRefresh?.();
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, height: "100%" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="16px" fontWeight={600} color="text.primary">
          Recent Leave Requests
        </Typography>
        {actionLoading && <CircularProgress size={18} sx={{ color: "#AA2493" }} />}
      </Box>

      {apiError && (
        <Box mb={2} px={2} py={1} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={12} color="error">{apiError}</Typography>
        </Box>
      )}

      <PaginatedTable
        tableHeader={tableHeader}
        tableData={tableData}
        displayRows={displayRows}
        isLoading={propLoading}
        viewIcon={viewIcon}
        onViewClick={(row) => { setSelectedLeave(row); setViewOpen(true); }}
      />

      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onApprove={handleApprove}
        onReject={handleReject}
        onEscalationResolved={onRefresh}
        loading={actionLoading}
      />

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={actionSuccess.open}
        onClose={() => setActionSuccess({ open: false, message: "" })}
        message={actionSuccess.message}
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup open={!!apiError} onClose={() => setApiError("")} message={apiError} />
    </Box>
  );
};

export default RecentLeaveRequests;