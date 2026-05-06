import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Ali Hassan",   tasks: 1 },
  { name: "Sara Ahmed",   tasks: 3 },
  { name: "Omar Farooq",  tasks: 2 },
  { name: "Fatima Khan",  tasks: 4 },
  { name: "Bilal Raza",   tasks: 1 },
  { name: "Ayesha Malik", tasks: 4 },
  { name: "Usman Shah",   tasks: 1 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          {payload[0].payload.name}
        </Typography>
        <Typography fontSize="12px" color="#AA2493">
          Active Tasks:{" "}
          <Typography component="span" fontSize="12px" fontWeight={700} color="#AA2493">
            {payload[0].value}
          </Typography>
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
        <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        fill="url(#workloadGradient)" rx={8} ry={8}
      />
    </g>
  );
};

const TeamWorkload = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={3}>
        Team Workload
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="tasks" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TeamWorkload;