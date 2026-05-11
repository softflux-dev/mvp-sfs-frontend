import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const COMPLETION_RATE = 15;

const donutData = [
  { name: "Completed", value: COMPLETION_RATE       },
  { name: "Remaining", value: 100 - COMPLETION_RATE },
];

const COLORS = ["#48B504", "#F0F0F0"];
const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, index }) => {
  if (index !== 0) return null;

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
      <text
        x={textX}
        y={ly}
        fill="#48B504"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fontFamily='"Poppins", sans-serif'
      >
        Completion Rate {COMPLETION_RATE}%
      </text>
    </g>
  );
};

const MonthlyPerformance = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",
    }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
        Monthly Performance
      </Typography>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 40 }}>
          <Pie
            data={donutData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
            labelLine={false}
            label={renderCustomLabel}
          >
            {donutData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Bottom stats */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={1}>
        <Box>
          <Typography fontSize="12px" color="text.secondary">Tasks Completed</Typography>
          <Typography fontSize="22px" fontWeight={700} color="text.primary">42</Typography>
        </Box>
        <Box textAlign="right">
          <Typography fontSize="12px" color="text.secondary">vs Last Month</Typography>
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
            <TrendingUp size={16} color="#48B504" />
            <Typography fontSize="16px" fontWeight={700} color="text.primary">5.2%</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MonthlyPerformance;