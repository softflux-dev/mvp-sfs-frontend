// EmployeeProductivityChart.jsx
import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChevronDown } from "lucide-react";

const allData = {
  "All Employees": [
    { day: "Mon", aliHassan: 2,   omarFarooq: 2,   usmanShah: 1,   saraKhan: 2   },
    { day: "Tue", aliHassan: 3,   omarFarooq: 3.5, usmanShah: 2,   saraKhan: 1.5 },
    { day: "Wed", aliHassan: 3.2, omarFarooq: 4,   usmanShah: 3,   saraKhan: 2.5 },
    { day: "Thr", aliHassan: 4,   omarFarooq: 5,   usmanShah: 6,   saraKhan: 3.5 },
    { day: "Fri", aliHassan: 5.5, omarFarooq: 8,   usmanShah: 6,   saraKhan: 4   },
    {day: "Sat", aliHassan: 0,   omarFarooq: 0,   usmanShah: 0,   saraKhan: 0   },
    {day: "Sun", aliHassan: 0,   omarFarooq: 0,   usmanShah: 0,   saraKhan: 0   },
  ],
  "Ali Hassan": [
    { day: "Mon", aliHassan: 2   },
    { day: "Tue", aliHassan: 3   },
    { day: "Wed", aliHassan: 3.2 },
    { day: "Thr", aliHassan: 4   },
    { day: "Fri", aliHassan: 5.5 },
    {day: "Sat", aliHassan: 0   },
    {day: "Sun", aliHassan: 0   },
  ],
  "Omar Farooq": [
    { day: "Mon", omarFarooq: 2   },
    { day: "Tue", omarFarooq: 3.5 },
    { day: "Wed", omarFarooq: 4   },
    { day: "Thr", omarFarooq: 5   },
    { day: "Fri", omarFarooq: 8   },
    {day: "Sat", omarFarooq: 0   },
    {day: "Sun", omarFarooq: 0   },
  ],
  "Usman Shah": [
    { day: "Mon", usmanShah: 1 },
    { day: "Tue", usmanShah: 2 },
    { day: "Wed", usmanShah: 3 },
    { day: "Thr", usmanShah: 6 },
    { day: "Fri", usmanShah: 6 },
    {day: "Sat", usmanShah: 0 },
    {day: "Sun", usmanShah: 0 },
  ],
  "Sara Khan": [
    { day: "Mon", saraKhan: 2   },
    { day: "Tue", saraKhan: 1.5 },
    { day: "Wed", saraKhan: 2.5 },
    { day: "Thr", saraKhan: 3.5 },
    { day: "Fri", saraKhan: 4   },
    {day: "Sat", saraKhan: 0   },
    {day: "Sun", saraKhan: 0   },
  ],
};

const employees = ["All Employees", "Ali Hassan", "Omar Farooq", "Usman Shah", "Sara Khan"];

const lineConfig = [
  { key: "aliHassan",  color: "#022179", label: "Ali Hassan"  },
  { key: "omarFarooq", color: "#F97316", label: "Omar Farooq" },
  { key: "usmanShah",  color: "#04C373", label: "Usman Shah"  },
  { key: "saraKhan",   color: "#AA2493", label: "Sara Khan"   },
];

const CustomLegend = ({ activeLines }) => (
  <Box display="flex" gap={3} justifyContent="center" mt={2}>
    {activeLines.map(({ key, color, label }) => (
      <Box key={key} display="flex" alignItems="center" gap={0.75}>
        <Box sx={{ width: 24, height: 3, backgroundColor: color, borderRadius: 2 }} />
        <Typography fontSize="12px" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);

const EmployeeProductivityChart = () => {
  const [selected, setSelected] = useState("All Employees");
  const [anchorEl, setAnchorEl] = useState(null);

  const data = allData[selected];
  const activeLines = selected === "All Employees"
    ? lineConfig
    : lineConfig.filter((l) => data[0]?.[l.key] !== undefined);

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary">
          Employee Productivity
        </Typography>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            backgroundColor: "#F5F5F5", borderRadius: "12px",
            padding: "8px 16px", cursor: "pointer",
            minWidth: "150px", justifyContent: "space-between",
            "&:hover": { backgroundColor: "#EDEDED" },
          }}
        >
          <Typography fontSize={14} fontWeight={500} color="text.primary">
            {selected}
          </Typography>
          <ChevronDown size={16} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: "18px", minWidth: 200,
              p: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {employees.map((emp) => (
            <MenuItem
              key={emp}
              onClick={() => { setSelected(emp); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "14px", fontWeight: 500,
                color: selected === emp ? "#fff" : "text.primary",
                background: selected === emp
                  ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                  : "transparent",
                mb: 0.5,
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

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
            axisLine={{ stroke: "#F5F5F5" }}
            tickLine={false}
          />
         <YAxis
          domain={[0, 8]}
          ticks={[0, 2, 4, 6, 8]}
          tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
          axisLine={false}
          tickLine={false}
          width={50}
          label={{
            value: "Task",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' },
          }}
        />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #F5F5F5",
              borderRadius: "10px",
              fontSize: "12px",
              fontFamily: '"Poppins", sans-serif',
            }}
          />
          {activeLines.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <CustomLegend activeLines={activeLines} />
    </Box>
  );
};

export default EmployeeProductivityChart;