import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText        from "../../../components/headerText";
import StatsCard         from "../../../components/cards/statsCard";
import UpcomingDeadlines from "../../../components/cards/upcomingDeadlinesCard";
import MyProjectsList    from "./myProjectsList";
import TeamWorkload from "./teamWorkload";

import projectIcon  from "../../../assets/icons/projects-active-icon.svg";
import taskIcon     from "../../../assets/icons/tasks.svg";
import completeIcon from "../../../assets/icons/attendance-icon.svg";
import overdueIcon  from "../../../assets/icons/overdue-time.svg";

const statsData = [
  { id: 1, title: "My Active Projects",  value: "5",  icon: projectIcon                    },
  { id: 2, title: "Total Tasks",         value: "10", icon: taskIcon  },
  { id: 3, title: "Completed This Week", value: "1",  icon: completeIcon                   },
  { id: 4, title: "Overdue Tasks",       value: "0",  icon: overdueIcon                    },
];

const deadlinesData = [
  { id: 1, title: "Implement payment gateway",        assignee: "Marcus Webb",   project: "E-Commerce Platform", priority: "High",   date: "2026-09-20" },
  { id: 2, title: "Design product listing page",      assignee: "Priya Patel",   project: "E-Commerce Platform", priority: "Medium", date: "2026-09-20" },
  { id: 3, title: "Patient records API",              assignee: "Jake Morrison",  project: "Healthcare Portal",   priority: "High",   date: "2026-09-20" },
  { id: 4, title: "Write unit tests for auth module", assignee: "Emily Ross",    project: "Mobile Banking App",  priority: "High",   date: "2026-09-30" },
  { id: 5, title: "Setup CI/CD pipeline",             assignee: "David Kim",     project: "Healthcare Portal",   priority: "Medium", date: "2026-09-30" },
];

const PMDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderText title="Dashboard" subtitle="Dashboard overview" />

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
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

      {/* ── My Projects + Upcoming Deadlines ───────────────────────────── */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <MyProjectsList onViewAll={() => navigate("/pm-projects")} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <UpcomingDeadlines
            deadlines={deadlinesData}
            onViewAll={() => navigate("/pm-tasks")}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
            <TeamWorkload />
        </Grid>
      </Grid>
    </>
  );
};

export default PMDashboard;