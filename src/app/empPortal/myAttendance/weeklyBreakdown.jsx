// src/app/empPortal/myAttendance/weeklyBreakdown.jsx
import { Box, Typography } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

const statusConfig = {
  Present:   { bg: "#04C3731A", color: "#04C373" },
  Absent:    { bg: "#FF00001A", color: "#FF0000" },
  Late:      { bg: "#AA24931A", color: "#AA2493" },
  Leave:     { bg: "#0051FF1A", color: "#2B6EFF" },
  Holiday:   { bg: "#AA24931A", color: "#AA2493" },
  // Replaces the old "Weekend" — the backend now labels non-working days
  // from Settings → Working Days rather than assuming Sat/Sun.
  "Off Day": { bg: "#F5F5F5",   color: "#888888" },
};

const tableHeader = [
  { id: "day",          label: "Day"       },
  { id: "date",         label: "Date"      },
  { id: "checkIn",      label: "Check-In"  },
  { id: "checkOut",     label: "Check-Out" },
  { id: "onSiteHours",  label: "On-Site"   },
  { id: "offSiteHours", label: "Off-Site"  },
  { id: "hours",        label: "Total"     },
  { id: "status",       label: "Status"    },
];

const displayRows = [
  "day",
  "date",
  "checkIn",
  "checkOut",
  "onSiteHours",
  "offSiteHours",
  "hours",
  "att_status",
];

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
        hidepagination
      />
    </Box>
  </Box>
);

export { statusConfig };
export default WeeklyBreakdown;