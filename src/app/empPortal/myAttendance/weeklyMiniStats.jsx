import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { format } from "date-fns";

const MiniStatTile = ({ value, label, highlight }) => (
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
        "& .mini-val":   { color: "#fff" },
        "& .mini-label": { color: "rgba(255,255,255,0.8)" },
      },
    }}
  >
    <Typography
      className="mini-val"
      fontSize="20px"
      fontWeight={700}
      color={highlight ? "#fff" : "text.primary"}
      lineHeight={1}
      sx={{ transition: "color 0.2s ease" }}
    >
      {value}
    </Typography>
    <Typography
      className="mini-label"
      fontSize="11px"
      color={highlight ? "rgba(255,255,255,0.8)" : "text.secondary"}
      mt="4px"
      sx={{ transition: "color 0.2s ease" }}
    >
      {label}
    </Typography>
  </Box>
);

const WeeklyMiniStats = ({ week, weekIdx, totalWeeks, onPrev, onNext }) => {

  // ── Derive date range label from week data ──────────────────────────
  const dateRangeLabel = week?.startDate && week?.endDate
    ? `${format(new Date(week.startDate), "MMM d")} – ${format(new Date(week.endDate), "MMM d, yyyy")}`
    : "This Week";

  return (
    <Box>
      {/* ── Header row ───────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">
          Weekly summary stats
        </Typography>

        {/* ── Navigator ──────────────────────────────────────────────── */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Prev button */}
          <IconButton
            onClick={onPrev}                          // ← use prop
            disabled={weekIdx === 0}
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
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Date range pill */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              bgcolor: "#F5F5F5",
              borderRadius: "8px",
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography fontSize="13px" fontWeight={500} color="text.primary" noWrap>
              {dateRangeLabel}
            </Typography>
          </Box>

          {/* Next button */}
          <IconButton
            onClick={onNext}                          // ← use prop
            disabled={weekIdx === totalWeeks - 1}
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
            <ChevronRightIcon sx={{ fontSize: 18, color: "#fff" }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Tiles ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          padding: "12px",
        }}
      >
        <MiniStatTile value={week.stats.present} label="Present" />
        <MiniStatTile value={week.stats.absent}  label="Absent"   />
        <MiniStatTile value={week.stats.late}    label="Late"    />
        <MiniStatTile value={week.stats.leave}   label="Leave"   />
        <MiniStatTile value={week.stats.worked}  label="Worked"  />
      </Box>
    </Box>
  );
};

export default WeeklyMiniStats;