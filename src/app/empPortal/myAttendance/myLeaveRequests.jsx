import { Box, Typography, Chip, Button } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

const mockLeaveRequests = [
  {
    id: "l1",
    leaveType:   "Full Day Leave",
    fromDate:    "2026-03-02",
    toDate:      "2026-03-02",
    totalDays:   1,
    reason:      "Family event out of town...",
    status:      "Approved",
    submittedOn: "2026-02-20",
  },
  {
    id: "l2",
    leaveType:   "Sick Leave",
    fromDate:    "2026-03-02",
    toDate:      "2026-03-02",
    totalDays:   1,
    reason:      "Medical appointment and re...",
    status:      "Pending",
    submittedOn: "2026-02-20",
  },
  {
    id: "l3",
    leaveType:   "Short Leave",
    fromDate:    "2026-03-02",
    toDate:      "–",
    totalDays:   "2 Hours",
    reason:      "Bank work",
    status:      "Reject",
    submittedOn: "2026-02-20",
  },
];

const statusConfig = {
  Approved: { bg: "#04C3731A", color: "#04C373" },
  Pending:  { bg: "#AA24931A", color: "#AA2493" },
  Reject:   { bg: "#FF00001A", color: "#FF0000" },
};

const tableHeader = [
  { id: "leaveType",   label: "Leave Type"   },
  { id: "fromDate",    label: "From Date"    },
  { id: "toDate",      label: "To Date"      },
  { id: "totalDays",   label: "Total Days"   },
  { id: "reason",      label: "Reason"       },
  { id: "status",      label: "Status"       },
  { id: "submittedOn", label: "Submitted On" },
  { id: "action",      label: "Action"       },
];

const displayRows = [
  "leaveType",
  "fromDate",
  "toDate",
  "totalDays",
  "reason",
  "leave_status",   // custom chip
  "submittedOn",
  "leave_action",   // custom cancel btn
];

// ── Inline custom cell renderers (add to your dynamicTable cases) ──────────
// case "leave_status":
//   const cfg = statusConfig[row.status] || {};
//   return <Chip label={row.status} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 500, fontSize: 11 }} />;
//
// case "leave_action":
//   return row.status === "Pending"
//     ? <Button variant="gradient" size="small" sx={{ fontSize: 11, px: 2, py: 0.5, borderRadius: "8px" }}
//         onClick={() => console.log("Cancel", row.id)}>Cancel</Button>
//     : null;

const MyLeaveRequests = () => (
  <Box mt={3}>
    <Typography fontSize="14px" fontWeight={600} color="text.primary" mb={1.5}>
      My Leave Requests
    </Typography>

    <Box bgcolor="#fff" borderRadius="16px">
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={mockLeaveRequests}
        displayRows={displayRows}
        isLoading={false}
      />
    </Box>
  </Box>
);

export default MyLeaveRequests;