// app/projectManager/dashboard/teamWorkload.jsx —
import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Menu, MenuItem } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { getPMTeamWorkloadApi } from "../../../api/modules/pmDashboard";
import { getPMProjectsApi }     from "../../../api/modules/pmDashboard";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">{payload[0].payload.name}</Typography>
        <Typography fontSize="12px" color="#AA2493">
          Active Tasks: <Typography component="span" fontSize="12px" fontWeight={700} color="#AA2493">{payload[0].value}</Typography>
        </Typography>
      </Box>
    );
  }
  return null;
};

const GradientBar = (props) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <defs>
        <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#workloadGradient)" rx={8} ry={8} />
    </g>
  );
};

const TeamWorkload = () => {
  const [projects,         setProjects]         = useState([]); // for dropdown
  const [selectedProject,  setSelectedProject]  = useState(null); // null = All Projects
  const [chartData,        setChartData]        = useState([]);
  const [anchorEl,         setAnchorEl]         = useState(null);
  const [loading,          setLoading]          = useState(true);

  // Fetch project list for dropdown on mount
  useEffect(() => {
    getPMProjectsApi(100).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjects(res.data.data.projects || []);
      }
    });
  }, []);

  // Fetch workload when selected project changes
  useEffect(() => {
    setLoading(true);
    getPMTeamWorkloadApi(selectedProject?.id || "").then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setChartData(res.data.data.chartData || []);
      }
    }).finally(() => setLoading(false));
  }, [selectedProject?.id]);

  const maxTasks = Math.max(...chartData.map((d) => d.tasks), 4);
  const yMax     = Math.ceil(maxTasks / 2) * 2;
  const yTicks   = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2);

  const selectedLabel = selectedProject?.name || "All Projects";

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Team Workload
        </Typography>

        {/* Project selector */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            backgroundColor: "#F5F5F5", borderRadius: "12px",
            padding: "8px 16px", cursor: "pointer",
            minWidth: "150px", justifyContent: "space-between",
            "&:hover": { backgroundColor: "#EDEDED" },
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
          PaperProps={{ sx: { borderRadius: "18px", minWidth: 200, p: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1 } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* All Projects option */}
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
              key={p.id}
              onClick={() => { setSelectedProject(p); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
                color: selectedProject?.id === p.id ? "#fff" : "text.primary",
                background: selectedProject?.id === p.id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
                "&:hover": { background: selectedProject?.id === p.id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
              }}
            >
              {p.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : chartData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography fontSize={13} color="text.secondary">No active tasks assigned to team members.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barSize={50}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="tasks" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default TeamWorkload;