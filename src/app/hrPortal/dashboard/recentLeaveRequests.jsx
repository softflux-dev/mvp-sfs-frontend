// app/hrPortal/dashboard/recentLeaveRequests.jsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

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
  const [rows, setRows] = useState(ROWS);

  const handleApprove = (row) =>
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "Approved" } : r));

  const handleReject = (row) =>
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "Rejected" } : r));

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
        onApproveClick={handleApprove}
        onRejectClick={handleReject}
      />
    </Box>
  );
};

export default RecentLeaveRequests;