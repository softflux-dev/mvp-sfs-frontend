// src/app/empPortal/myAttendance/dailyHoursChart.jsx
import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const DAY_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

// The API returns hours as a formatted label like "8h 30m". parseFloat() on
// that yields 8 — silently discarding the minutes on every bar. Parse both
// parts properly.
const parseHoursLabel = (str) => {
  if (!str || str === "–" || str === "-") return 0;
  const m = String(str).match(/(\d+)h\s*(\d+)?m?/);
  if (!m) return parseFloat(str) || 0;
  return (parseInt(m[1], 10) || 0) + (parseInt(m[2], 10) || 0) / 60;
};

const fmtTotal = (decimal) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h} hrs ${m} min`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    const h = Math.floor(d.hours);
    const m = Math.round((d.hours - h) * 60);
    return (
      <Box sx={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          {DAY_FULL[d.name] || d.name}
        </Typography>
        <Typography fontSize="12px" color="#AA2493">
          Working Hours:{" "}
          <Typography component="span" fontSize="12px" fontWeight={700} color="#AA2493">
            {h}h {m}m
          </Typography>
        </Typography>
        {d.isOffDay && (
          <Typography fontSize="11px" color="#F97316" mt={0.5}>
            Non-working day
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

const GradientBar = (props) => {
  const { x, y, width, height, payload } = props;
  // Non-working days get the orange overtime gradient so the chart reads at
  // a glance rather than needing the tooltip.
  const gradId = payload?.isOffDay ? "hoursGradientOff" : "hoursGradient";
  return (
    <g>
      <defs>
        <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
        <linearGradient id="hoursGradientOff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        fill={`url(#${gradId})`} rx={8} ry={8}
      />
    </g>
  );
};

const DailyHoursChart = ({ breakdown = [] }) => {
  const data = (breakdown || []).map((d) => ({
    name:     d.day?.slice(0, 3),
    hours:    parseHoursLabel(d.hours),
    isOffDay: !!d.isOffDay,
  }));

  const total = data.reduce((s, d) => s + d.hours, 0);
  const maxY  = Math.max(...data.map((d) => d.hours), 4);

  return (
    <Box mt={3}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Daily Hours Worked
        </Typography>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          Total: {fmtTotal(total)}
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