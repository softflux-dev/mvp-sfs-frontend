import { useState } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_STATUS_CONFIG = {
  Present: { bg: "#04C3731A", color: "#04C373" },
  Absent:  { bg: "#FF00001A", color: "#FF0000" },
  Late:    { bg: "#F973161A", color: "#F97316" },
  Leave:   { bg: "#2B6EFF1A", color: "#2B6EFF" },
  Holiday: { bg: "#AA24931A", color: "#AA2493" },
  Weekend: { bg: "#F5F5F5",   color: "#9CA3AF" },
};

const MOCK_CALENDAR = {
  "2026-03": {
    2:  "Present", 3:  "Present", 4:  "Absent",
    5:  "Leave",   6:  "Present", 9:  "Present",
    10: "Late",    11: "Present", 12: "Present",
    13: "Present", 16: "Absent",  17: "Present",
    18: "Present", 19: "Present", 20: "Holiday",
    23: "Present", 24: "Present", 25: "Present",
    26: "Late",    27: "Present",
  },
  "2026-04": {
    1: "Present",  2: "Present",  3: "Absent",
    6: "Present",  7: "Present",  8: "Late",
    9: "Present", 10: "Present", 13: "Present",
  },
};

const LegendDot = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.75}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
    <Typography fontSize="12px" color="text.secondary" fontWeight={400}>{label}</Typography>
  </Box>
);

const MonthlyCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const key       = `${year}-${String(month + 1).padStart(2, "0")}`;
  const dayMap    = MOCK_CALENDAR[key] || {};
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDay    = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isWeekend = (cellIndex) => {
    const col = cellIndex % 7;
    return col === 5 || col === 6;
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Monthly Calendar View
        </Typography>

        {/* ── Month navigation ─────────────────────────────────────────── */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            onClick={handlePrev}
            size="small"
            sx={{
              bgcolor: "#F5F5F5",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "#E0E0E0" },
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>

          <Box sx={{ px: 2, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px" }}>
            <Typography fontSize="13px" fontWeight={600} color="text.primary">
              {monthName} {year}
            </Typography>
          </Box>

          <IconButton
            onClick={handleNext}
            size="small"
            sx={{
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { opacity: 0.9 },
            }}
          >
            <ChevronRight size={16} color="#fff" />
          </IconButton>
        </Box>
      </Box>

      {/* ── Weekday headers ─────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
        {weekdays.map((d) => (
          <Typography
            key={d}
            fontSize="11px"
            fontWeight={600}
            color="text.secondary"
            textAlign="center"
            sx={{ py: 0.5 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* ── Calendar grid ───────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid #F0F0F0",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {cells.map((day, idx) => {
          const status     = day ? (isWeekend(idx) ? "Weekend" : dayMap[day] || null) : null;
          const cfg        = status ? DAY_STATUS_CONFIG[status] : null;
          const hasBorderR = idx % 7 !== 6;
          const hasBorderB = idx < cells.length - 7;

          return (
            <Box
              key={idx}
              sx={{
                minHeight: { xs: "70px", md: "90px" },
                p: 1,
                borderRight:  hasBorderR ? "1px solid #F0F0F0" : "none",
                borderBottom: hasBorderB ? "1px solid #F0F0F0" : "none",
                bgcolor: day ? "#fff" : "#FAFAFA",
                position: "relative",
              }}
            >
              {day && (
                <>
                  <Typography
                    fontSize="12px"
                    fontWeight={500}
                    color={cfg ? cfg.color : "text.secondary"}
                    sx={{ position: "absolute", top: 8, right: 10 }}
                  >
                    {day}
                  </Typography>
                  {cfg && (
                    <Box sx={{ mt: "28px" }}>
                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "10px",
                          fontWeight: 500,
                          borderRadius: "8px",
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        <LegendDot color="#04C373" label="Present" />
        <LegendDot color="#FF0000" label="Absent"  />
        <LegendDot color="#F97316" label="Late"    />
        <LegendDot color="#2B6EFF" label="Leave"   />
        <LegendDot color="#AA2493" label="Holiday" />
        <LegendDot color="#9CA3AF" label="Weekend" />
      </Box>
    </Box>
  );
};

export default MonthlyCalendarView;