// TaskStatusChart.jsx
import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "New",        value: 3, color: "#2B6EFF" },
  { name: "In Progress",value: 3, color: "#9E9E9E" },
  { name: "Review",     value: 2, color: "#BDBDBD" },
  { name: "Completed",  value: 2, color: "#030229" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, outerRadius, name, value, fill,
}) => {
  const LINE_LENGTH = 30;
  const DOT_RADIUS  = 4;

  // Point on the pie edge
  const ex = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const ey = cy + outerRadius * Math.sin(-midAngle * RADIAN);

  // End of the extending line
  const lx = cx + (outerRadius + LINE_LENGTH) * Math.cos(-midAngle * RADIAN);
  const ly = cy + (outerRadius + LINE_LENGTH) * Math.sin(-midAngle * RADIAN);

  const isRight    = lx > cx;
  const textAnchor = isRight ? "start" : "end";
  const textX      = lx + (isRight ? 4 : -4);

  return (
    <g>
      {/* Small circle on the pie edge */}
      <circle cx={ex} cy={ey} r={DOT_RADIUS} fill="#fff" stroke={fill} strokeWidth={2} />

      {/* Line from dot to label */}
      <line x1={ex} y1={ey} x2={lx} y2={ly} stroke="#ccc" strokeWidth={1} />

      {/* Label text */}
      <text
        x={textX}
        y={ly}
        fill={name === "New" ? "#2B6EFF" : "#67768B"}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
        fontFamily='"Poppins", sans-serif'
      >
        {`${name}: ${value}`}
      </text>
    </g>
  );
};

const LegendDot = ({ color, label }) => (
  <Stack direction="row" alignItems="center" spacing={0.8}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
    <Typography fontSize={12} color="text.secondary">{label}</Typography>
  </Stack>
);

const TaskStatusChart = () => (
  <Box sx={{
    backgroundColor: "#fff",
    borderRadius: "25px",
    padding: { xs: "16px", md: "24px" },
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  }}>
    <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={1}>
      Task Status Distribution
    </Typography>

    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            borderRadius: "10px", fontSize: "12px",
            fontFamily: '"Poppins", sans-serif',
            border: "1px solid #F5F5F5",
          }}
        />
      </PieChart>
    </ResponsiveContainer>

    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mt={1}>
      {data.map((item) => (
        <LegendDot key={item.name} color={item.color} label={item.name} />
      ))}
    </Stack>
  </Box>
);

export default TaskStatusChart;