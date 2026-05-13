// app/hrPortal/dashboard/recentLeaveRequests.jsx
import { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import PaginatedTable            from "../../../components/dynamicTable";
import LeaveRequestDetailDialog  from "../leaves/leaveRequestDetailDialog";
import ConfirmationDialog        from "../../../components/popups/confirmation";
import SuccessPopup              from "../../../components/popups/confirmationDialog";
import viewIcon from "../../../assets/icons/view.svg";

const ROWS = [
  { id: 1, name: "Sarah Johnson",  avatar: "", leaveType: "Full Day",    fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 2, name: "James Chen",     avatar: "", leaveType: "Short Leave", fromDate: "Jun 25, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 3, name: "Alina Patel",    avatar: "", leaveType: "Sick Leave",  fromDate: "Jun 28, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 4, name: "Sarah Johnson",  avatar: "", leaveType: "Full Day",    fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 5, name: "James Chen",     avatar: "", leaveType: "Short Leave", fromDate: "Jun 25, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 6, name: "Alina Patel",    avatar: "", leaveType: "Sick Leave",  fromDate: "Jun 28, 2026", toDate: "Jun 30, 2026", status: "Pending" },
  { id: 7, name: "Marcus Johnson", avatar: "", leaveType: "Full Day",    fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", status: "Pending" },
];

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

const RecentLeaveRequests = ({ onViewAll }) => {
  const [rows,          setRows]          = useState(ROWS);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });

  const confirmRef = useRef();

  // ── Opens the detail dialog (view, approve, or reject all go here first) ──
  const openDetail = (row) => {
    setSelectedLeave(row);
    setViewOpen(true);
  };

  const handleApprove = (row) => {
    confirmRef.current?.open({
      title:       "Approve Leave?",
      description: `Approve leave request for ${row.name}?`,
      confirmText: "Yes, Approve",
      cancelText:  "Cancel",
      onConfirm: () => {
        setRows((prev) =>
          prev.map((r) => r.id === row.id ? { ...r, status: "Approved" } : r)
        );
        setSelectedLeave((prev) =>
          prev?.id === row.id ? { ...prev, status: "Approved" } : prev
        );
        setActionSuccess({ open: true, message: "Leave approved successfully" });
      },
    });
  };

  const handleReject = (row) => {
    confirmRef.current?.open({
      title:       "Reject Leave?",
      description: `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText:  "Cancel",
      onConfirm: () => {
        setRows((prev) =>
          prev.map((r) => r.id === row.id ? { ...r, status: "Rejected" } : r)
        );
        setSelectedLeave((prev) =>
          prev?.id === row.id ? { ...prev, status: "Rejected" } : prev
        );
        setActionSuccess({ open: true, message: "Leave rejected" });
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, height: "100%" }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="16px" fontWeight={600} color="text.primary">
          Recent Leave Requests
        </Typography>
      </Box>

      <PaginatedTable
        tableHeader={tableHeader}
        tableData={rows}
        displayRows={displayRows}
        isLoading={false}
        viewIcon={viewIcon}
        onViewClick={openDetail}
        onApproveClick={openDetail}  
        onRejectClick={openDetail}   
      />

      {/* ── Leave detail dialog — HR adds notes then approves/rejects ── */}
      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onApprove={(row) => { setViewOpen(false); handleApprove(row); }}
        onReject={(row)  => { setViewOpen(false); handleReject(row);  }}
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