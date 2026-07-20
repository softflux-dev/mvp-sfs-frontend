// performanceTabs/projectProgressChart.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LabelList,
} from "recharts";
import { BarChart3, PieChart, Palette, Layers, Boxes, Puzzle } from "lucide-react";

const ICONS = [BarChart3, PieChart, Palette, Layers, Boxes, Puzzle];

const COLORS = {
  completed:  "#04C373",
  inProgress: "#FFB020",
  pending:    "#9CA3AF",
};

const COLUMN_WIDTH    = 220;
const MIN_CHART_WIDTH = 560;
const AXIS_WIDTH   = 46;
const CHART_HEIGHT = 300;
const MARGIN = { top: 10, right: 20, left: 0, bottom: 5 };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <Typography fontSize={13} fontWeight={600} color="text.primary" mb={0.5}>{label}</Typography>
      <Typography fontSize={12} sx={{ color: COLORS.completed }}>Completed: {d?.completed ?? 0}</Typography>
      <Typography fontSize={12} sx={{ color: "#B8860B" }}>In Progress: {d?.inProgress ?? 0}</Typography>
      <Typography fontSize={12} sx={{ color: "#6B7280" }}>Pending: {d?.pending ?? 0}</Typography>
      <Typography fontSize={12} fontWeight={600} color="text.primary" mt={0.5}>
        Total: {d?.total ?? 0} · {d?.completionRate ?? 0}% complete
      </Typography>
    </Box>
  );
};

const centeredLabel = (fill) => (props) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle"
          fill={fill} fontSize={14} fontWeight={700}>
      {value}
    </text>
  );
};

const describeModule = (m) => {
  if (!m.total) return "No tasks added yet.";
  if (m.completionRate >= 80) return `Focused on ${m.total} total task${m.total !== 1 ? "s" : ""} with ${m.completionRate}% completion rate.`;
  if (m.pending >= m.completed && m.pending >= m.inProgress) return `Balanced task distribution with ${m.completionRate}% of deliverables completed.`;
  const activePct = Math.round(((m.completed + m.inProgress) / m.total) * 100);
  return `High activity — ${activePct}% of tasks active or finished.`;
};

// ── Clean, even Y-axis ticks (0, 2, 4, 6, 8, 10 style) ──────────────────────
const getNiceStep = (maxVal) => {
  if (maxVal <= 10)  return 2;
  if (maxVal <= 25)  return 5;
  if (maxVal <= 50)  return 10;
  if (maxVal <= 100) return 20;
  return Math.ceil(maxVal / 50) * 10;
};

const StaticLegend = () => (
  <Box display="flex" flexDirection="column" gap={1}>
    {[
      { label: "Completed",   color: COLORS.completed  },
      { label: "In Progress", color: COLORS.inProgress },
      { label: "Pending",     color: COLORS.pending    },
    ].map((item) => (
      <Box key={item.label} display="flex" alignItems="center" gap={0.75}>
        <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: item.color, flexShrink: 0 }} />
        <Typography fontSize={13} color="text.primary" whiteSpace="nowrap">{item.label}</Typography>
      </Box>
    ))}
  </Box>
);

const PerformanceProjectProgressChart = ({ data = [], loading = false }) => {
  const rawMax   = Math.max(10, ...data.map((d) => d.total || 0));
  const step     = getNiceStep(rawMax);
  const niceMax  = Math.ceil(rawMax / step) * step;
  const ticks    = Array.from({ length: niceMax / step + 1 }, (_, i) => i * step);

  const plotWidth  = Math.max(MIN_CHART_WIDTH - AXIS_WIDTH, data.length * COLUMN_WIDTH);
  const chartWidth = AXIS_WIDTH + plotWidth + MARGIN.left + MARGIN.right;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "25px", p: { xs: "16px", md: "24px" }, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

      {/* ── Header row: title on the left, legend on the right — same row,
             so the legend never floats in empty space relative to the
             (possibly much narrower) chart below it. Wraps on small
             screens instead of overflowing. ─────────────────────────────── */}
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
        <Box>
          <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={0.5}>
            Project Progress
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            Task breakdown by module — based on number of tasks assigned per module.
          </Typography>
        </Box>
        {!loading && data.length > 0 && <StaticLegend />}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <Typography fontSize={13} color="text.secondary">Loading...</Typography>
        </Box>
      ) : !data.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={280}>
          <Typography fontSize={13} color="text.secondary">No modules yet.</Typography>
        </Box>
      ) : (
        // Always allow horizontal scroll if content overflows — this is
        // what makes the chart genuinely responsive: on a wide desktop
        // with few modules it never scrolls (content fits); on a narrow
        // mobile viewport or with many modules, it scrolls automatically
        // without ever breaking the page's own layout.
        <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
          <Box sx={{ width: chartWidth }}>

            {/* Cards row */}
            <Box display="flex">
              <Box sx={{ width: AXIS_WIDTH + MARGIN.left, flexShrink: 0 }} />
              {data.map((m, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <Box key={m.moduleId || m.name} sx={{ width: COLUMN_WIDTH, pr: 2, boxSizing: "border-box", flexShrink: 0 }}>
                    <Box display="flex" gap={1}>
                      <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#F3E8FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={16} color="#AA2493" />
                      </Box>
                      <Box minWidth={0}>
                        <Typography fontSize={13} fontWeight={700} color="text.primary" noWrap title={m.name}>
                          {m.name}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          {describeModule(m)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Chart — fixed width matches cards row exactly */}
            <BarChart
              width={chartWidth}
              height={CHART_HEIGHT}
              data={data}
              barSize={64}
              margin={MARGIN}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} interval={0} />
              <YAxis
                width={AXIS_WIDTH}
                domain={[0, niceMax]}
                ticks={ticks}
                tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar dataKey="completed"  name="Completed"   stackId="tasks" fill={COLORS.completed}>
                <LabelList dataKey="completed" content={centeredLabel("#fff")} />
              </Bar>
              <Bar dataKey="inProgress" name="In Progress" stackId="tasks" fill={COLORS.inProgress}>
                <LabelList dataKey="inProgress" content={centeredLabel("#1F2937")} />
              </Bar>
              <Bar dataKey="pending"    name="Pending"     stackId="tasks" fill={COLORS.pending} radius={[6, 6, 0, 0]}>
                <LabelList dataKey="pending" content={centeredLabel("#fff")} />
              </Bar>
            </BarChart>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PerformanceProjectProgressChart;