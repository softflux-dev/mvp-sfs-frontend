// TaskStatusChart.jsx — FIXED: filter zero-value stages from pie, keep in legend
import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Menu, MenuItem, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { getProjectsApi, getProjectByIdApi } from "../../../api/modules/project";
import { getProjectTasksApi } from "../../../api/modules/task";

const STAGE_COLORS = ["#2B6EFF", "#AA2493", "#F97316", "#04C373", "#030229"];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value, fill }) => {
  // Skip label if value is 0 (shouldn't reach here but safety net)
  if (!value) return null;
  const LINE_LENGTH = 30;
  const DOT_RADIUS  = 4;
  const ex = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const ey = cy + outerRadius * Math.sin(-midAngle * RADIAN);
  const lx = cx + (outerRadius + LINE_LENGTH) * Math.cos(-midAngle * RADIAN);
  const ly = cy + (outerRadius + LINE_LENGTH) * Math.sin(-midAngle * RADIAN);
  const isRight    = lx > cx;
  const textAnchor = isRight ? "start" : "end";
  const textX      = lx + (isRight ? 4 : -4);

  return (
    <g>
      <circle cx={ex} cy={ey} r={DOT_RADIUS} fill="#fff" stroke={fill} strokeWidth={2} />
      <line x1={ex} y1={ey} x2={lx} y2={ly} stroke="#ccc" strokeWidth={1} />
      <text
        x={textX} y={ly} fill="#67768B"
        textAnchor={textAnchor} dominantBaseline="central"
        fontSize={11} fontWeight={500} fontFamily='"Poppins", sans-serif'
      >
        {`${name}: ${value}`}
      </text>
    </g>
  );
};

const LegendDot = ({ color, label, dimmed }) => (
  <Stack direction="row" alignItems="center" spacing={0.8}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, opacity: dimmed ? 0.35 : 1 }} />
    <Typography fontSize={12} color={dimmed ? "text.disabled" : "text.secondary"} sx={{ opacity: dimmed ? 0.6 : 1 }}>
      {label}
    </Typography>
  </Stack>
);

const TaskStatusChart = () => {
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl,        setAnchorEl]        = useState(null);
  const [chartData,       setChartData]       = useState([]); // ALL stages (for legend)
  const [loading,         setLoading]         = useState(false);

  useEffect(() => {
    getProjectsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const list = res.data.data.projects || [];
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProject?._id) return;
    setLoading(true);

    Promise.all([
      getProjectByIdApi(selectedProject._id),
      getProjectTasksApi(selectedProject._id),
    ]).then(([projRes, tasksRes]) => {
      const stages = projRes?.data?.data?.project?.stages || [];
      const tasks  = tasksRes?.data?.data?.tasks          || [];

      const stageCount = {};
      stages.forEach((s) => { stageCount[s.id] = 0; });
      tasks.forEach((t) => {
        if (stageCount[t.status] !== undefined) stageCount[t.status]++;
      });

      // All stages with color (for legend)
      const data = stages.map((s, i) => ({
        name:  s.label,
        value: stageCount[s.id] || 0,
        color: STAGE_COLORS[i % STAGE_COLORS.length],
      }));

      setChartData(data);
    }).finally(() => setLoading(false));
  }, [selectedProject?._id]);

  // ── Only non-zero stages go into the pie ─────────────────────────────────
  const pieData   = chartData.filter((d) => d.value > 0);
  const hasData   = pieData.length > 0;

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Task Status Distribution
        </Typography>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            backgroundColor: "#F5F5F5", borderRadius: "12px",
            padding: "6px 12px", cursor: "pointer", maxWidth: "160px",
            "&:hover": { backgroundColor: "#EDEDED" },
          }}
        >
          <Typography fontSize={12} fontWeight={500} color="text.primary" noWrap>
            {selectedProject?.projectName || "Select Project"}
          </Typography>
          <ChevronDown size={14} style={{ flexShrink: 0 }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: "18px",
              width: 220,
              maxHeight: 280,
              overflowY: "auto",
              p: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              mt: 1,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#E0E0E0", borderRadius: 4 },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {projects.length === 0 && (
            <MenuItem disabled><Typography fontSize={13} color="text.secondary">No projects</Typography></MenuItem>
          )}
          {projects.map((p) => (
            <MenuItem
              key={p._id}
              onClick={() => { setSelectedProject(p); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "13px", fontWeight: 500, mb: 0.5,
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

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !hasData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <Typography fontSize={13} color="text.secondary">No tasks for this project.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{ borderRadius: "10px", fontSize: "12px", fontFamily: '"Poppins", sans-serif', border: "1px solid #F5F5F5" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend — shows ALL stages, zero ones are dimmed */}
      {!loading && chartData.length > 0 && (
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mt={1}>
          {chartData.map((item) => (
            <LegendDot key={item.name} color={item.color} label={item.name} dimmed={item.value === 0} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TaskStatusChart;