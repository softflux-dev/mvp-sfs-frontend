// src/app/admin/dashboard/attendanceOverviewChart.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import { Box, Typography, Stack, CircularProgress, Menu, MenuItem, TextField } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer }                   from "recharts";
import { ChevronDown }                                                          from "lucide-react";
import { getAttendanceOverviewApi }                                             from "../../../api/modules/dashboard";

const RANGE_OPTIONS = [
  { label: "This Week",     value: "this_week"    },
  { label: "This Month",    value: "this_month"   },
  { label: "Last Month",    value: "last_month"   },
  { label: "Last 3 Months", value: "last_3_months"},
  { label: "Custom Range",  value: "custom"       },
];

const LegendDot = ({ color, label }) => (
  <Stack direction="row" alignItems="center" spacing={0.8}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
    <Typography fontSize={12} color="text.secondary">{label}</Typography>
  </Stack>
);

const AttendanceOverviewChart = () => {
  const [data,        setData]        = useState([
    { name: "Present",  value: 0, color: "#030229" },
    { name: "Late",     value: 0, color: "#022179" },
    { name: "Absent",   value: 0, color: "#FF0000" },
    { name: "On Leave", value: 0, color: "#04C373" },
  ]);
  const [loading,     setLoading]     = useState(true);
  const [monthLabel,  setMonthLabel]  = useState("");
  const [range,       setRange]       = useState("this_month");
  const [anchorEl,    setAnchorEl]    = useState(null);
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");
  const [showCustom,  setShowCustom]  = useState(false);

  const selectedLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label || "This Month";

  const fetchData = (r = range, cs = customStart, ce = customEnd) => {
    setLoading(true);
    const params = new URLSearchParams({ range: r });
    if (r === "custom" && cs) { params.set("customStart", cs); params.set("customEnd", ce || cs); }

    getAttendanceOverviewApi(`?${params.toString()}`).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const d = res.data.data;
        setData([
          { name: "Present",  value: d.present  ?? 0, color: "#030229" },
          { name: "Late",     value: d.late     ?? 0, color: "#022179" },
          { name: "Absent",   value: d.absent   ?? 0, color: "#FF0000" },
          { name: "On Leave", value: d.onLeave  ?? 0, color: "#04C373" },
        ]);
        setMonthLabel(d.monthLabel || "");
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRangeSelect = (val) => {
    setAnchorEl(null);
    if (val === "custom") {
      setRange("custom");
      setShowCustom(true);
    } else {
      setRange(val);
      setShowCustom(false);
      setCustomStart("");
      setCustomEnd("");
      fetchData(val, "", "");
    }
  };

  const handleCustomApply = () => {
    if (!customStart) return;
    setShowCustom(false);
    fetchData("custom", customStart, customEnd);
  };

  const pieData = data.filter((d) => d.value > 0);
  const hasData = pieData.length > 0;

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", padding: { xs: "16px", md: "24px" }, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography fontSize="18px" fontWeight={700} color="text.primary">
            Attendance Overview
          </Typography>
          {monthLabel && (
            <Typography fontSize="12px" color="text.secondary" mt={0.3}>{monthLabel}</Typography>
          )}
        </Box>

        {/* Range selector */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              backgroundColor: "#F5F5F5", borderRadius: "12px",
              padding: "8px 14px", cursor: "pointer", minWidth: "130px",
              justifyContent: "space-between",
              "&:hover": { backgroundColor: "#EDEDED" },
            }}
          >
            <Typography fontSize={13} fontWeight={500} color="text.primary">{selectedLabel}</Typography>
            <ChevronDown size={14} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: "16px", minWidth: 170, p: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", mt: 0.5 } }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                onClick={() => handleRangeSelect(opt.value)}
                sx={{
                  borderRadius: "10px", fontSize: "13px", fontWeight: 500, mb: 0.25,
                  color: range === opt.value ? "#fff" : "text.primary",
                  background: range === opt.value
                    ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                    : "transparent",
                  "&:hover": {
                    background: range === opt.value
                      ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                      : "#F5F5F5",
                  },
                }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Custom date range inputs */}
          {showCustom && (
            <Box sx={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 10,
              backgroundColor: "#fff", borderRadius: "16px", p: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 260,
              border: "1px solid #F0F0F0",
            }}>
              <Typography fontSize="12px" fontWeight={600} color="text.secondary" mb={1.5}
                sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Custom Date Range
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField
                  label="From" type="date" size="small" fullWidth
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="To" type="date" size="small" fullWidth
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: customStart }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <Box display="flex" gap={1}>
                  <Box
                    onClick={() => { setShowCustom(false); setRange("this_month"); fetchData("this_month", "", ""); }}
                    sx={{ flex: 1, py: 1, borderRadius: "10px", textAlign: "center", cursor: "pointer", border: "1px solid #E5E7EB", "&:hover": { backgroundColor: "#F5F5F5" } }}
                  >
                    <Typography fontSize="12px" color="text.secondary">Cancel</Typography>
                  </Box>
                  <Box
                    onClick={handleCustomApply}
                    sx={{
                      flex: 1, py: 1, borderRadius: "10px", textAlign: "center",
                      cursor: customStart ? "pointer" : "default",
                      background: customStart ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#E5E7EB",
                      opacity: customStart ? 1 : 0.6,
                    }}
                  >
                    <Typography fontSize="12px" fontWeight={600} color={customStart ? "#fff" : "#9CA3AF"}>Apply</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Chart */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={240}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : !hasData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={240}>
          <Typography fontSize={13} color="text.secondary">No attendance data for this period.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={70} outerRadius={100}
              paddingAngle={3} dataKey="value"
              labelLine={false} label={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                borderRadius: "12px", fontSize: "13px",
                fontFamily: '"Poppins", sans-serif',
                border: "1px solid #F0F0F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" mt={1}>
        {data.map((item) => (
          <LegendDot key={item.name} color={item.color} label={item.name} />
        ))}
      </Stack>
    </Box>
  );
};

export default AttendanceOverviewChart;