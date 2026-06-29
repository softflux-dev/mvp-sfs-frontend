// ProjectProgressChart.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Menu, MenuItem, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { getProjectProgressApi } from "../../../api/modules/dashboard";
import { getProjectTypesApi }    from "../../../api/modules/projectType";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: '"Poppins", sans-serif' }}>
          {payload[0].payload.fullName}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#AA2493", fontFamily: '"Poppins", sans-serif' }}>
          Progress: {payload[0].value}%
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
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#barGradient)" rx={8} ry={8} />
    </g>
  );
};

const ProjectProgressChart = () => {
  const [projectTypes,    setProjectTypes]    = useState([]);
  const [selectedType,    setSelectedType]    = useState(null); // null = All
  const [chartData,       setChartData]       = useState([]);
  const [anchorEl,        setAnchorEl]        = useState(null);
  const [loading,         setLoading]         = useState(true);

  // Fetch project types for dropdown
  useEffect(() => {
    getProjectTypesApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjectTypes(res.data.data.projectTypes || []);
      }
    });
  }, []);

  // Fetch projects when filter changes
  useEffect(() => {
    setLoading(true);
    getProjectProgressApi(selectedType?._id || "").then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setChartData(res.data.data.projects || []);
      }
    }).finally(() => setLoading(false));
  }, [selectedType]);

  const selectedLabel = selectedType?.label || "All Projects";

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", padding: { xs: "16px", md: "24px" }, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary">
          Project Progress
        </Typography>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "#F5F5F5", borderRadius: "12px", padding: "8px 16px", cursor: "pointer", minWidth: "150px", justifyContent: "space-between", "&:hover": { backgroundColor: "#EDEDED" } }}
        >
          <Typography fontSize={14} fontWeight={500} color="text.primary" noWrap>{selectedLabel}</Typography>
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
          {/* All option */}
          <MenuItem
            onClick={() => { setSelectedType(null); setAnchorEl(null); }}
            sx={{
              borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
              color: !selectedType ? "#fff" : "text.primary",
              background: !selectedType ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
              "&:hover": { background: !selectedType ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
            }}
          >
            All Projects
          </MenuItem>
          {projectTypes.map((t) => (
            <MenuItem
              key={t._id}
              onClick={() => { setSelectedType(t); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
                color: selectedType?._id === t._id ? "#fff" : "text.primary",
                background: selectedType?._id === t._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
                "&:hover": { background: selectedType?._id === t._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
              }}
            >
              {t.label}
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
          <Typography fontSize={13} color="text.secondary">No projects found.</Typography>
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
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="progress" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default ProjectProgressChart;