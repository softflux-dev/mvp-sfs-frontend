// projectDetailTabs/performanceTab.jsx
import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import PerformanceProjectProgressChart from "./projectProgressChart";
import DelayedTasks                    from "./delayedTasks";
import WorkloadDistribution            from "./workloadDistribution";
import PaginatedTable                  from "../../../../../components/dynamicTable";
import { getProjectPerformanceApi }    from "../../../../../api/modules/project";

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
  const [data,    setData]    = useState({ members: [], progressChart: [], workload: [], delayed: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const projectId = project.id || project._id;
    if (!projectId) return;

    setLoading(true);
    getProjectPerformanceApi(projectId)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setData(res.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [project.id, project._id]);

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Row 1: Project Progress + Delayed Tasks ───────────────────────── */}
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <PerformanceProjectProgressChart data={data.progressChart} loading={loading} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <DelayedTasks tasks={data.delayed} loading={loading} />
        </Grid>
      </Grid>

      {/* ── Row 2: Workload Distribution ──────────────────────────────────── */}
      <Box sx={{ mt: 3 }}>
        <WorkloadDistribution data={data.workload} loading={loading} />
      </Box>

      {/* ── Row 3: Member performance table ───────────────────────────────── */}
      <Box sx={{ mt: 3, bgcolor: "#fff", borderRadius: "25px", p: 2 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={data.members}
          displayRows={displayRows}
          isLoading={loading}
        />
      </Box>

    </Box>
  );
};

export default PerformanceTab;