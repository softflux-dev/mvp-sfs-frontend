// app/admin/performance/workloadDistributionChart.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const workloadData = [
  { name: "Ali",    activeTasks: 0.7  },
  { name: "Sara",   activeTasks: 1.7  },
  { name: "Omar",   activeTasks: 1.25 },
  { name: "Fatima", activeTasks: 2.0  },
  { name: "Bilal",  activeTasks: 0.8  },
];

// ── Gradient horizontal bar ───────────────────────────────────────────────────
const GradientBar = (props) => {
  const { x, y, width, height, index } = props;
  const id = `wlGrad_${index}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#022179" />
          <stop offset="100%" stopColor="#AA2493" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height}
        fill={`url(#${id})`} rx={6} ry={6} />
    </g>
  );
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{
      bgcolor: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      px: 1.5,
      py: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <Typography fontSize={13} fontWeight={600} color="text.primary">
        {d.name}
      </Typography>
      <Typography fontSize={12} color="#AA2493">
        Active Tasks: {d.activeTasks * 10}
      </Typography>
    </Box>
  );
};

const WorkloadDistributionChart = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      height: "100%",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={3}>
        Workload Distribution
      </Typography>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={workloadData}
          layout="vertical"
          barSize={40}
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 2]}
            ticks={[0, 0.5, 1, 1.5, 2]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={50}
            tick={{ fontSize: 13, fill: "#374151", fontFamily: '"Poppins", sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="activeTasks" shape={<GradientBar />} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WorkloadDistributionChart;