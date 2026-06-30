// EmployeeProductivityChart.jsx — FULL REPLACEMENT
// Metric: Tasks Assigned vs Completed On Time per employee
// Dropdown filters to show all or a single employee
import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Menu, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { getEmployeeProductivityApi } from "../../../api/modules/dashboard";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const assigned        = payload.find((p) => p.dataKey === "Assigned")?.value ?? 0;
    const completedOnTime = payload.find((p) => p.dataKey === "Completed On Time")?.value ?? 0;
    const rate = assigned > 0 ? Math.round((completedOnTime / assigned) * 100) : 0;
    return (
      <Box sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 160 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1F2937", mb: 0.5, fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: "#022179", fontFamily: '"Poppins", sans-serif' }}>Assigned: {assigned}</Typography>
        <Typography sx={{ fontSize: 12, color: "#04C373", fontFamily: '"Poppins", sans-serif' }}>Completed On Time: {completedOnTime}</Typography>
        <Typography sx={{ fontSize: 12, color: "#AA2493", fontWeight: 600, mt: 0.5, fontFamily: '"Poppins", sans-serif' }}>On-Time Rate: {rate}%</Typography>
      </Box>
    );
  }
  return null;
};

const EmployeeProductivityChart = () => {
  const [allData,          setAllData]          = useState([]); // full dataset
  const [allEmployees,     setAllEmployees]      = useState([]); // for dropdown
  const [selectedEmployee, setSelectedEmployee]  = useState(null); // null = all
  const [anchorEl,         setAnchorEl]          = useState(null);
  const [loading,          setLoading]           = useState(true);

  useEffect(() => {
    setLoading(true);
    getEmployeeProductivityApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const data      = res.data.data.data      || [];
        const employees = res.data.data.employees || [];
        setAllData(data);
        setAllEmployees(employees);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Filter chart data based on selected employee
  const chartData = selectedEmployee
    ? allData.filter((d) => d.name === selectedEmployee.name)
    : allData;

  const hasData = chartData.some((d) => d["Assigned"] > 0 || d["Completed On Time"] > 0);
  const selectedLabel = selectedEmployee?.name || "All Employees";

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", padding: { xs: "16px", md: "24px" }, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography fontSize="20px" fontWeight={600} color="text.primary">
            Employee Productivity
          </Typography>
          <Typography fontSize="12px" color="text.secondary" mt={0.3}>
            Tasks assigned vs completed on time
          </Typography>
        </Box>

        {/* Employee selector */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "#F5F5F5", borderRadius: "12px", padding: "8px 16px", cursor: "pointer", minWidth: "150px", justifyContent: "space-between", "&:hover": { backgroundColor: "#EDEDED" } }}
        >
          <Typography fontSize={14} fontWeight={500} color="text.primary" noWrap>{selectedLabel}</Typography>
          <ChevronDown size={16} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: "18px", minWidth: 200, p: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 1 } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => { setSelectedEmployee(null); setAnchorEl(null); }}
            sx={{
              borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
              color: !selectedEmployee ? "#fff" : "text.primary",
              background: !selectedEmployee ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
              "&:hover": { background: !selectedEmployee ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
            }}
          >
            All Employees
          </MenuItem>
          {allEmployees.map((emp) => (
            <MenuItem
              key={emp._id}
              onClick={() => { setSelectedEmployee(emp); setAnchorEl(null); }}
              sx={{
                borderRadius: "12px", fontSize: "14px", fontWeight: 500, mb: 0.5,
                color: selectedEmployee?._id === emp._id ? "#fff" : "text.primary",
                background: selectedEmployee?._id === emp._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "transparent",
                "&:hover": { background: selectedEmployee?._id === emp._id ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#F5F5F5" },
              }}
            >
              {emp.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !hasData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography fontSize={13} color="text.secondary">No task data available.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barSize={32} barGap={4} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280", fontFamily: '"Poppins", sans-serif' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: "12px", fontFamily: '"Poppins", sans-serif', paddingTop: "16px" }} />
            <Bar dataKey="Assigned"           fill="#022179" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Completed On Time"  fill="#04C373" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default EmployeeProductivityChart;