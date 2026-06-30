// app/empPortal/dashboard/monthlyPerformance.jsx — FULL REPLACEMENT
import { Box, Typography, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["#48B504", "#F0F0F0"];
const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, index, value }) => {
  if (index !== 0 || !value) return null;
  const LINE_LENGTH = 30;
  const ex = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const ey = cy + outerRadius * Math.sin(-midAngle * RADIAN);
  const lx = cx + (outerRadius + LINE_LENGTH) * Math.cos(-midAngle * RADIAN);
  const ly = cy + (outerRadius + LINE_LENGTH) * Math.sin(-midAngle * RADIAN);
  const isRight    = lx > cx;
  const textAnchor = isRight ? "start" : "end";
  const textX      = lx + (isRight ? 4 : -4);

  return (
    <g>
      <circle cx={ex} cy={ey} r={4} fill="#fff" stroke="#48B504" strokeWidth={2} />
      <line x1={ex} y1={ey} x2={lx} y2={ly} stroke="#48B504" strokeWidth={1} />
      <text x={textX} y={ly} fill="#48B504" textAnchor={textAnchor} dominantBaseline="central"
        fontSize={12} fontWeight={600} fontFamily='"Poppins", sans-serif'>
        Completion Rate {value}%
      </text>
    </g>
  );
};

const MonthlyPerformance = ({ performance, loading }) => {
  const rate         = performance?.completionRate   ?? 0;
  const completed    = performance?.tasksCompleted   ?? 0;
  const vsLastMonth  = performance?.vsLastMonth      ?? 0;
  const trending     = performance?.trending         ?? "up";

  const donutData = [
    { name: "Completed", value: rate         },
    { name: "Remaining", value: 100 - rate   },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
        Monthly Performance
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={240}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 40 }}>
            <Pie
              data={donutData}
              cx="50%" cy="50%"
              innerRadius={65} outerRadius={90}
              startAngle={90} endAngle={-270}
              dataKey="value" strokeWidth={0}
              labelLine={false} label={renderCustomLabel}
            >
              {donutData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={1}>
        <Box>
          <Typography fontSize="12px" color="text.secondary">Tasks Completed</Typography>
          <Typography fontSize="22px" fontWeight={700} color="text.primary">
            {loading ? "—" : completed}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography fontSize="12px" color="text.secondary">vs Last Month</Typography>
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
            {trending === "up"
              ? <TrendingUp size={16} color="#48B504" />
              : <TrendingDown size={16} color="#FF0000" />
            }
            <Typography fontSize="16px" fontWeight={700} color="text.primary">
              {loading ? "—" : `${Math.abs(vsLastMonth)}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MonthlyPerformance;