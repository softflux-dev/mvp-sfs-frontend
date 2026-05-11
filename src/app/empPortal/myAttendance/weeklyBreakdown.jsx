import { Box, Typography, Chip } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

const statusConfig = {
  Present: { bg: "#04C3731A", color: "#04C373" },
  Absent:  { bg: "#FF00001A", color: "#FF0000" },
  Late:    { bg: "#AA24931A", color: "#AA2493" },
  Leave:   { bg: "#0051FF1A", color: "#2B6EFF" },
  Weekend: { bg: "#F5F5F5",   color: "#888888" },
};

const tableHeader = [
  { id: "day",      label: "Day"       },
  { id: "date",     label: "Date"      },
  { id: "checkIn",  label: "Check-In"  },
  { id: "checkOut", label: "Check-Out" },
  { id: "hours",    label: "Hours"     },
  { id: "status",   label: "Status"    },
];

const displayRows = ["day", "date", "checkIn", "checkOut", "hours", "att_status"];

const WeeklyBreakdown = ({ breakdown }) => (
  <Box mt={3}>
    <Typography fontSize="14px" fontWeight={600} color="text.primary" mb={1.5}>
      Weekly Breakdown
    </Typography>
    <Box bgcolor="#fff" borderRadius="16px">
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={breakdown}
        displayRows={displayRows}
        isLoading={false}
      />
    </Box>
  </Box>
);

export { statusConfig };
export default WeeklyBreakdown;