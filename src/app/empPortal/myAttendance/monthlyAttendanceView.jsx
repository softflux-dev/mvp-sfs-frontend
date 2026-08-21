// src/app/empPortal/myAttendance/monthlyAttendanceView.jsx — Phase 4 (Leave Management Enhancement)
// Added: "Leave-Unpaid" status color + legend entry, distinct from paid "Leave".

import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import { useMonthlyCalendar } from "../../../hooks/employeeAttendance";

const DAY_STATUS_CONFIG = {
  Present:      { bg: "#04C3731A", color: "#04C373" },
  Absent:       { bg: "#FF00001A", color: "#FF0000" },
  Late:         { bg: "#F973161A", color: "#F97316" },
  Leave:        { bg: "#2B6EFF1A", color: "#2B6EFF" },
  "Leave-Unpaid": { bg: "#F59E0B1A", color: "#F59E0B" },   
  Holiday:      { bg: "#AA24931A", color: "#AA2493" },
  "Off Day":    { bg: "#F5F5F5",   color: "#9CA3AF" },
};

// Friendlier chip label for the unpaid variant — the raw enum value reads oddly.
const DAY_STATUS_LABEL = {
  "Leave-Unpaid": "Unpaid Leave",
};

const LegendDot = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.75}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
    <Typography fontSize="12px" color="text.secondary">{label}</Typography>
  </Box>
);

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MonthlyAttendanceView = ({ selectedMonth, selectedYear }) => {
  const { dayMap, offDays = [], loading } = useMonthlyCalendar(selectedMonth, selectedYear);

  const year      = selectedYear;
  const month     = selectedMonth;
  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

  const firstDay    = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">Monthly Calendar View</Typography>
        <Typography fontSize="13px" color="text.secondary">{monthName} {year}</Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
            {WEEKDAYS.map((d) => (
              <Typography key={d} fontSize="11px" fontWeight={600} color="text.secondary" textAlign="center" sx={{ py: 0.5 }}>{d}</Typography>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid #F0F0F0", borderRadius: "12px", overflow: "hidden" }}>
            {cells.map((day, idx) => {
              const status = day ? (dayMap[day] || (offDays.includes(day) ? "Off Day" : null)) : null;
              const cfg = status ? DAY_STATUS_CONFIG[status] : null;
              const label = status ? (DAY_STATUS_LABEL[status] || status) : "";
              return (
                <Box key={idx} sx={{
                  minHeight: { xs: "70px", md: "90px" }, p: 1,
                  borderRight:  idx % 7 !== 6 ? "1px solid #F0F0F0" : "none",
                  borderBottom: idx < cells.length - 7 ? "1px solid #F0F0F0" : "none",
                  bgcolor: day ? "#fff" : "#FAFAFA", position: "relative",
                }}>
                  {day && (
                    <>
                      <Typography fontSize="12px" fontWeight={500} color={cfg ? cfg.color : "text.secondary"} sx={{ position: "absolute", top: 8, right: 10 }}>
                        {day}
                      </Typography>
                      {cfg && (
                        <Box sx={{ mt: "28px" }}>
                          <Chip label={label} size="small" sx={{ height: "20px", fontSize: "10px", fontWeight: 500, borderRadius: "8px", backgroundColor: cfg.bg, color: cfg.color, "& .MuiChip-label": { px: 1 } }} />
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
            <LegendDot color="#04C373" label="Present" />
            <LegendDot color="#FF0000" label="Absent"  />
            <LegendDot color="#F97316" label="Late"    />
            <LegendDot color="#2B6EFF" label="Leave (Paid)" />
            <LegendDot color="#F59E0B" label="Leave (Unpaid)" />
            <LegendDot color="#AA2493" label="Holiday" />
            <LegendDot color="#9CA3AF" label="Off Day" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default MonthlyAttendanceView;