// performanceTabs/workloadDistribution.jsx
import React, { useState, useMemo } from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const GradientHBar = (props) => {
  const { x, y, width, height, index } = props;
  const gradId = `wlGrad_${index}`;
  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#022179" />
          <stop offset="100%" stopColor="#AA2493" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height}
        fill={`url(#${gradId})`} rx={6} ry={6} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{
        bgcolor: "#fff", border: "1px solid #E5E7EB",
        borderRadius: "10px", p: "8px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Typography fontSize={13} fontWeight={600} color="text.primary">
          {payload[0].payload.name}
        </Typography>
        <Typography fontSize={12} color="#AA2493">
          Active Tasks: {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const WorkloadDistribution = ({ data = [], loading = false }) => {
  const [selected, setSelected] = useState("All Employees");
  const [anchorEl, setAnchorEl] = useState(null);

  // ── Build dropdown options from the real team members in `data` ─────────
  const employees = useMemo(() => ["All Employees", ...data.map((d) => d.name)], [data]);

  const chartData = selected === "All Employees"
    ? data
    : data.filter((d) => d.name === selected);

  const maxVal = Math.max(2, ...data.map((d) => d.activeTasks));

  return (
    <Box sx={{
      bgcolor: "#fff", borderRadius: "25px",
      p: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography fontSize="18px" fontWeight={600} color="text.primary">
          Active Tasks Distribution
        </Typography>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            bgcolor: "#F5F5F5", borderRadius: "12px",
            px: 2, py: 1, cursor: "pointer",
            "&:hover": { bgcolor: "#EDEDED" },
          }}
        >
          <Typography fontSize={13} fontWeight={500} color="text.primary">
            {selected}
          </Typography>
          <ChevronDown size={15} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: { borderRadius: "18px", minWidth: 180, p: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1 },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {employees.map((emp) => (
            <MenuItem
              key={emp}
              onClick={() => { setSelected(emp); setAnchorEl(null); }}
              sx={{
                borderRadius: "10px", fontSize: "13px", fontWeight: 500, mb: 0.5,
                color: selected === emp ? "#fff" : "text.primary",
                background: selected === emp
                  ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                  : "transparent",
                "&:hover": {
                  background: selected === emp
                    ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                    : "#F5F5F5",
                },
              }}
            >
              {emp}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography fontSize={13} color="text.secondary">Loading...</Typography>
        </Box>
      ) : !data.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography fontSize={13} color="text.secondary">No active workload data.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 60 + 40)}>
          <BarChart
            layout="vertical"
            data={chartData}
            barSize={20}
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxVal]}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }} tickLine={false}
            />
            <YAxis
              type="category" dataKey="name" width={55}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="activeTasks" shape={<GradientHBar />} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default WorkloadDistribution;