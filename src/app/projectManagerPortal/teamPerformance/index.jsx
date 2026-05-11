import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText     from "../../../components/headerText";
import StatsCard      from "../../../components/cards/statsCard";
import Filter         from "../../../components/filterBar/filter";
import PaginatedTable from "../../../components/dynamicTable";
import WorkloadDistribution from "./workloadDistribution";
import DelayedTasks         from "./delayedTasks";

import taskIcon     from "../../../assets/icons/tasks.svg";
import overdueIcon  from "../../../assets/icons/overdue-time.svg";
import completeIcon from "../../../assets/icons/attendance-icon.svg";

// ── Mock data ──────────────────────────────────────────────────────────────
const statsData = [
  { id: 1, title: "Avg Completion Rate",    value: "8%",  icon: completeIcon },
  { id: 2, title: "Delayed Tasks",          value: "0",   icon: overdueIcon },
  { id: 3, title: "Total Tasks This Period",value: "10",  icon: taskIcon     },
];

const mockTeamPerformance = [
  { id: 1,  name: "Ali Hassan",  avatar: "", role: "Engineering",    totalTasks: 2, completed: 1, active: 1, overdue: 0, completionRate: 87  },
  { id: 2,  name: "Sara Ahmed",  avatar: "", role: "Engineering",    totalTasks: 0, completed: 0, active: 0, overdue: 0, completionRate: 87  },
  { id: 3,  name: "Omar Farooq", avatar: "", role: "Design",         totalTasks: 3, completed: 1, active: 0, overdue: 2, completionRate: 87  },
  { id: 4,  name: "Fatima Khan", avatar: "", role: "QA",             totalTasks: 2, completed: 0, active: 1, overdue: 0, completionRate: 87  },
  { id: 5,  name: "Bilal Raza",  avatar: "", role: "Engineering",    totalTasks: 1, completed: 0, active: 0, overdue: 0, completionRate: 0   },
  { id: 6,  name: "Ali Azeem",   avatar: "", role: "UI/UX Designer", totalTasks: 0, completed: 0, active: 0, overdue: 0, completionRate: 0   },
  { id: 7,  name: "Usman Shah",  avatar: "", role: "HR",             totalTasks: 2, completed: 0, active: 1, overdue: 1, completionRate: 87  },
  { id: 8,  name: "Zara Malik",  avatar: "", role: "Design",         totalTasks: 4, completed: 2, active: 1, overdue: 1, completionRate: 50  },
  { id: 9,  name: "Ahmed Raza",  avatar: "", role: "Engineering",    totalTasks: 5, completed: 4, active: 1, overdue: 0, completionRate: 80  },
  { id: 10, name: "Nida Hayat",  avatar: "", role: "QA",             totalTasks: 3, completed: 3, active: 0, overdue: 0, completionRate: 100 },
];

const tableHeader = [
  { id: "member",         label: "Team Member"     },
  { id: "role",           label: "Role"            },
  { id: "totalTasks",     label: "Total Tasks"     },
  { id: "completed",      label: "Completed"       },
  { id: "active",         label: "Active"          },
  { id: "overdue",        label: "Overdue"         },
  { id: "completionRate", label: "Completion Rate" },
];

const displayRows = [
  "tp_member",
  "tp_role",
  "tp_total_tasks",
  "tp_completed",
  "tp_active",
  "tp_overdue",
  "tp_completion_rate",
];

// ── Component ──────────────────────────────────────────────────────────────
const TeamPerformance = () => {
  const [filters, setFilters] = useState({});

  return (
    <>
      {/* ── Header + Filter ─────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Team Performance" subtitle="Track your team's productivity and task metrics" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <Filter mode="team_performance" onFilterChange={(f) => setFilters(f)} />
          </Box>
        </Grid>
      </Grid>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={stat.id}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              isHighlighted={stat.isHighlighted}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Team Productivity Table ─────────────────────────────────────── */}
      <Box mt={3} bgcolor="#fff" borderRadius="25px" p={2}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockTeamPerformance}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>

      {/* ── Workload Distribution + Delayed Tasks ───────────────────────── */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <WorkloadDistribution />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <DelayedTasks />
        </Grid>
      </Grid>
    </>
  );
};

export default TeamPerformance;