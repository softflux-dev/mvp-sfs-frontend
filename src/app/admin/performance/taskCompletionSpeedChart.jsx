// app/admin/performance/taskCompletionSpeedChart.jsx —
import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: "110px" }}>
      <Typography fontSize={12} fontWeight={600} color="text.primary" mb={0.5}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey} fontSize={12} fontWeight={500} sx={{ color: entry.color }}>
          {entry.name}: {entry.value}d
        </Typography>
      ))}
    </Box>
  );
};

const TaskCompletionSpeedChart = ({ data = [], lineConfig = [], loading = false }) => {
  const maxVal = Math.max(4, ...data.flatMap((row) => lineConfig.map((l) => row[l.key] || 0)));

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", padding: { xs: "16px", md: "24px" }, height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={3}>
        Task Completion Speed (days)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !lineConfig.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <Typography fontSize={13} color="text.secondary">Not enough completed tasks yet.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }} axisLine={{ stroke: "#F5F5F5" }} tickLine={false} />
            <YAxis domain={[0, maxVal]} tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }} axisLine={{ stroke: "#F5F5F5" }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {lineConfig.map(({ key, color, label }) => (
              <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} name={label} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default TaskCompletionSpeedChart;