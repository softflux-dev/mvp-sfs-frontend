// src/app/admin/reports/tabs/taskStatusBreakdownChart.jsx — 
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value, fill }) => {
  if (!value) return null;
  const radius = outerRadius + 34;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const x1 = cx + (outerRadius + 5)  * Math.cos(-midAngle * RADIAN);
  const y1 = cy + (outerRadius + 5)  * Math.sin(-midAngle * RADIAN);
  const x2 = cx + (outerRadius + 22) * Math.cos(-midAngle * RADIAN);
  const y2 = cy + (outerRadius + 22) * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <circle cx={x1} cy={y1} r={3} fill="#ccc" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ccc" strokeWidth={1} />
      <text
        x={x} y={y}
        fill="#67768B"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10.5}
        fontWeight={500}
        fontFamily='"Poppins", sans-serif'
      >
        {`${name}: ${value}`}
      </text>
    </g>
  );
};

const LegendDot = ({ color, label, dimmed }) => (
  <Stack direction="row" alignItems="center" spacing={0.8}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, opacity: dimmed ? 0.35 : 1 }} />
    <Typography fontSize={12} color={dimmed ? "text.disabled" : "text.secondary"} sx={{ opacity: dimmed ? 0.6 : 1 }}>
      {label}
    </Typography>
  </Stack>
);

/**
 * Props:
 *   data    — [{ name, value, color }, ...]  (all stages, including zero-value ones)
 *   loading — boolean
 *   emptyLabel — text shown when there's no project selected / no data at all
 */
const TaskStatusBreakdownChart = ({ data = [], loading = false, emptyLabel = "No tasks for this project." }) => {
  const pieData = data.filter((d) => d.value > 0); // hide zero slices from the pie itself
  const hasData = pieData.length > 0;

  return (
    <Box>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1}>
        Task Status Breakdown
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={340}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !hasData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={340}>
          <Typography fontSize={13} color="text.secondary">{emptyLabel}</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <PieChart margin={{ top: 55, right: 55, bottom: 55, left: 55 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                borderRadius: "10px",
                fontSize: "12px",
                fontFamily: '"Poppins", sans-serif',
                border: "1px solid #F5F5F5",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {!loading && data.length > 0 && (
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mt={1}>
          {data.map((item) => (
            <LegendDot key={item.name} color={item.color} label={item.name} dimmed={item.value === 0} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TaskStatusBreakdownChart;