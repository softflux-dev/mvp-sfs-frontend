// app/projectManager/dashboard/index.jsx — 
import { useState, useEffect } from "react";
import { Grid, Box, Skeleton } from "@mui/material";
import { useNavigate }         from "react-router-dom";

import HeaderText        from "../../../components/headerText";
import StatsCard         from "../../../components/cards/statsCard";
import UpcomingDeadlines from "../../../components/cards/upcomingDeadlinesCard";
import MyProjectsList    from "./myProjectsList";
import TeamWorkload      from "./teamWorkload";

import {
  getPMDashboardStatsApi,
  getPMProjectsApi,
  getPMUpcomingDeadlinesApi,
} from "../../../api/modules/pmDashboard";

import projectIcon  from "../../../assets/icons/projects-active-icon.svg";
import taskIcon     from "../../../assets/icons/tasks.svg";
import completeIcon from "../../../assets/icons/attendance-icon.svg";
import overdueIcon  from "../../../assets/icons/overdue-time.svg";

const PMDashboard = () => {
  const navigate = useNavigate();

  const [stats,     setStats]     = useState(null);
  const [projects,  setProjects]  = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getPMDashboardStatsApi(),
      getPMProjectsApi(10),
      getPMUpcomingDeadlinesApi(10),
    ]).then(([statsRes, projRes, dlRes]) => {
      if (statsRes?.status === 200 || statsRes?.status === 201) setStats(statsRes.data.data);
      if (projRes?.status  === 200 || projRes?.status  === 201) setProjects(projRes.data.data.projects || []);
      if (dlRes?.status    === 200 || dlRes?.status    === 201) setDeadlines(dlRes.data.data.deadlines || []);
    }).finally(() => setLoading(false));
  }, []);

  const statsData = [
    { id: 1, title: "My Active Projects",  value: String(stats?.activeProjects    ?? "0"), icon: projectIcon  },
    { id: 2, title: "Total Tasks",         value: String(stats?.totalTasks         ?? "0"), icon: taskIcon     },
    { id: 3, title: "Completed This Week", value: String(stats?.completedThisWeek ?? "0"), icon: completeIcon },
    { id: 4, title: "Overdue Tasks",       value: String(stats?.overdueTasks       ?? "0"), icon: overdueIcon  },
  ];

  return (
    <>
      <HeaderText title="Dashboard" subtitle="Project manager overview" />

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

      {/* My Projects + Upcoming Deadlines */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <MyProjectsList
            projects={projects}
            loading={loading}
            onViewAll={() => navigate("/my-projects")}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <UpcomingDeadlines
            deadlines={deadlines}
            onViewAll={() => navigate("/task-management")}
          />
        </Grid>
      </Grid>

      {/* Team Workload — fetches its own data with project filter */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <TeamWorkload />
        </Grid>
      </Grid>
    </>
  );
};

export default PMDashboard;