// Dashboard.jsx
import { Grid, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText from "../../../components/headerText";
import StatsCard from "../../../components/cards/statsCard";
import ProjectProgressChart from "./projectProgressChart";
import EmployeeProductivityChart from "./employeeProductivityChart";
import AttendanceOverviewChart from "./attendanceOverviewChart";
import TaskStatusChart from "./taskStatusChart";
import RecentActivity from "./recentActivity";
import UpcomingDeadlines from "../../../components/cards/upcomingDeadlinesCard";

import enrollIcon from "../../../assets/icons/employees.svg";
import completeIcon from "../../../assets/icons/task-completion.svg";
import progressIcon from "../../../assets/icons/complete-icon.svg";
import attendanceIcon from "../../../assets/icons/attendance-icon.svg";
import leaveIcon from "../../../assets/icons/time-icon.svg";
import overdueIcon from "../../../assets/icons/overdue-time.svg";
import projectIcon from "../../../assets/icons/projects-active-icon.svg";
import taskIcon from "../../../assets/icons/tasks.svg";

const Dashboard = () => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

 // Dashboard.jsx — only the statsData array changes
const statsData = [
  {
    id: 1,
    title: "Total Employees",
    value: "12",
    description: "from last month",
    changePercentage: "+12%",
    icon: enrollIcon,
  },
  {
    id: 2,
    title: "Active Projects",
    value: "3",
    description: "from last month",
    changePercentage: "+8%",
    icon: projectIcon,
    
  },
  {
    id: 3,
    title: "Total Tasks",
    value: "12",
    description: "from last month",
    changePercentage: "+8%",
    icon: taskIcon,
  },
  {
    id: 4,
    title: "Task Completion Rate",
    value: "20%",
    description: "from last month",
    changePercentage: "+5%",
    icon: completeIcon,
  },
  {
    id: 5,
    title: "Completed Projects",
    value: "12",
    description: "from last month",
    changePercentage: "+12%",
    icon: progressIcon,
  },
  {
    id: 6,
    title: "Attendance Today",
    value: "87%",
    description: "7/8 present",
    icon: attendanceIcon,
  },
  {
    id: 7,
    title: "Pending Leave Requests",
    value: "12",
    description: "Click to manage",
    icon: leaveIcon,
  },
  {
    id: 8,
    title: "Overdue Tasks",
    value: "20%",
    description: "Needs attention",
    icon: overdueIcon,
  },
];
const deadlinesData = [
  { id: 1, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High",   date: "Mar 9" },
  { id: 2, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "Medium", date: "Mar 9" },
  { id: 3, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High",   date: "Mar 9" },
  { id: 4, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High",   date: "Mar 9" },
  { id: 5, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High",   date: "Mar 9" },
  { id: 6, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "Medium", date: "Mar 9" },
  { id: 7, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High",   date: "Mar 9" },
];

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
            <StatsCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              changePercentage={stat.changePercentage} 
              icon={stat.icon}
              isHighlighted={stat.isHighlighted}
              onClick={stat.onClick}
            />
          </Grid>
        ))}
      </Grid>

      {/* Chart Row — Project Progress full width */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <ProjectProgressChart />
        </Grid>
      </Grid>

      {/* Chart Row — Employee Productivity full width */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <EmployeeProductivityChart />
        </Grid>
      </Grid>

      {/* Charts Row 2 — Attendance + Task Status */}
      <Grid container spacing={3} sx={{ mt: 2 }} alignItems="stretch">

        {/* LEFT COLUMN: Attendance + Task Status stacked */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            <AttendanceOverviewChart />
            <TaskStatusChart />
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Recent Activity */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <RecentActivity />
        </Grid>

      </Grid>

      {/* Upcoming Deadlines — full width */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item size={{ xs: 12 }}>
          <UpcomingDeadlines
            deadlines={deadlinesData}
           
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;