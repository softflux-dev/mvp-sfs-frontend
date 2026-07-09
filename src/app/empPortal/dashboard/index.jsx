// app/empPortal/dashboard/index.jsx — 
import { useState, useEffect } from "react";
import { Grid, Box, Skeleton } from "@mui/material";
import { useNavigate }         from "react-router-dom";

import HeaderText        from "../../../components/headerText";
import StatsCard         from "../../../components/cards/statsCard";
import UpcomingDeadlines from "../../../components/cards/upcomingDeadlinesCard";
import EmpAttendance     from "./empAttendance";
import MonthlyPerformance from "./monthlyPerformance";

import {
  getEmpDashboardStatsApi,
  getEmpAttendanceSummaryApi,
  getEmpUpcomingTasksApi,
  getEmpMonthlyPerformanceApi,
} from "../../../api/modules/empDashboard";

import taskIcon     from "../../../assets/icons/tasks.svg";
import completeIcon from "../../../assets/icons/complete-icon.svg";
import progressIcon from "../../../assets/icons/attendance-icon.svg";
import pendingIcon  from "../../../assets/icons/time-icon.svg";

const EmpDashboard = () => {
  const navigate = useNavigate();

  const [stats,       setStats]       = useState(null);
  const [attendance,  setAttendance]  = useState(null);
  const [deadlines,   setDeadlines]   = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getEmpDashboardStatsApi(),
      getEmpAttendanceSummaryApi(),
      getEmpUpcomingTasksApi(10),
      getEmpMonthlyPerformanceApi(),
    ]).then(([statsRes, attRes, dlRes, perfRes]) => {
      if (statsRes?.status === 200 || statsRes?.status === 201) setStats(statsRes.data.data);
      if (attRes?.status  === 200 || attRes?.status  === 201) setAttendance(attRes.data.data);
      if (dlRes?.status   === 200 || dlRes?.status   === 201) setDeadlines(dlRes.data.data.tasks || []);
      if (perfRes?.status === 200 || perfRes?.status === 201) setPerformance(perfRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const statsData = [
    { id: 1, title: "Tasks Assigned",  value: String(stats?.totalAssigned ?? "0"), icon: taskIcon     },
    { id: 2, title: "Tasks Completed", value: String(stats?.completed     ?? "0"), icon: completeIcon },
    { id: 3, title: "In Progress",     value: String(stats?.inProgress    ?? "0"), icon: progressIcon },
    { id: 4, title: "Pending",         value: String(stats?.pending       ?? "0"), icon: pendingIcon  },
  ];

  return (
    <>
      <HeaderText title="Dashboard" subtitle="Your personal workspace overview" />

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            {loading ? (
              <Box sx={{ backgroundColor: "#fff", borderRadius: "30px", p: 2, height: "130px" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Skeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="55%" height={16} />
              </Box>
            ) : (
              <StatsCard title={stat.title} value={stat.value} icon={stat.icon} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Attendance Chart + Monthly Performance */}
      <Grid container spacing={2} sx={{ mt: 3 }} alignItems="flex-start">
        <Grid item size={{ xs: 12, md: 6 }}>
          <EmpAttendance
            attendance={attendance}
            loading={loading}
            onViewFull={() => navigate("/emp-attendance")}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <MonthlyPerformance
            performance={performance}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Upcoming Task Deadlines */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item size={{ xs: 12 }}>
          <UpcomingDeadlines
            deadlines={deadlines}
            onViewAll={() => navigate("/my-tasks")}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EmpDashboard;