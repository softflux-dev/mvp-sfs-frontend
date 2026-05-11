import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@mui/material";

import AnnualSummaryCard from "./annualSummaryCard";
import MyLeaveRequests   from "./myLeaveRequests";

// ── Mock annual data ──────────────────────────────────────────────────────
const ANNUAL_DATA = {
  2025: [
    { month: "January",   present: 20, absent: 0, late: 0, leave: 0 },
    { month: "February",  present: 20, absent: 5, late: 2, leave: 0 },
    { month: "March",     present: 20, absent: 5, late: 3, leave: 1 },
    { month: "April",     present: 20, absent: 5, late: 3, leave: 1 },
    { month: "May",       present: 20, absent: 5, late: 2, leave: 0 },
    { month: "June",      present: 20, absent: 0, late: 0, leave: 0 },
    { month: "July",      present: 20, absent: 5, late: 0, leave: 1 },
    { month: "August",    present: 20, absent: 0, late: 0, leave: 0 },
    { month: "September", present: 20, absent: 5, late: 0, leave: 0 },
    { month: "October",   present: 20, absent: 5, late: 3, leave: 1 },
    { month: "November",  present: 20, absent: 5, late: 2, leave: 0 },
    { month: "December",  present: 20, absent: 0, late: 0, leave: 0 },
  ],
  2026: [
    { month: "January",   present: 20, absent: 0, late: 0, leave: 0 },
    { month: "February",  present: 18, absent: 2, late: 1, leave: 0 },
    { month: "March",     present: 17, absent: 3, late: 2, leave: 1 },
    { month: "April",     present: 19, absent: 1, late: 0, leave: 0 },
    { month: "May",       present: 16, absent: 4, late: 2, leave: 1 },
    { month: "June",      present: 20, absent: 0, late: 0, leave: 0 },
    { month: "July",      present: 18, absent: 2, late: 1, leave: 0 },
    { month: "August",    present: 20, absent: 0, late: 0, leave: 0 },
    { month: "September", present: 19, absent: 1, late: 0, leave: 0 },
    { month: "October",   present: 17, absent: 3, late: 2, leave: 1 },
    { month: "November",  present: 18, absent: 2, late: 1, leave: 0 },
    { month: "December",  present: 20, absent: 0, late: 0, leave: 0 },
  ],
};

// ── Annual mini stat tile ─────────────────────────────────────────────────
const AnnualMiniTile = ({ value, label, highlight }) => (
  <Box
    sx={{
      flex: 1,
      background: highlight
        ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
        : "#FFFFFF",
      borderRadius: "12px",
      border: highlight ? "none" : "1px solid #E0E0E0",
      p: "16px 12px",
      textAlign: "center",
      cursor: "pointer",
      transition: "background 0.2s ease",
      "&:hover": {
        background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
        border: "1px solid transparent",
        "& .tile-val":   { color: "#fff" },
        "& .tile-label": { color: "rgba(255,255,255,0.8)" },
      },
    }}
  >
    <Typography
      className="tile-val"
      fontSize="20px"
      fontWeight={700}
      color={highlight ? "#fff" : "text.primary"}
      lineHeight={1}
      sx={{ transition: "color 0.2s ease" }}
    >
      {value}
    </Typography>
    <Typography
      className="tile-label"
      fontSize="11px"
      color={highlight ? "rgba(255,255,255,0.8)" : "text.secondary"}
      mt="4px"
      sx={{ transition: "color 0.2s ease" }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────
const AnnualAttendanceView = () => {
  const [year, setYear] = useState(2026);
  const months = ANNUAL_DATA[year] || [];

  const handlePrev = () => setYear((y) => y - 1);
  const handleNext = () => setYear((y) => y + 1);

  // compute annual totals
  const totals = months.reduce(
    (acc, m) => ({
      present: acc.present + m.present,
      absent:  acc.absent  + m.absent,
      late:    acc.late    + m.late,
      leave:   acc.leave   + m.leave,
    }),
    { present: 0, absent: 0, late: 0, leave: 0 }
  );

  return (
    <Box>
      {/* ── Annual summary stats header ──────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Annual summary stats
        </Typography>
      </Box>

      {/* ── Mini stat tiles ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display:         "flex",
          gap:             1.5,
          mb:              3,
          backgroundColor: "#F5F5F5",
          borderRadius:    "16px",
          padding:         "12px",
        }}
      >
        <AnnualMiniTile value={totals.present} label="Total Present" />
        <AnnualMiniTile value={totals.absent}  label="Total Absent"  highlight />
        <AnnualMiniTile value={totals.late}    label="Total Late"    />
        <AnnualMiniTile value={totals.leave}   label="Total Leave"   />
      </Box>

      {/* ── Annual Attendance Summary header ─────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Annual Attendance Summary
        </Typography>

        {/* ── Year navigation — matches AttendanceCalendar style ─────────── */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            onClick={handlePrev}
            disabled={year <= 2025}
            size="small"
            sx={{
              bgcolor: "#F5F5F5",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "#E0E0E0" },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>

          <Box sx={{ px: 2, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px" }}>
            <Typography fontSize="13px" fontWeight={600} color="text.primary">
              {year}
            </Typography>
          </Box>

          <IconButton
            onClick={handleNext}
            disabled={year >= 2026}
            size="small"
            sx={{
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { opacity: 0.9 },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            <ChevronRight size={16} color="#fff" />
          </IconButton>
        </Box>
      </Box>

      {/* ── Month cards grid ─────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {months.map((m) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.month}>
            <AnnualSummaryCard
              month={m.month}
              present={m.present}
              absent={m.absent}
              late={m.late}
              leave={m.leave}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Leave requests ───────────────────────────────────────────────── */}
      <MyLeaveRequests />
    </Box>
  );
};

export default AnnualAttendanceView;