// src/app/empPortal/myAttendance/weeklyAttendanceView.jsx — FULL REPLACEMENT
import { Box, CircularProgress } from "@mui/material";
import WeeklyMiniStats from "./weeklyMiniStats";
import WeeklyBreakdown from "./weeklyBreakdown";
import DailyHoursChart from "./dailyHoursChart";

// Receives the `weekly` object returned by useWeeklyAttendance(month, year) from the parent
// (index.jsx already needs this hook for the tab-aware stats cards, so we share the same
// instance instead of calling the hook twice / duplicating fetches).
const WeeklyAttendanceView = ({ weekly }) => {
  const { weeks, weekIdx, activeWeek, breakdown, weekStats, loading, goPrev, goNext } = weekly;

  if (!activeWeek) return null;

  const weekForStats = {
    startDate: activeWeek.startDate,
    endDate:   activeWeek.endDate,
    stats:     weekStats,
  };

  return (
    <Box>
      <WeeklyMiniStats
        week={weekForStats}
        weekIdx={weekIdx}
        totalWeeks={weeks.length}
        onPrev={goPrev}
        onNext={goNext}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : (
        <>
          <WeeklyBreakdown breakdown={breakdown} />
          <DailyHoursChart breakdown={breakdown} />
        </>
      )}
    </Box>
  );
};

export default WeeklyAttendanceView;