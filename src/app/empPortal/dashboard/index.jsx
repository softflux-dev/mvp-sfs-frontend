import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText        from "../../../components/headerText";
import StatsCard         from "../../../components/cards/statsCard";
import AttendanceTimer   from "./attendanceTimer";
import UpcomingDeadlines from "../../../components/cards/upcomingDeadlinesCard";
import EmpAttendance     from "./empAttendance";
import MonthlyPerformance from "./monthlyPerformance";

import taskIcon     from "../../../assets/icons/tasks.svg";
import completeIcon from "../../../assets/icons/complete-icon.svg";
import progressIcon from "../../../assets/icons/attendance-icon.svg";
import pendingIcon  from "../../../assets/icons/time-icon.svg";

const statsData = [
  { id: 1, title: "Tasks Assigned",  value: "24", icon: taskIcon                         },
  { id: 2, title: "Tasks Completed", value: "10", icon: completeIcon },
  { id: 3, title: "In Progress",     value: "1",  icon: progressIcon                     },
  { id: 4, title: "Pending",         value: "0",  icon: pendingIcon                      },
];

const deadlinesData = [
  { id: 1, title: "Q3 Financial Report",              assignee: "Marcus Webb",  project: "E-Commerce Platform", date: "2026-03-20", priority: "High"   },
  { id: 2, title: "Design product listing page",      assignee: "Priya Patel",  project: "E-Commerce Platform", date: "2026-03-25", priority: "Medium" },
  { id: 3, title: "Patient records API",              assignee: "Jake Morrison", project: "Healthcare Portal",   date: "2026-03-25", priority: "High"   },
  { id: 4, title: "Write unit tests for auth module", assignee: "Emily Ross",   project: "Mobile Banking App",  date: "2026-03-25", priority: "High"   },
  { id: 5, title: "Setup CI/CD pipeline",             assignee: "David Kim",    project: "Healthcare Portal",   date: "2026-03-30", priority: "Medium" },
];

const EmpDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderText title="Dashboard" subtitle="Your personal workspace overview" />

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
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

    

      {/* ── Attendance Chart + Monthly Performance ────────────────────────── */}
      <Grid container spacing={2} sx={{ mt: 3 }} alignItems="flex-start">
        <Grid item size={{ xs: 12, md: 6 }}>
          <EmpAttendance onViewFull={() => navigate("/emp/attendance")} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <MonthlyPerformance />
        </Grid>
      </Grid>

        {/* ── Attendance Timer + Upcoming Deadlines ─────────────────────────── */}
      <Grid container spacing={2} sx={{ mt: 3 }} alignItems="flex-start">
{/*         <Grid item size={{ xs: 12, md: 5 }}>
          <AttendanceTimer />
        </Grid> */}
        <Grid item size={{ xs: 12 }}>
          <UpcomingDeadlines
            deadlines={deadlinesData}
            onViewAll={() => navigate("/emp/tasks")}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EmpDashboard;