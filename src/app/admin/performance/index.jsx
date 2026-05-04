// app/admin/performance/index.jsx
import { Box, Grid, Typography } from "@mui/material";
import { useState } from "react";

import HeaderText                from "../../../components/headerText";
import StatsCard                 from "../../../components/cards/statsCard";
import Filter                    from "../../../components/filterBar/filter";
import PaginatedTable            from "../../../components/dynamicTable";
import CustomButton              from "../../../components/customButton";
import WorkloadDistributionChart from "./workloadDistributionChart";
import TaskCompletionSpeedChart  from "./taskCompletionSpeedChart";

import completionIcon from "../../../assets/icons/task-completion.svg";
import overdueIcon    from "../../../assets/icons/overdue-time.svg";
import performerIcon  from "../../../assets/icons/employees.svg";
import balanceIcon    from "../../../assets/icons/attendance-icon.svg";
import viewIcon       from "../../../assets/icons/view.svg";
import exportIcon    from "../../../assets/icons/upload-doc-icon.svg";

// ── Mock performance data ─────────────────────────────────────────────────────
const mockPerformance = [
  { id: 1, name: "Ali Hassan",   avatar: "", department: "Engineering",    assigned: 2, completed: 1, inProgress: 1, delayed: 0, avgTime: "1.6d", completionRate: 87 },
  { id: 2, name: "Sara Ahmed",   avatar: "", department: "Engineering",    assigned: 0, completed: 0, inProgress: 0, delayed: 0, avgTime: "2.5d", completionRate: 87 },
  { id: 3, name: "Omar Farooq",  avatar: "", department: "Design",         assigned: 3, completed: 1, inProgress: 0, delayed: 2, avgTime: "1.4d", completionRate: 87 },
  { id: 4, name: "Fatima Khan",  avatar: "", department: "QA",             assigned: 2, completed: 0, inProgress: 1, delayed: 0, avgTime: "2.4d", completionRate: 87 },
  { id: 5, name: "Bilal Raza",   avatar: "", department: "Engineering",    assigned: 1, completed: 0, inProgress: 0, delayed: 0, avgTime: "2.0d", completionRate: 0  },
  { id: 6, name: "Ali Azeem",    avatar: "", department: "UI/UX Designer", assigned: 0, completed: 0, inProgress: 0, delayed: 0, avgTime: "1.0d", completionRate: 0  },
  { id: 7, name: "Usman Shah",   avatar: "", department: "HR",             assigned: 2, completed: 0, inProgress: 1, delayed: 1, avgTime: "3.6d", completionRate: 87 },
];

// ── Mock delayed tasks data ───────────────────────────────────────────────────
const mockDelayedTasks = [
  { id: 1, taskName: "Build API Endpoints",       assigneeName: "Ali Hassan",  assigneeAvatar: "", project: "E-Commerce Platform",  deadline: "2026-03-15", daysOverdue: 2 },
  { id: 2, taskName: "Design Product Pages",      assigneeName: "Omar Farooq", assigneeAvatar: "", project: "E-Commerce Platform",  deadline: "2026-03-12", daysOverdue: 5 },
  { id: 3, taskName: "Database Schema Design",    assigneeName: "Usman Shah",  assigneeAvatar: "", project: "Mobile Banking App",    deadline: "2026-03-10", daysOverdue: 7 },
  { id: 4, taskName: "Mobile Responsive Design",  assigneeName: "Omar Farooq", assigneeAvatar: "", project: "CMS Website Redesign",  deadline: "2026-03-09", daysOverdue: 8 },
];

// ── Performance table config ──────────────────────────────────────────────────
const perfTableHeader = [
  { id: "name",           label: "Employee"    },
  { id: "department",     label: "Department"  },
  { id: "assigned",       label: "Assigned"    },
  { id: "completed",      label: "Completed"   },
  { id: "inProgress",     label: "In Progress" },
  { id: "delayed",        label: "Overdue"     },
  { id: "avgTime",        label: "Avg Time"    },
  { id: "completionRate", label: "Rate"        },
  { id: "actions",        label: "Actions"     },
];

const perfDisplayRows = [
  "perf_member",
  "department",
  "perf_assigned",
  "perf_completed",
  "perf_in_progress",
  "perf_delayed",
  "perf_avg_time",
  "perf_completion_rate",
  "perf_view",
];

// ── Delayed tasks table config ────────────────────────────────────────────────
const delayedTableHeader = [
  { id: "taskName",    label: "Task"         },
  { id: "assignee",    label: "Assignee"     },
  { id: "project",     label: "Project"      },
  { id: "deadline",    label: "Deadline"     },
  { id: "daysOverdue", label: "Days Overdue" },
];

const delayedDisplayRows = [
  "task_name",
  "task_assignee",
  "task_project",
  "deadline",
  "perf_days_overdue",
];

const Performance = () => {
  const [filters, setFilters] = useState({});

  const statsData = [
    {
      id: 1,
      title: "Avg Completion Rate",
      value: "12%",
      description: "↑ 12% from last month",
      icon: completionIcon,
    },
    {
      id: 2,
      title: "Overdue Tasks",
      value: "3",
      description: "Needs attention",
      icon: overdueIcon,
      isHighlighted: true,
    },
    {
      id: 3,
      title: "Top Performer",
      value: "Ali Hassan",
      description: "↑ 50% completion",
      icon: performerIcon,
    },
    {
      id: 4,
      title: "Workload Balance",
      value: "Good",
      description: "Evenly distributed",
      icon: balanceIcon,
    },
  ];

  const filteredData = mockPerformance.filter((emp) => {
    const search = filters.search?.toLowerCase() || "";
    const dept   = filters.department || "";
    const matchSearch = !search || emp.name.toLowerCase().includes(search);
    const matchDept   = !dept   || emp.department.toLowerCase() === dept.toLowerCase();
    return matchSearch && matchDept;
  });

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid item size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Performance Monitoring"
            subtitle="Track employee productivity and project delivery"
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Export Report"
              variant="gradient"
             startIcon={<img src={exportIcon} alt="Export" />}
              handlePressBtn={() => console.log("Export")}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
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

      {/* ── Filter ───────────────────────────────────────────────────────── */}
      <Filter mode="performance" onFilterChange={setFilters} />

      {/* ── Employee Performance Table ────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={perfTableHeader}
          tableData={filteredData}
          displayRows={perfDisplayRows}
          viewIcon={viewIcon}
          isLoading={false}
        />
      </Box>

      {/* ── Charts Row — Workload + Task Completion Speed ─────────────────── */}
      <Grid container spacing={3} sx={{ mt: 2 }} alignItems="stretch">
        <Grid item size={{ xs: 12, md: 6 }}>
          <WorkloadDistributionChart />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TaskCompletionSpeedChart />
        </Grid>
      </Grid>

      {/* ── Delayed Tasks Table ───────────────────────────────────────────── */}
      <Box mt={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={2}>
          Delayed Tasks
        </Typography>
        <Box bgcolor="#fff" borderRadius="25px" p={1}>
          <PaginatedTable
            tableHeader={delayedTableHeader}
            tableData={mockDelayedTasks}
            displayRows={delayedDisplayRows}
            isLoading={false}
            showPagination={false}
          />
        </Box>
      </Box>
    </>
  );
};

export default Performance;