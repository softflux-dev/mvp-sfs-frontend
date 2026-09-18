// ProjectProgressChart.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Menu, MenuItem, CircularProgress, styled } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { getProjectProgressApi } from "../../../api/modules/dashboard";
import { getProjectTypesApi }    from "../../../api/modules/projectType";

const ScrollContainer = styled(Box)({
  overflowY: "auto",
  overflowX: "hidden",
  paddingRight: "8px",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": { background: "#E0E0E0", borderRadius: 4 },
});

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

// Horizontal gradient — bar now grows left→right, so the gradient stop
// direction flips from the old vertical (top→bottom) version.
const GradientBar = (props) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <defs>
        <linearGradient id="barGradientH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#barGradientH)" rx={6} ry={6} />
    </g>
  );
};

const BAR_HEIGHT   = 42;   // px per project row
const MIN_HEIGHT   = 260;
const MAX_VISIBLE  = 400;  // card never grows past this — beyond it, scroll

const ProjectProgressChart = () => {
  const [projectTypes,    setProjectTypes]    = useState([]);
  const [selectedType,    setSelectedType]    = useState(null); // null = All
  const [chartData,       setChartData]       = useState([]);
  const [anchorEl,        setAnchorEl]        = useState(null);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    getProjectTypesApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjectTypes(res.data.data.projectTypes || []);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getProjectProgressApi(selectedType?._id || "").then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setChartData(res.data.data.projects || []);
      }
    }).finally(() => setLoading(false));
  }, [selectedType]);

  const selectedLabel = selectedType?.label || "All Project Types";

  // Chart itself is always tall enough to give every bar its full row —
  // no squeezing rows to fit a fixed height. The OUTER container below is
  // what caps visible height and introduces the scrollbar.
  const chartHeight = Math.max(MIN_HEIGHT, chartData.length * BAR_HEIGHT);

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
            PaperProps={{
              sx: {
                borderRadius: "18px",
                width: 220,           // ← fixed width, was minWidth: 200
                maxHeight: 280,        // ← caps the dropdown height
                overflowY: "auto",     // ← scrollbar appears when content exceeds maxHeight
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
          <MenuItem
            onClick={() => { setSelectedType(null); setAnchorEl(null); }}
            sx={{
              borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
              color: !selectedType ? "#fff" : "text.primary",
              background: !selectedType ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
              "&:hover": { background: !selectedType ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
            }}
          >
            All Projects Types
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
        <ScrollContainer sx={{ maxHeight: MAX_VISIBLE }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 40, bottom: 5, left: 10 }}
              barCategoryGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
            type="category"
            dataKey="fullName"
            width={90}
            interval={0}
            tick={{ fontSize: 12, fill: "#374151", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Bar dataKey="progress" shape={<GradientBar />} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ScrollContainer>
      )}
    </Box>
  );
};

export default ProjectProgressChart;