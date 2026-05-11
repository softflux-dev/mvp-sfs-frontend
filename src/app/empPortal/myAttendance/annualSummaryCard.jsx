import { Box, Typography } from "@mui/material";

// ── Color segments in the progress bar ───────────────────────────────────
// Green = Present, Red = Absent, Orange = Late, Blue = Leave
const AnnualSummaryCard = ({ month, present, absent, late, leave }) => {
  const total = present + absent + late + leave || 1;

  const segments = [
    { value: present, color: "#04C373" },
    { value: absent,  color: "#FF0004" },
    { value: late,    color: "#F97316" },
    { value: leave,   color: "#2B6EFF" },
  ].filter((s) => s.value > 0);

  return (
    <Box
      sx={{
        bgcolor:      "#F5F5F5",
        borderRadius: "25px",
        p:            2.5,
        boxShadow:    "0 4px 4px rgba(0,0,0,0.07)",
        display:      "flex",
        flexDirection:"column",
        gap:          1.5,
      }}
    >
      {/* ── Month name ─────────────────────────────────────────────────── */}
      <Typography fontSize="16px" fontWeight={600} color="text.primary">
        {month}
      </Typography>

      {/* ── Segmented progress bar ──────────────────────────────────────── */}
      <Box
        sx={{
          height:       6,
          borderRadius: "15px",
          overflow:     "hidden",
          display:      "flex",
          bgcolor:      "#E0E0E0",
        }}
      >
        {segments.map((seg, i) => (
          <Box
            key={i}
            sx={{
              width:   `${(seg.value / total) * 100}%`,
              bgcolor: seg.color,
              borderRadius:
                i === 0
                  ? "15px 0 0 15px"
                  : i === segments.length - 1
                  ? "0 15px 15px 0"
                  : "0",
            }}
          />
        ))}
      </Box>

      {/* ── Stats grid ─────────────────────────────────────────────────── */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
        <Box>
          <Typography fontSize="11px" color="text.secondary">Present</Typography>
          <Typography fontSize="14px" fontWeight={700} color="text.primary">{present}</Typography>
        </Box>
        <Box>
          <Typography fontSize="11px" color="text.secondary">Absent</Typography>
          <Typography fontSize="14px" fontWeight={700} color="text.primary">{absent}</Typography>
        </Box>
        <Box>
          <Typography fontSize="11px" color="text.secondary">Late</Typography>
          <Typography fontSize="14px" fontWeight={700} color="text.primary">{late}</Typography>
        </Box>
        <Box>
          <Typography fontSize="11px" color="text.secondary">Leave</Typography>
          <Typography fontSize="14px" fontWeight={700} color="text.primary">{leave}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AnnualSummaryCard;