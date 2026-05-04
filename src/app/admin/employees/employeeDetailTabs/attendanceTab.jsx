// employees/employeeDetailTabs/attendanceTab.jsx
import { Box, Grid, Typography } from "@mui/material";
import StatsCard from "../../../../components/cards/statsCard";
import AttendanceCalendar from "./attendanceCalendar";
import AttendanceLogTable from "./attendanceLogTable";

import presentIcon from "../../../../assets/icons/attendance-icon.svg";
import absentIcon  from "../../../../assets/icons/overdue-time.svg";
import lateIcon    from "../../../../assets/icons/time-icon.svg";
import leaveIcon   from "../../../../assets/icons/complete-icon.svg";

const AttendanceTab = ({ employee = {} }) => {
  const statsData = [
    {
      id: 1,
      title: "Present",
      value: "18",
      icon: presentIcon,
    },
    {
      id: 2,
      title: "Absent",
      value: "3",
      icon: absentIcon,
      isHighlighted: true,
    },
    {
      id: 3,
      title: "Late",
      value: "2",
      icon: lateIcon,
    },
    {
      id: 4,
      title: "Leave",
      value: "0",
      icon: leaveIcon,
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              isHighlighted={stat.isHighlighted}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Calendar ──────────────────────────────────────────────────────── */}
      <AttendanceCalendar employee={employee} />

      {/* ── Attendance Log Table ──────────────────────────────────────────── */}
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mt={3} mb={1.5}>
        Attendance Log
      </Typography>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <AttendanceLogTable />
      </Box>

    </Box>
  );
};

export default AttendanceTab;