// EmployeeProductivityChart.jsx 
import React, { useState, useEffect } from "react";
import { Box, Typography, Menu, MenuItem, CircularProgress } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { getEmployeeProductivityApi } from "../../../api/modules/dashboard";

const CustomLegend = ({ employees }) => (
  <Box display="flex" gap={3} justifyContent="center" mt={2} flexWrap="wrap">
    {employees.map((e) => (
      <Box key={e._id} display="flex" alignItems="center" gap={0.75}>
        <Box sx={{ width: 24, height: 3, backgroundColor: e.color, borderRadius: 2 }} />
        <Typography fontSize="12px" color="text.secondary" fontWeight={500}>{e.name}</Typography>
      </Box>
    ))}
  </Box>
);

const EmployeeProductivityChart = () => {
  const [allEmployees,    setAllEmployees]    = useState([]); // full list for dropdown
  const [selectedEmployee, setSelectedEmployee] = useState(null); // null = all
  const [chartData,       setChartData]       = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]); // employees in current view
  const [anchorEl,        setAnchorEl]        = useState(null);
  const [loading,         setLoading]         = useState(true);

  // Fetch on mount and when filter changes
  useEffect(() => {
    setLoading(true);
    getEmployeeProductivityApi(selectedEmployee?._id || "").then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const { data, employees } = res.data.data;
        setChartData(data || []);
        setActiveEmployees(employees || []);
        // Populate dropdown list on first load
        if (!selectedEmployee && employees?.length) {
          setAllEmployees(employees);
        }
      }
    }).finally(() => setLoading(false));
  }, [selectedEmployee?._id]);

  const selectedLabel = selectedEmployee?.name || "All Employees";

  // Which employees to show lines for
  const linesToShow = selectedEmployee
    ? activeEmployees.filter((e) => e._id?.toString() === selectedEmployee._id?.toString())
    : activeEmployees;

  const maxVal = Math.max(
    ...chartData.flatMap((d) => linesToShow.map((e) => d[e.key] || 0)),
    4
  );
  const yMax   = Math.ceil(maxVal / 2) * 2;
  const yTicks = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2);

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", padding: { xs: "16px", md: "24px" }, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary">
          Employee Productivity
        </Typography>

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
          {/* All Employees option */}
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
      ) : chartData.length === 0 || linesToShow.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography fontSize={13} color="text.secondary">No productivity data this week.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
              axisLine={{ stroke: "#F5F5F5" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={50}
              label={{ value: "Tasks", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12, fill: "#67768B", fontFamily: '"Poppins", sans-serif' } }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #F5F5F5", borderRadius: "10px", fontSize: "12px", fontFamily: '"Poppins", sans-serif' }}
            />
            {linesToShow.map((emp) => (
              <Line
                key={emp._id}
                type="monotone"
                dataKey={emp.key}
                stroke={emp.color}
                strokeWidth={3}
                dot={{ fill: emp.color, r: 4 }}
                activeDot={{ r: 6 }}
                name={emp.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && linesToShow.length > 0 && (
        <CustomLegend employees={linesToShow} />
      )}
    </Box>
  );
};

export default EmployeeProductivityChart;