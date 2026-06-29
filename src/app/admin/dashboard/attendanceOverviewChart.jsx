// AttendanceOverviewChart.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getAttendanceOverviewApi } from "../../../api/modules/dashboard";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, index, name, value }) => {
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const colors = ["#030229", "#022179", "#FF0000"];
  return (
    <text
      x={x} y={y}
      fill={colors[index] || "#67768B"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12} fontWeight={500}
      fontFamily='"Poppins", sans-serif'
    >
      {name} {value}%
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
  const [data,    setData]    = useState([
    { name: "Present", value: 0, color: "#030229" },
    { name: "Late",    value: 0, color: "#022179" },
    { name: "Absent",  value: 0, color: "#FF0000" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendanceOverviewApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const d = res.data.data;
        setData([
          { name: "Present", value: d.present ?? 0, color: "#030229" },
          { name: "Late",    value: d.late    ?? 0, color: "#022179" },
          { name: "Absent",  value: d.absent  ?? 0, color: "#FF0000" },
        ]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const hasData = data.some((d) => d.value > 0);

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
      <Typography fontSize="12px" color="text.secondary" mb={1}>This month</Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={260}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !hasData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={260}>
          <Typography fontSize={13} color="text.secondary">No attendance data this month.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={70} outerRadius={100}
              dataKey="value"
              labelLine={{ stroke: "#aaa", strokeWidth: 1 }}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ borderRadius: "10px", fontSize: "12px", fontFamily: '"Poppins", sans-serif', border: "1px solid #F5F5F5" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      <Stack direction="row" spacing={3} justifyContent="center" mt={1}>
        {data.map((item) => (
          <LegendDot key={item.name} color={item.color} label={item.name} />
        ))}
      </Stack>
    </Box>
  );
};

export default AttendanceOverviewChart;