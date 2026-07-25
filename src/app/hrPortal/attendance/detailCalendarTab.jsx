// hrPortal/attendance/attendanceDetail/detailCalendarTab.jsx — 
import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  Present: { bg: "#290132", color: "#fff" },
  Late:    { bg: "#1000A3", color: "#fff" },
  Absent:  { bg: "#FF0004", color: "#fff" },
  Leave:   { bg: "#48B504", color: "#fff" },
  Holiday: { bg: "#AA2493", color: "#fff" },
};

const LEGEND = [
  { label: "Present",  color: "#290132" },
  { label: "Late",     color: "#1000A3" },
  { label: "Absent",   color: "#FF0004" },
  { label: "On Leave", color: "#48B504" },
  { label: "Holiday",  color: "#AA2493" },
];

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// dailyRecords = [{ date: "Jun 29, 2026", attendanceStatus: "Present", ... }]
// initialMonth/initialYear — month is 0-indexed
const DetailCalendarTab = ({ dailyRecords = [], initialMonth, initialYear }) => {
  const [currentDate, setCurrentDate] = useState(
    new Date(initialYear ?? new Date().getFullYear(), initialMonth ?? new Date().getMonth(), 1)
  );

  // Keep in sync if parent changes which month's records are loaded
  useEffect(() => {
    if (initialMonth !== undefined && initialYear !== undefined) {
      setCurrentDate(new Date(initialYear, initialMonth, 1));
    }
  }, [initialMonth, initialYear]);

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Build maps of day-of-month → status and → isNonWorkingDay for this month.
  // `isNonWorkingDay` comes straight from the backend (getEmployeeDetail),
  // which reads Settings → Working Days — the UI must not re-derive it.
  const dayMap    = {};
  const offDayMap = {};
  dailyRecords.forEach((rec) => {
    const d = new Date(rec.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      dayMap[d.getDate()]    = rec.attendanceStatus;
      offDayMap[d.getDate()] = !!rec.isNonWorkingDay;
    }
  });

  const firstDay    = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= trailing; d++) cells.push({ overflow: d });

  const counts = { Present: 0, Late: 0, Absent: 0, Leave: 0 };
  Object.values(dayMap).forEach((s) => {
    if (counts[s] !== undefined) counts[s]++;
  });

  // Days worked outside the configured working week — paid, but not required.
  const offDayWorked = Object.keys(dayMap).filter(
    (d) => offDayMap[d] && ["Present", "Late"].includes(dayMap[d])
  ).length;

  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={3}>

      {/* Month navigator */}
      <Box display="flex" alignItems="center" justifyContent="center" gap={3} mb={2}>
        <IconButton
          size="small"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          sx={{ border: "1px solid #E0E0E0", borderRadius: "50%", width: 30, height: 30 }}
        >
          <ChevronLeft size={15} />
        </IconButton>

        <Typography fontSize="15px" fontWeight={700} color="text.primary">
          {monthName} {year}
        </Typography>

        <IconButton
          size="small"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          sx={{ border: "1px solid #E0E0E0", borderRadius: "50%", width: 30, height: 30 }}
        >
          <ChevronRight size={15} />
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.75 }}>
        {WEEKDAYS.map((d) => (
          <Typography key={d} fontSize="11px" fontWeight={600} color="text.secondary" textAlign="center" sx={{ py: 0.5 }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.6 }}>
        {cells.map((day, idx) => {
          const isOverflow = day && typeof day === "object";
          const dayNum     = isOverflow ? day.overflow : day;

          // The record's own status is authoritative. Previously weekend
          // cells were forced blank, so a Saturday someone actually worked
          // showed as an empty grey box.
          const status = !isOverflow && day ? dayMap[day] || null : null;
          const style  = status ? STATUS_STYLES[status] : null;
          const offDay = !isOverflow && day ? !!offDayMap[day] : false;

          const bgColor   = style ? style.bg : "#F1F1F1";
          const textColor = style ? style.color : (isOverflow || !day) ? "#D0D0D0" : "#000";

          return (
            <Box
              key={idx}
              sx={{
                height: 50, borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: bgColor,
                // Non-working day that was worked gets an outline so it reads
                // as overtime rather than a normal attendance day.
                border: offDay && style ? "2px solid #F97316" : "none",
              }}
            >
              <Typography fontSize="13px" fontWeight={600} color={textColor}>
                {dayNum ?? ""}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Box display="flex" gap={2} mt={2.5} flexWrap="wrap">
        {LEGEND.map((item) => (
          <Box key={item.label} display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
            <Typography fontSize="12px" color="text.secondary">{item.label}</Typography>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap={0.75}>
          <Box sx={{ width: 10, height: 10, borderRadius: "3px", border: "2px solid #F97316" }} />
          <Typography fontSize="12px" color="text.secondary">Worked on a non-working day</Typography>
        </Box>
      </Box>

      {/* Summary counts */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5, mt: 2.5 }}>
        {[
          { label: "Present",  value: counts.Present, bg: "#F5F5F5",   color: "#000"    },
          { label: "Late",     value: counts.Late,    bg: "#1000A31A", color: "#1000A3" },
          { label: "Absent",   value: counts.Absent,  bg: "#FF00041A", color: "#FF0004" },
          { label: "Leave",    value: counts.Leave,   bg: "#48B5041A", color: "#48B504" },
          { label: "Off-Day Worked", value: offDayWorked, bg: "#F973161A", color: "#F97316" },
        ].map((item) => (
          <Box key={item.label} sx={{ backgroundColor: item.bg, borderRadius: "12px", py: 1.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
            <Typography fontSize="20px" fontWeight={700} color={item.color}>{item.value}</Typography>
            <Typography fontSize="11px" color="text.secondary" textAlign="center">{item.label}</Typography>
          </Box>
        ))}
      </Box>

    </Box>
  );
};

export default DetailCalendarTab;