// app/empPortal/dashboard/empAttendance.jsx — 
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const GradientBar = (props) => {
  const { x, y, width, height, name } = props;
  const id = `attGrad-${name}`;
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
      <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Typography fontSize="12px" fontWeight={600} color="text.primary">{label}</Typography>
        <Typography fontSize="12px" color="#AA2493">{payload[0].value} days</Typography>
      </Box>
    );
  }
  return null;
};

const EmpAttendance = ({ attendance, loading, onViewFull }) => {
  const chartData = attendance?.chartData || [
    { name: "Present", value: 0 },
    { name: "Late",    value: 0 },
    { name: "Absent",  value: 0 },
    { name: "Leave",   value: 0 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.value), 5);

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography fontSize="16px" fontWeight={700} color="text.primary">
            Attendance
          </Typography>
          {attendance?.monthLabel && (
            <Typography fontSize="11px" color="text.secondary" mt={0.3}>
              {attendance.monthLabel}
            </Typography>
          )}
        </Box>
        <Box textAlign="right">
          <Typography fontSize="12px" color="text.secondary">Attendance Rate</Typography>
          {loading ? (
            <Typography fontSize="18px" fontWeight={700} color="text.primary">—</Typography>
          ) : (
            <Typography fontSize="18px" fontWeight={700} color="text.primary">
              {attendance?.attendanceRate || "0%"}
            </Typography>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={220}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            barSize={18}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, Math.ceil(maxVal / 5) * 5]}
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
      )}

      {onViewFull && (
        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Typography
            fontSize="13px" fontWeight={600}
            sx={{ cursor: "pointer", background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
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