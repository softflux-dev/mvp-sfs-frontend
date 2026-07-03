// Dashboard.jsx
import { useState, useEffect } from "react";
import { Grid, Box, Typography, CircularProgress , Skeleton} from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText            from "../../../components/headerText";
import StatsCard             from "../../../components/cards/statsCard";
import ProjectProgressChart  from "./projectProgressChart";
import EmployeeProductivityChart from "./employeeProductivityChart";
import AttendanceOverviewChart   from "./attendanceOverviewChart";
import TaskStatusChart       from "./taskStatusChart";
import RecentActivity        from "./recentActivity";
import UpcomingDeadlines     from "../../../components/cards/upcomingDeadlinesCard";

import {
  getDashboardStatsApi,
  getRecentActivityApi,
  getUpcomingDeadlinesApi,
} from "../../../api/modules/dashboard";

import enrollIcon    from "../../../assets/icons/employees.svg";
import completeIcon  from "../../../assets/icons/task-completion.svg";
import progressIcon  from "../../../assets/icons/complete-icon.svg";
import attendanceIcon from "../../../assets/icons/attendance-icon.svg";
import leaveIcon     from "../../../assets/icons/time-icon.svg";
import overdueIcon   from "../../../assets/icons/overdue-time.svg";
import projectIcon   from "../../../assets/icons/projects-active-icon.svg";
import taskIcon      from "../../../assets/icons/tasks.svg";
import employeeIconWhite    from "../../../assets/icons/employee-active.svg";
import projectIconWhite     from "../../../assets/icons/projects-active.svg";
import taskIconWhite        from "../../../assets/icons/tasks-active.svg";
import completionIconWhite  from "../../../assets/icons/completion-white.svg";
import completedIconWhite   from "../../../assets/icons/completed-white.svg";
import attendanceIconWhite  from "../../../assets/icons/attendance-active.svg";
import leaveIconWhite       from "../../../assets/icons/pending-white.svg";
import overdueIconWhite     from "../../../assets/icons/overdue-white.svg";



const Dashboard = () => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const [stats,     setStats]     = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStatsApi(),
      getRecentActivityApi(20),
      getUpcomingDeadlinesApi(10),
    ]).then(([statsRes, actRes, dlRes]) => {
      if (statsRes?.status === 200 || statsRes?.status === 201) {
        setStats(statsRes.data.data);
      }
      if (actRes?.status === 200 || actRes?.status === 201) {
        setActivity(actRes.data.data.activity || []);
      }
      if (dlRes?.status === 200 || dlRes?.status === 201) {
        setDeadlines(dlRes.data.data.deadlines || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const statsData = [
    {
      id: 1, title: "Total Employees",
     value: String(stats?.totalEmployees ?? "0"),  
      description: "Active employees", icon: enrollIcon, iconHover: employeeIconWhite,
      onClick: () => navigate("/employees"),
    },
    {
      id: 2, title: "Active Projects",
      value:  String(stats?.activeProjects ?? "0"),
      description: "Not yet completed", icon: projectIcon, iconHover: projectIconWhite,
      onClick: () => navigate("/projects"),
    },
    {
      id: 3, title: "Total Tasks",
      value: String(stats?.totalTasks ?? "0"),
      description: "Across all projects", icon: taskIcon, iconHover: taskIconWhite,
    },
    {
      id: 4, title: "Task Completion Rate",
      value:  (stats?.taskCompletionRate ?? "0"),
      description: "Completed vs total", icon: completeIcon, iconHover: completionIconWhite,
    },
    {
      id: 5, title: "Completed Projects",
      value: String(stats?.completedProjects ?? "0"),
      description: "All time", icon: progressIcon, iconHover: completedIconWhite,
      onClick: () => navigate("/projects"),
    },
    {
      id: 6, title: "Avg Attendance Rate",
      value:  (stats?.avgAttendanceRate ?? "0"),
      description: "This month", icon: attendanceIcon, iconHover: attendanceIconWhite,
    },
    {
      id: 7, title: "Pending Leave Requests",
      value:  String(stats?.pendingLeaves ?? "0"),
      description: "Awaiting review", icon: leaveIcon, iconHover: leaveIconWhite,
      onClick: () => navigate("/leave-management"),
    },
    {
      id: 8, title: "Overdue Tasks",
      value: String(stats?.overdueTasks ?? "0"),
      description: "Needs attention", icon: overdueIcon, iconHover: overdueIconWhite,
    },
  ];
  const skeletonSx = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
  },
};

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="flex-start">
        <Grid item>
          <HeaderText title="Dashboard" subtitle="Company overview and operations summary" />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="text.secondary" mt={4}>
            {today}
          </Typography>
        </Grid>
      </Grid>

      {/* Stats Row */}

   <Grid container spacing={3} sx={{ mt: 2 }}>
      {statsData.map((stat) => (
        <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={stat.id}>
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
            <StatsCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              iconHover={stat.iconHover}
              onClick={stat.onClick}
            />
          )}
        </Grid>
      ))}
    </Grid>

      {/* Project Progress */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <ProjectProgressChart />
        </Grid>
      </Grid>

      {/* Employee Productivity */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <EmployeeProductivityChart />
        </Grid>
      </Grid>

      {/* Attendance + Task Status | Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 2 }} alignItems="stretch">
        <Grid item size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            <AttendanceOverviewChart />
            <TaskStatusChart />
          </Box>
        </Grid>
        <Grid item size={{ xs: 12, md: 7 }}>
          <RecentActivity activity={activity} loading={loading} />
        </Grid>
      </Grid>

      {/* Upcoming Deadlines */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <UpcomingDeadlines deadlines={deadlines} />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;