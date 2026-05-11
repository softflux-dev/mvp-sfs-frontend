import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Ali Hassan",    project: "E-Commerce Platform",   tasks: 1, progress: 45 },
  { name: "Sara Ahmed",    project: "HR Management System",  tasks: 3, progress: 45 },
  { name: "Omar Farooq",   project: "Mobile Banking App",    tasks: 2, progress: 60 },
  { name: "Fatima Khan",   project: "CMS Website Redesign",  tasks: 4, progress: 30 },
  { name: "Bilal Raza",    project: "E-Commerce Platform",   tasks: 1, progress: 20 },
  { name: "Ayesha Malik",  project: "HR Management System",  tasks: 4, progress: 75 },
  { name: "Usman Shah",    project: "Mobile Banking App",    tasks: 1, progress: 55 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <Box sx={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "160px",
      }}>
        <Typography fontSize="12px" fontWeight={600} color="text.primary" mb={0.5}>
          {d.project}
        </Typography>
        <Typography fontSize="11px" color="#AA2493">
          Progress{" "}
          <Typography component="span" fontSize="11px" fontWeight={700} color="#AA2493">
            {d.progress}
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

const WorkloadDistribution = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",
    }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={3}>
        Workload Distribution
      </Typography>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
            // shorten names to first name only
            tickFormatter={(v) => v.split(" ")[0]}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="tasks" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WorkloadDistribution;