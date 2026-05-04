import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import Filter         from "../../../../components/filterBar/filter";
import PaginatedTable from "../../../../components/dynamicTable";

const mockLeaves = [
  { id: 1, name: "Ali Hassan",  leaveType: "Annual",    fromDate: "Oct 1, 2025", toDate: "Jun 30, 2026", days: 3, approvedBy: "—",           leaveStatus: "Pending"  },
  { id: 2, name: "Sara Ahmed",  leaveType: "Sick",      fromDate: "Oct 1, 2025", toDate: "Jun 30, 2026", days: 1, approvedBy: "Ayesha Malik", leaveStatus: "Approved" },
  { id: 3, name: "Omar Farooq", leaveType: "Emergency", fromDate: "Oct 1, 2025", toDate: "Jun 30, 2026", days: 2, approvedBy: "—",           leaveStatus: "Pending"  },
  { id: 4, name: "Fatima Khan", leaveType: "Annual",    fromDate: "Oct 1, 2025", toDate: "Jun 30, 2026", days: 5, approvedBy: "—",           leaveStatus: "Rejected" },
];

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

const LeaveReportTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <Box>
      {/* ── Month Navigator + Filters ─────────────────────────────────── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>

        {/* Month nav */}
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

        {/* Filters */}
        <Filter mode="leave_report" onFilterChange={(f) => console.log(f)} />
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockLeaves}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>
    </Box>
  );
};

export default LeaveReportTab;