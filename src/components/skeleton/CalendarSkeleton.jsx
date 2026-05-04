// components/skeleton/CalendarSkeleton.jsx
import { Box, Skeleton } from "@mui/material";

const CalendarSkeleton = () => {
  return (
    <Box
      sx={{
        my: 2,
        backgroundColor: "#fff",
        borderRadius: "20px",
        border: "1px solid #F0F0F0",
        p: 2.5,
      }}
    >
      {/* ── Month navigation skeleton ──────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: "8px" }} />
        <Skeleton
          variant="rounded"
          width={32}
          height={32}
          sx={{
            borderRadius: "8px",
            background: "linear-gradient(90deg, #AA249340 0%, #02217940 100%)",
          }}
        />
      </Box>

      {/* ── Weekday headers skeleton ───────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          mb: 1,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width="60%"
            height={20}
            sx={{ mx: "auto" }}
          />
        ))}
      </Box>

      {/* ── Calendar grid skeleton ─────────────────────────────────────────── */}
      <Box
        sx={{
          border: "1px solid #F0F0F0",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: weekIndex < 4 ? "1px solid #F0F0F0" : "none",
            }}
          >
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const showChip = (weekIndex * 7 + dayIndex) % 3 !== 0;
              const isWeekend = dayIndex === 5 || dayIndex === 6;
              const hasBorderR = dayIndex !== 6;

              return (
                <Box
                  key={dayIndex}
                  sx={{
                    minHeight: { xs: "70px", md: "90px" },
                    p: 1,
                    borderRight: hasBorderR ? "1px solid #F0F0F0" : "none",
                    bgcolor: isWeekend ? "#FAFAFA" : "#fff",
                    position: "relative",
                  }}
                >
                  {/* Day number top-right */}
                  <Skeleton
                    variant="text"
                    width={18}
                    height={16}
                    sx={{ position: "absolute", top: 8, right: 10 }}
                  />
                  {/* Status chip */}
                  {showChip && !isWeekend && (
                    <Box sx={{ mt: "28px" }}>
                      <Skeleton
                        variant="rounded"
                        width="80%"
                        height={20}
                        sx={{ borderRadius: "8px" }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* ── Legend skeleton ────────────────────────────────────────────────── */}
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} display="flex" alignItems="center" gap={0.75}>
            <Skeleton variant="circular" width={10} height={10} />
            <Skeleton variant="text" width={50} height={16} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CalendarSkeleton;