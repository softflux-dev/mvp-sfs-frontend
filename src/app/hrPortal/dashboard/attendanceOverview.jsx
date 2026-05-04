// app/hrPortal/dashboard/attendanceOverview.jsx
import { Box, Typography } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Present",  value: 72, color: "#022179" },
  { name: "Late",     value: 15, color: "#AA2493" },
  { name: "Absent",   value: 13, color: "#FF0000" },
  { name: "On Leave", value: 9,  color: "#04C373" },
];

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = data.find((d) => d.name === name)?.color || "#000";

  return (
    <text
      x={x} y={y}
      fill={color}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily='"Poppins", sans-serif'
      fontWeight={500}
    >
      {`${name} ${value}%`}
    </text>
  );
};

const AttendanceOverview = () => (
  <Box sx={{
    backgroundColor: "#fff",
    borderRadius:    "25px",
    p:               3,
    height:          "100%",
  }}>
    <Typography fontSize="16px" fontWeight={600} color="text.primary" mb={2}>
      Attendance Overview — Today
    </Typography>

    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={true}
          label={renderCustomLabel}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value}%`, name]}
          contentStyle={{
            borderRadius:  "10px",
            fontSize:      "12px",
            fontFamily:    '"Poppins", sans-serif',
            border:        "1px solid #F5F5F5",
          }}
        />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend */}
    <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={1}>
      {data.map((item) => (
        <Box key={item.name} display="flex" alignItems="center" gap={0.75}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
          <Typography fontSize="12px" color="text.secondary">
            {item.name}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

export default AttendanceOverview;