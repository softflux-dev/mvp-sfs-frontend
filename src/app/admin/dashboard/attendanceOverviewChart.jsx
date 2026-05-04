// AttendanceOverviewChart.jsx
import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const data = [
  { name: "Present", value: 72, color: "#030229" },
  { name: "Late", value: 15, color: "#022179" },
  { name: "Absent", value: 13, color: "#FF0000" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const item = data[index];

  return (
    <text
      x={x} y={y}
      fill={item.color === "#FF0000" ? "#FF0000" : "#030229"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
      fontFamily='"Poppins", sans-serif'
    >
      {item.name} {item.value}%
    </text>
  );
};

const LegendDot = ({ color, label }) => (
  <Stack direction="row" alignItems="center" spacing={0.8}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
    <Typography fontSize={12} color="text.secondary">{label}</Typography>
  </Stack>
);

const AttendanceOverviewChart = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={1}>
        Attendance Overview
      </Typography>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            labelLine={{
              stroke: "#aaa",
              strokeWidth: 1,
            }}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{
              borderRadius: "10px", fontSize: "12px",
              fontFamily: '"Poppins", sans-serif',
              border: "1px solid #F5F5F5",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <Stack direction="row" spacing={3} justifyContent="center" mt={1}>
        {data.map((item) => (
          <LegendDot key={item.name} color={item.color} label={item.name} />
        ))}
      </Stack>
    </Box>
  );
};

export default AttendanceOverviewChart;