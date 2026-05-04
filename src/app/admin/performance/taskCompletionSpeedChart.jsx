// app/admin/performance/taskCompletionSpeedChart.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const speedData = [
  { week: "Week 1", ali: 0.6, sara: 1.0, omar: 1.0, fatima: 0.5 },
  { week: "Week 2", ali: 0.8, sara: 1.8, omar: 0.7, fatima: 1.2 },
  { week: "Week 3", ali: 1.9, sara: 3.9, omar: 1.2, fatima: 3.4 },
  { week: "Week 4", ali: 2.2, sara: 2.8, omar: 2.0, fatima: 2.5 },
  { week: "Week 5", ali: 2.2, sara: 4.0, omar: 3.0, fatima: 2.8 },
];

const lineConfig = [
  { key: "ali",    color: "#022179", label: "Ali"    },
  { key: "sara",   color: "#F97316", label: "Sara"   },
  { key: "omar",   color: "#04C373", label: "Omar"   },
  { key: "fatima", color: "#AA2493", label: "Fatima" },
];

// ── Custom tooltip matching screenshot ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      px: 1.5,
      py: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      minWidth: "110px",
    }}>
      <Typography fontSize={12} fontWeight={600} color="text.primary" mb={0.5}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey} fontSize={12} fontWeight={500}
          sx={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
};

const TaskCompletionSpeedChart = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      height: "100%",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={3}>
        Task Completion Speed (days)
      </Typography>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={speedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#F5F5F5" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#F5F5F5" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {lineConfig.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
              name={label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TaskCompletionSpeedChart;