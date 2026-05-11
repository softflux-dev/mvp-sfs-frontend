import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weeklyData = [
  { day: "Mon", hours: 1  },
  { day: "Tue", hours: 3  },
  { day: "Wed", hours: 2  },
  { day: "Thu", hours: 4  },
  { day: "Fri", hours: 1  },
  { day: "Sat", hours: 3  },
  { day: "Sun", hours: 1  },
];

const totalHours = weeklyData.reduce((sum, d) => sum + d.hours, 0);

const GradientBar = (props) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <defs>
        <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AA2493" />
          <stop offset="100%" stopColor="#022179" />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        fill="url(#weeklyGrad)" rx={8} ry={8}
      />
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
        padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "140px",
      }}>
        <Typography fontSize="13px" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        <Typography fontSize="12px" color="#AA2493" fontWeight={500}>
          Working Hours:{" "}
          <Typography component="span" fontWeight={700} fontSize="12px" color="#AA2493">
            {payload[0].value}hrs
          </Typography>
        </Typography>
      </Box>
    );
  }
  return null;
};

const WeeklyProductivity = () => {
  const [weekLabel, setWeekLabel] = useState("Mar 14 – Mar 20, 2026");

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      mb: 3,
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Weekly Productivity
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <ChevronLeft size={18} />
          </IconButton>
          <Typography fontSize="13px" fontWeight={500} color="text.secondary">
            {weekLabel}
          </Typography>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <ChevronRight size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={weeklyData} barSize={55}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="hours" shape={<GradientBar />} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Total hours */}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Typography fontSize="14px" color="text.secondary">
          Total Hours This Week:{" "}
          <Typography component="span" fontSize="14px" fontWeight={700} color="text.primary">
            {totalHours}.8
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default WeeklyProductivity;