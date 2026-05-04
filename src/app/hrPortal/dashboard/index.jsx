// app/hrPortal/dashboard/index.jsx
import { Grid, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderText        from "../../../components/headerText";
import StatsCard         from "../../../components/cards/statsCard";
import AttendanceOverview from "./attendanceOverview";
import RecentLeaveRequests from "./recentLeaveRequests";
import UpcomingPayroll   from "./upcomingPayroll";

import employeesIcon  from "../../../assets/icons/employees.svg";
import presentIcon    from "../../../assets/icons/complete-icon-white.svg";
import leaveIcon      from "../../../assets/icons/attendance-icon.svg";
import pendingIcon    from "../../../assets/icons/time-icon.svg";

const statsData = [
  {
    id: 1,
    title: "Total Employees",
    value: "12",
    icon: employeesIcon,
  },
  {
    id: 2,
    title: "Present Today",
    value: "6 (50%)",
    icon: presentIcon,
    isHighlighted: true,
  },
  {
    id: 3,
    title: "On Leave Today",
    value: "2",
    icon: leaveIcon,
  },
  {
    id: 4,
    title: "Pending Requests",
    value: "3",
    icon: pendingIcon,
  },
];

const HRDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderText
        title="HR Dashboard"
        subtitle="Employee and HR operations overview"
      />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              isHighlighted={stat.isHighlighted}
            />
          </Grid>
        ))}
      </Grid>

      {/* Main content row */}
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="flex-start">

        {/* LEFT: Attendance Overview + Upcoming Payroll stacked */}
        <Grid item size={{ xs: 12, md: 5 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <AttendanceOverview />
            <UpcomingPayroll onGoToPayroll={() => navigate("/hr/payroll")} />
          </Box>
        </Grid>

        {/* RIGHT: Recent Leave Requests */}
        <Grid item size={{ xs: 12, md: 7 }}>
          <RecentLeaveRequests />
        </Grid>

      </Grid>
    </>
  );
};

export default HRDashboard;