// src/app/empPortal/myAttendance/annualAttendanceView.jsx — 
import { Box, Grid, Typography, IconButton, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnnualSummaryCard from "./annualSummaryCard";
import { useAnnualAttendance } from "../../../hooks/employeeAttendance";

const AnnualMiniTile = ({ value, label, highlight }) => (
  <Box sx={{
    flex: 1,
    background: highlight ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#FFFFFF",
    borderRadius: "12px",
    border: highlight ? "none" : "1px solid #E0E0E0",
    p: "16px 12px", textAlign: "center", cursor: "pointer",
    transition: "background 0.2s ease",
    "&:hover": {
      background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
      border: "1px solid transparent",
      "& .tile-val":   { color: "#fff" },
      "& .tile-label": { color: "rgba(255,255,255,0.8)" },
    },
  }}>
    <Typography className="tile-val" fontSize="20px" fontWeight={700}
      color={highlight ? "#fff" : "text.primary"} lineHeight={1} sx={{ transition: "color 0.2s ease" }}>
      {value}
    </Typography>
    <Typography className="tile-label" fontSize="11px" mt="4px"
      color={highlight ? "rgba(255,255,255,0.8)" : "text.secondary"} sx={{ transition: "color 0.2s ease" }}>
      {label}
    </Typography>
  </Box>
);

const AnnualAttendanceView = ({ selectedYear, onYearChange }) => {
  const { months, totals, loading } = useAnnualAttendance(selectedYear);
  const currentYear = new Date().getFullYear();

  return (
    <Box>
      {/* Annual summary stats */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">Annual summary stats</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 3, backgroundColor: "#F5F5F5", borderRadius: "16px", padding: "12px" }}>
        <AnnualMiniTile value={totals.present} label="Total Present" />
        <AnnualMiniTile value={totals.absent}  label="Total Absent"   />
        <AnnualMiniTile value={totals.late}    label="Total Late"    />
        <AnnualMiniTile value={totals.leave}   label="Total Leave"   />
      </Box>

      {/* Annual Attendance Summary + year nav */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="14px" fontWeight={600} color="text.primary">Annual Attendance Summary</Typography>
       {/*  <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => onYearChange(selectedYear - 1)} disabled={selectedYear <= 2024} size="small"
            sx={{ bgcolor: "#F5F5F5", borderRadius: "8px", width: 32, height: 32, "&:hover": { bgcolor: "#E0E0E0" }, "&.Mui-disabled": { opacity: 0.4 } }}>
            <ChevronLeft size={16} />
          </IconButton>
          <Box sx={{ px: 2, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px" }}>
            <Typography fontSize="13px" fontWeight={600} color="text.primary">{selectedYear}</Typography>
          </Box>
          <IconButton onClick={() => onYearChange(selectedYear + 1)} disabled={selectedYear >= currentYear} size="small"
            sx={{ background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)", borderRadius: "8px", width: 32, height: 32, "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { opacity: 0.4 } }}>
            <ChevronRight size={16} color="#fff" />
          </IconButton>
        </Box> */}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : months.length === 0 ? (
        <Box py={6} textAlign="center">
          <Typography fontSize="13px" color="text.secondary">No attendance records found for {selectedYear}.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2} mb={3}>
          {months.map((m) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.month}>
              <AnnualSummaryCard month={m.month} present={m.present} absent={m.absent} late={m.late} leave={m.leave} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AnnualAttendanceView;