import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Mon", hours: 0.5 },
  { name: "Tue", hours: 3   },
  { name: "Wed", hours: 1.5 },
  { name: "Thu", hours: 3.5 },
  { name: "Fri", hours: 0.8 },
  { name: "Sat", hours: 3   },
  { name: "Sun", hours: 1   },
];

const totalHrs  = Math.floor(chartData.reduce((s, d) => s + d.hours, 0));
const totalMins = Math.round((chartData.reduce((s, d) => s + d.hours, 0) - totalHrs) * 60);

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
      }}>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          {d.name === "Mon" ? "Monday"
            : d.name === "Tue" ? "Tuesday"
            : d.name === "Wed" ? "Wednesday"
            : d.name === "Thu" ? "Thursday"
            : d.name === "Fri" ? "Friday"
            : d.name === "Sat" ? "Saturday"
            : "Sunday"}
        </Typography>
        <Typography fontSize="12px" color="#AA2493">
          Working Hours:{" "}
          <Typography component="span" fontSize="12px" fontWeight={700} color="#AA2493">
            {d.hours}hrs
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
        <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        fill="url(#hoursGradient)" rx={8} ry={8}
      />
    </g>
  );
};

const DailyHoursChart = ({ breakdown = chartData }) => {
  // build chart data from breakdown if passed
  const data = breakdown.length
    ? breakdown.map((d) => ({
        name: d.day?.slice(0, 3),
        hours: d.hours === "–" ? 0 : parseFloat(d.hours) || 0,
      }))
    : chartData;

  const total     = data.reduce((s, d) => s + d.hours, 0);
  const hrs       = Math.floor(total);
  const mins      = Math.round((total - hrs) * 60);
  const maxY      = Math.max(...data.map((d) => d.hours), 4);

  return (
    <Box mt={3}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Daily Hours Worked
        </Typography>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          Total: {hrs} hrs {mins} min
        </Typography>
      </Box>

      {/* ── Chart ──────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={50} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxY)]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="hours" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DailyHoursChart;