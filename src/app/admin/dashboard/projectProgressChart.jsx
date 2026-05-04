// ProjectProgressChart.jsx — add dropdown filter + fix duplicate bars
import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const allProjectData = {
  "All Project Type": [
    { name: "E-Commerce Plat...", progress: 15 },
    { name: "HR Managem...",      progress: 70 },
    { name: "Mobile Banking...",  progress: 48 },
    { name: "CMS Website...",     progress: 92 },
    { name: "Inventory Track...", progress: 28 },
  ],
  "CRM & ERP system": [
    { name: "CRM Module",    progress: 60 },
    { name: "ERP Module",    progress: 45 },
    { name: "Integration",  progress: 30 },
  ],
  "Development": [
    { name: "Frontend",  progress: 80 },
    { name: "Backend",   progress: 65 },
    { name: "DevOps",    progress: 50 },
  ],
  "QA testing": [
    { name: "Unit Tests",        progress: 90 },
    { name: "Integration Tests", progress: 70 },
    { name: "E2E Tests",         progress: 40 },
  ],
  "SEO & Marketing": [
    { name: "On-Page SEO",  progress: 85 },
    { name: "Campaigns",    progress: 55 },
    { name: "Analytics",    progress: 75 },
  ],
};

const PROJECT_TYPES = Object.keys(allProjectData);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: '"Poppins", sans-serif' }}>
          {payload[0].payload.name}
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
      <rect x={x} y={y} width={width} height={height}
        fill="url(#barGradient)" rx={8} ry={8} />
    </g>
  );
};

const ProjectProgressChart = () => {
  const [selected,  setSelected]  = useState("All Project Type");
  const [anchorEl,  setAnchorEl]  = useState(null);

  const data = allProjectData[selected];

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary">
          Project Progress
        </Typography>

        {/* Dropdown */}
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
          <Typography fontSize={14} fontWeight={500} color="text.primary">
            {selected}
          </Typography>
          <ChevronDown size={16} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: "18px", minWidth: 200,
              p: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {PROJECT_TYPES.map((type) => (
            <MenuItem
              key={type}
              onClick={() => { setSelected(type); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "14px", fontWeight: 500,
                color: selected === type ? "#fff" : "text.primary",
                background: selected === type
                  ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                  : "transparent",
                mb: 0.5,
                "&:hover": {
                  background: selected === type
                    ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                    : "#F5F5F5",
                },
              }}
            >
              {type}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={50}>
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
    </Box>
  );
};

export default ProjectProgressChart;