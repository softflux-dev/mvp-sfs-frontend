// app/projectManager/teamPerformance/index.jsx — 
import { useState, useEffect } from "react";
import { Box, Grid, Skeleton, Menu, MenuItem, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";

import HeaderText            from "../../../components/headerText";
import StatsCard             from "../../../components/cards/statsCard";
import PaginatedTable        from "../../../components/dynamicTable";
import WorkloadDistribution  from "./workloadDistribution";
import DelayedTasks          from "./delayedTasks";

import { getTeamPerformanceApi, getPMProjectListApi } from "../../../api/modules/teamPerformance";

import taskIcon     from "../../../assets/icons/tasks.svg";
import overdueIcon  from "../../../assets/icons/overdue-time.svg";
import completeIcon from "../../../assets/icons/attendance-icon.svg";

const tableHeader = [
  { id: "member",         label: "Team Member"     },
  { id: "department",     label: "Department"      },
  { id: "totalTasks",     label: "Total Tasks"     },
  { id: "completed",      label: "Completed"       },
  { id: "active",         label: "Active"          },
  { id: "overdue",        label: "Overdue"         },
  { id: "completionRate", label: "Completion Rate" },
];

const displayRows = [
  "employee_details",
  "department",
  "tp_total_tasks",
  "tp_completed",
  "tp_active",
  "tp_overdue",
  "tp_completion_rate",
];

const TeamPerformance = () => {
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); 
  const [anchorEl,        setAnchorEl]        = useState(null);
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);

  // Fetch project list on mount
  useEffect(() => {
    getPMProjectListApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjects(res.data.data.projects || []);
      }
    });
  }, []);

  // Fetch performance data when project changes
  useEffect(() => {
    setLoading(true);
    getTeamPerformanceApi(selectedProject?._id || "").then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setData(res.data.data);
      }
    }).finally(() => setLoading(false));
  }, [selectedProject?._id]);

  const stats = data?.stats || { avgCompletionRate: "0%", delayedTasks: 0, totalTasks: 0 };
  const members = (data?.members || []).map((m) => ({
    ...m,
    id:     m.id || m._id,
    name:   m.name,
    avatar: m.avatar || "",
   
  }));

  const statsData = [
    { id: 1, title: "Avg Completion Rate",     value: loading ? "—" : stats.avgCompletionRate, icon: completeIcon },
    { id: 2, title: "Overdue Tasks",           value: loading ? "—" : String(stats.delayedTasks), icon: overdueIcon  },
    { id: 3, title: "Total Tasks This Period", value: loading ? "—" : String(stats.totalTasks),   icon: taskIcon     },
  ];

  const selectedLabel = selectedProject?.projectName || "All Projects";

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Team Performance" subtitle="Track your team's productivity and task metrics" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            {/* Project selector */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                backgroundColor: "#fff", borderRadius: "12px",
                padding: "8px 16px", cursor: "pointer",
                minWidth: "180px", justifyContent: "space-between",
                border: "1px solid #E5E7EB",
                "&:hover": { backgroundColor: "#F5F5F5" },
              }}
            >
              <Typography fontSize={14} fontWeight={500} color="text.primary" noWrap>
                {selectedLabel}
              </Typography>
              <ChevronDown size={16} />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: "18px", minWidth: 220, p: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1 } }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => { setSelectedProject(null); setAnchorEl(null); }}
                sx={{
                  borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
                  color: !selectedProject ? "#fff" : "text.primary",
                  background: !selectedProject ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
                  "&:hover": { background: !selectedProject ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
                }}
              >
                All Projects
              </MenuItem>
              {projects.map((p) => (
                <MenuItem
                  key={p._id}
                  onClick={() => { setSelectedProject(p); setAnchorEl(null); }}
                  sx={{
                    borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
                    color: selectedProject?._id === p._id ? "#fff" : "text.primary",
                    background: selectedProject?._id === p._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
                    "&:hover": { background: selectedProject?._id === p._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
                  }}
                >
                  {p.projectName}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={stat.id}>
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

      {/* Team Table */}
      <Box mt={3} bgcolor="#fff" borderRadius="25px" p={2}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={members}
          displayRows={displayRows}
          isLoading={loading}
        />
      </Box>

      {/* Workload + Delayed Tasks */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <WorkloadDistribution chartData={data?.workload || []} loading={loading} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <DelayedTasks tasks={data?.delayed || []} loading={loading} />
        </Grid>
      </Grid>
    </>
  );
};

export default TeamPerformance;