// projectDetailTabs/performanceTab.jsx
import { Box, Grid } from "@mui/material";
import PerformanceProjectProgressChart from "./projectProgressChart";
import DelayedTasks                    from "./delayedTasks";
import WorkloadDistribution            from "./workloadDistribution";
import PaginatedTable                  from "../../../../../components/dynamicTable";

// ── Mock member performance data ──────────────────────────────────────────────
const memberData = [
  { id: 1, name: "Priya Sharma", avatar: "", assigned: 31, completed: 12, inProgress: 9,  delayed: 1, completionRate: 87 },
  { id: 2, name: "Sara Ahmed",   avatar: "", assigned: 15, completed: 8,  inProgress: 4,  delayed: 2, completionRate: 87 },
  { id: 3, name: "Sara Ahmed",   avatar: "", assigned: 19, completed: 15, inProgress: 10, delayed: 7, completionRate: 87 },
  { id: 4, name: "Sara Ahmed",   avatar: "", assigned: 28, completed: 2,  inProgress: 1,  delayed: 1, completionRate: 87 },
  { id: 5, name: "Sara Ahmed",   avatar: "", assigned: 17, completed: 20, inProgress: 19, delayed: 3, completionRate: 87 },
  { id: 6, name: "Sara Ahmed",   avatar: "", assigned: 24, completed: 1,  inProgress: 1,  delayed: 1, completionRate: 87 },
  { id: 7, name: "Sara Ahmed",   avatar: "", assigned: 2,  completed: 0,  inProgress: 0,  delayed: 0, completionRate: 87 },
];

const tableHeader = [
  { id: "name",           label: "Name"            },
  { id: "assigned",       label: "Assigned"        },
  { id: "completed",      label: "Completed"       },
  { id: "inProgress",     label: "In Progress"     },
  { id: "delayed",        label: "Delayed"         },
  { id: "completionRate", label: "Completion Rate" },
];

const displayRows = [
  "perf_member",
  "perf_assigned",
  "perf_completed",
  "perf_in_progress",
  "perf_delayed",
  "perf_completion_rate",
];

const PerformanceTab = ({ project = {} }) => {
  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Row 1: Project Progress + Delayed Tasks ───────────────────────── */}
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <PerformanceProjectProgressChart />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <DelayedTasks />
        </Grid>
      </Grid>

      {/* ── Row 2: Workload Distribution ──────────────────────────────────── */}
      <Box sx={{ mt: 3 }}>
        <WorkloadDistribution />
      </Box>

      {/* ── Row 3: Member performance table ───────────────────────────────── */}
      <Box sx={{ mt: 3, bgcolor: "#fff", borderRadius: "25px", p: 2 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={memberData}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>

    </Box>
  );
};

export default PerformanceTab;