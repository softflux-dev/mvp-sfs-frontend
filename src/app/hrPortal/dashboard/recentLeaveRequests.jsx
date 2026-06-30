// app/hrPortal/dashboard/recentLeaveRequests.jsx — 
import { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PaginatedTable           from "../../../components/dynamicTable";
import LeaveRequestDetailDialog from "../leaves/leaveRequestDetailDialog";
import ConfirmationDialog       from "../../../components/popups/confirmation";
import SuccessPopup             from "../../../components/popups/confirmationDialog";
import { useHRLeaves }          from "../../../hooks/leave";
import viewIcon from "../../../assets/icons/view.svg";

const tableHeader = [
  { id: "employee", label: "Employee"          },
  { id: "type",     label: "Type"              },
  { id: "dates",    label: "Start & End Dates" },
  { id: "status",   label: "Status"            },
  { id: "actions",  label: "Actions"           },
];

const displayRows = [
  "hr_leave_employee",
  "hr_leave_type",
  "hr_leave_dates",
  "hr_leave_status",
  "hr_leave_actions",
];

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave",
  maternity: "Maternity Leave", unpaid: "Unpaid Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave",
};

const RecentLeaveRequests = ({ leaves: propLeaves = [], loading: propLoading = false, onRefresh }) => {
  // Use hook for approve/reject actions only — display data comes from props (parent fetched it)
  const { reviewLeave, actionLoading } = useHRLeaves();

  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });
  const [apiError,      setApiError]      = useState("");

  const confirmRef = useRef();

  // Map prop leaves to table row shape
  const tableData = propLeaves.map((l) => ({
    id:              l.id || l._id,
    name:            l.name     || "—",
    avatar:          l.avatar   || "",
    empId:           l.empId    || "",
    role:            l.role     || "—",
    designation:     l.role     || "—",
    leaveType:       LEAVE_TYPE_LABELS[l.leaveTypeRaw] || l.leaveType || "—",
    leaveTypeRaw:    l.leaveTypeRaw || "",
    fromDate:        l.fromDate || "—",
    toDate:          l.toDate   || "—",
    days:            l.days     || 1,
    reason:          l.reason?.length > 35 ? l.reason.slice(0, 35) + "..." : l.reason || "—",
    reasonFull:      l.reason   || "",
    status:          "Pending",
    hrNotes:         l.hrNotes  || "",
    employeeMongoId: l.employeeMongoId || "",
  }));

  const handleApprove = (row, hrNotes = "") => {
    confirmRef.current?.open({
      title:       "Approve Leave?",
      description: `Approve leave request for ${row.name}?`,
      confirmText: "Yes, Approve",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, "approved", hrNotes);
        if (result.success) {
          setActionSuccess({ open: true, message: "Leave approved successfully." });
          setViewOpen(false);
          onRefresh?.();
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleReject = (row, hrNotes = "") => {
    confirmRef.current?.open({
      title:       "Reject Leave?",
      description: `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, "rejected", hrNotes);
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
        onApproveClick={handleApprove}
        onRejectClick={handleReject}
      />

      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onApprove={(row, notes) => { setViewOpen(false); handleApprove(row, notes); }}
        onReject={(row, notes)  => { setViewOpen(false); handleReject(row, notes);  }}
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
    </Box>
  );
};

export default RecentLeaveRequests;