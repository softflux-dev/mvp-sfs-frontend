import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const attendanceData = [
  { name: "Present", value: 8  },
  { name: "Late",    value: 12 },
  { name: "Absent",  value: 10 },
  { name: "Leave",   value: 28 },
];

const GradientBar = (props) => {
  const { x, y, width, height } = props;
  const id = `attGrad-${props.name}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#022179" />
          <stop offset="100%" stopColor="#AA2493" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height}
        fill={`url(#${id})`} rx={6} ry={6} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Typography fontSize="12px" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        <Typography fontSize="12px" color="#AA2493">
          {payload[0].value} days
        </Typography>
      </Box>
    );
  }
  return null;
};

const EmpAttendance = ({ onViewFull }) => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Typography fontSize="16px" fontWeight={700} color="text.primary">
          Attendance
        </Typography>
        <Box textAlign="right">
          <Typography fontSize="12px" color="text.secondary">
            Attendance Rate
          </Typography>
          <Typography fontSize="18px" fontWeight={700} color="text.primary">
            95%
          </Typography>
        </Box>
      </Box>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={attendanceData}
          margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 30]}
            ticks={[0, 10, 20, 30]}
            tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={55}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="value" shape={<GradientBar />} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* View Full Attendance link */}
      {onViewFull && (
        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Typography
            fontSize="13px"
            fontWeight={600}
            sx={{
              cursor: "pointer",
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            onClick={onViewFull}
          >
            View Full Attendance
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmpAttendance;