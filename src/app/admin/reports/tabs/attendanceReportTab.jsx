// tabs/attendanceReportTab.jsx
import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import PaginatedTable from "../../../../components/dynamicTable";

// ── Mock data ──────────────────────────────────────────────────────────────
const mockAttendance = [
  { id: 1,  name: "Ali Hassan",   present: 18, absent: 0, late: 0, leave: 0, attendanceRate: 93 },
  { id: 2,  name: "Sara Ahmed",   present: 20, absent: 1, late: 2, leave: 1, attendanceRate: 87 },
  { id: 3,  name: "Omar Farooq",  present: 20, absent: 0, late: 1, leave: 0, attendanceRate: 87 },
  { id: 4,  name: "Fatima Khan",  present: 18, absent: 1, late: 1, leave: 1, attendanceRate: 87 },
  { id: 5,  name: "Bilal Raza",   present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 0  },
  { id: 6,  name: "Ayesha Malik", present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 0  },
  { id: 7,  name: "Usman Shah",   present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 87 },
  { id: 8,  name: "Ali Hassan",   present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 87 },
  { id: 9,  name: "Sara Ahmed",   present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 0  },
  { id: 10, name: "Omar Farooq",  present: 21, absent: 0, late: 1, leave: 0, attendanceRate: 0  },
];

const tableHeader = [
  { id: "name",           label: "Employee"     },
  { id: "present",        label: "Present"      },
  { id: "absent",         label: "Absent"       },
  { id: "late",           label: "Late"         },
  { id: "leave",          label: "Leave"        },
  { id: "attendanceRate", label: "Attendance %" },
];

const displayRows = [
  "att_report_member",
  "att_report_present",
  "att_report_absent",
  "att_report_late",
  "att_report_leave",
  "att_report_rate",
];

const AttendanceReportTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <Box>
      {/* ── Month Navigator ──────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconButton
          onClick={handlePrev}
          size="small"
          sx={{
            bgcolor: "#F5F5F5",
            borderRadius: "8px",
            width: 32,
            height: 32,
            "&:hover": { bgcolor: "#E0E0E0" },
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        <Box
          sx={{
            px: 2,
            py: 0.75,
            bgcolor: "#F5F5F5",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Calendar size={14} color="#67768B" />
          <Typography fontSize="13px" fontWeight={600} color="text.primary">
            {monthName} {year}
          </Typography>
        </Box>

        <IconButton
          onClick={handleNext}
          size="small"
          sx={{
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            borderRadius: "8px",
            width: 32,
            height: 32,
            "&:hover": { opacity: 0.9 },
          }}
        >
          <ChevronRight size={16} color="#fff" />
        </IconButton>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockAttendance}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>
    </Box>
  );
};

export default AttendanceReportTab;