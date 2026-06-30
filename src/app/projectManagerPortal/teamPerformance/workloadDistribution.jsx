// app/projectManager/teamPerformance/workloadDistribution.jsx — 
import { Box, Typography, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: "140px" }}>
        <Typography fontSize="12px" fontWeight={600} color="text.primary" mb={0.5}>
          {payload[0].payload.name}
        </Typography>
        <Typography fontSize="11px" color="#AA2493">
          Active Tasks: <Typography component="span" fontSize="11px" fontWeight={700} color="#AA2493">{payload[0].value}</Typography>
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
      <rect x={x} y={y} width={width} height={height} fill="url(#workloadGradient)" rx={8} ry={8} />
    </g>
  );
};

const WorkloadDistribution = ({ chartData = [], loading = false }) => {
  const maxVal = Math.max(...chartData.map((d) => d.tasks), 4);
  const yMax   = Math.ceil(maxVal / 2) * 2;
  const yTicks = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2);

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={3}>
        Workload Distribution
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : chartData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <Typography fontSize={13} color="text.secondary">No active tasks.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              tickFormatter={(v) => v.split(" ")[0]}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="tasks" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default WorkloadDistribution;