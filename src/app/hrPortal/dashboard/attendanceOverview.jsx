// app/hrPortal/dashboard/attendanceOverview.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getHRAttendanceOverviewApi } from "../../../api/modules/hrDashboard";

const COLORS = ["#022179", "#AA2493", "#FF0000", "#04C373"];
const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  if (!value) return null;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = { Present: "#022179", Late: "#AA2493", Absent: "#FF0000", "On Leave": "#04C373" }[name] || "#000";

  return (
    <text
      x={x} y={y} fill={color}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11} fontFamily='"Poppins", sans-serif' fontWeight={500}
    >
      {`${name} ${value}%`}
    </text>
  );
};

const AttendanceOverview = () => {
  const [data,    setData]    = useState([
    { name: "Present",  value: 0, color: "#022179" },
    { name: "Late",     value: 0, color: "#AA2493" },
    { name: "Absent",   value: 0, color: "#FF0000" },
    { name: "On Leave", value: 0, color: "#04C373" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHRAttendanceOverviewApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const d = res.data.data;
        setData([
          { name: "Present",  value: d.present  ?? 0, color: "#022179" },
          { name: "Late",     value: d.late     ?? 0, color: "#AA2493" },
          { name: "Absent",   value: d.absent   ?? 0, color: "#FF0000" },
          { name: "On Leave", value: d.onLeave  ?? 0, color: "#04C373" },
        ]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const pieData = data.filter((d) => d.value > 0);
  const hasData = pieData.length > 0;

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="16px" fontWeight={600} color="text.primary" mb={2}>
        Attendance Overview — This Month
      </Typography>

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
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={70} outerRadius={100}
              paddingAngle={3} dataKey="value"
              labelLine={true} label={renderCustomLabel}
            >
              {pieData.map((entry, index) => (
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

      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={1}>
        {data.map((item) => (
          <Box key={item.name} display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
            <Typography fontSize="12px" color="text.secondary">{item.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AttendanceOverview;