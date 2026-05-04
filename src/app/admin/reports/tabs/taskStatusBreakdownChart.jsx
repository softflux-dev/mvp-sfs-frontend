import { Box, Typography, Stack } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "New",         value: 3, color: "#2B6EFF" },
  { name: "In Progress", value: 3, color: "#9E9E9E" },
  { name: "Review",      value: 2, color: "#BDBDBD" },
  { name: "Completed",   value: 2, color: "#030229" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value, fill }) => {
  const radius = outerRadius + 40;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // line start (just outside pie)
  const x1 = cx + (outerRadius + 6)  * Math.cos(-midAngle * RADIAN);
  const y1 = cy + (outerRadius + 6)  * Math.sin(-midAngle * RADIAN);
  // line end (just before label)
  const x2 = cx + (outerRadius + 28) * Math.cos(-midAngle * RADIAN);
  const y2 = cy + (outerRadius + 28) * Math.sin(-midAngle * RADIAN);

  const isNew = name === "New";

  return (
    <g>
      {/* small circle at pie edge */}
      <circle cx={x1} cy={y1} r={3} fill="#ccc" />
      {/* leader line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ccc" strokeWidth={1} />
      {/* label text */}
      <text
        x={x} y={y}
        fill={isNew ? "#2B6EFF" : "#67768B"}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={isNew ? 600 : 500}
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

const TaskStatusBreakdownChart = () => {
  return (
    <Box>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1}>
        Task Status Breakdown
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
              borderRadius: "10px",
              fontSize: "12px",
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
};

export default TaskStatusBreakdownChart;