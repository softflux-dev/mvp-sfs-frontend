// hrPortal/attendance/exportPdfDialog.jsx — FULL REPLACEMENT
import { useState, useEffect, useMemo } from "react";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, CircularProgress } from "@mui/material";
import { Calendar } from "lucide-react";

import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import { getImportHistoryApi, getAttendanceSummaryApi } from "../../../api/modules/attendance";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * Lets HR pick exactly which imported month to export, or "All" for every
 * month that has EVER been imported — determined from real import history,
 * not a guessed/fixed lookback window.
 */
const ExportPdfDialog = ({ open, onClose, onExport }) => {
  const [loading,  setLoading]  = useState(false);
  const [allData,  setAllData]  = useState([]);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      setSelected("all");
      try {
        // ── Step 1: pull the FULL import history — this is the true record
        // of every month/year that has ever actually been imported. ────────
        const historyRes = await getImportHistoryApi({ limit: 1000 });
        const logs = (historyRes?.data?.data?.logs) || [];

        // ── Step 2: figure out how many months back we need to fetch to
        // cover the OLDEST import on record — no guessing. ─────────────────
        const now = new Date();
        let monthsNeeded = 3; // sane floor even if history is empty
        logs.forEach((l) => {
          if (l.year == null || l.month == null) return;
          const monthsAgo = (now.getFullYear() - l.year) * 12 + (now.getMonth() - l.month) + 1;
          if (monthsAgo > monthsNeeded) monthsNeeded = monthsAgo;
        });

        // ── Step 3: fetch attendance summary for exactly that window ───────
        const summaryRes = await getAttendanceSummaryApi({ months: monthsNeeded });
        if (summaryRes?.status === 200 || summaryRes?.status === 201) {
          setAllData(summaryRes.data.data.summary || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // ── Unique month/year periods present in the data, most recent first ────
  const periods = useMemo(() => {
    const seen = new Map();
    allData.forEach((r) => {
      const key = `${r.yearNum}-${r.monthIndex}`;
      if (!seen.has(key)) {
        seen.set(key, { key, month: r.monthIndex, year: r.yearNum, label: `${MONTH_NAMES[r.monthIndex]} ${r.yearNum}` });
      }
    });
    return Array.from(seen.values()).sort((a, b) => b.year - a.year || b.month - a.month);
  }, [allData]);

  const handleConfirm = () => {
    if (selected === "all") {
      onExport?.({ records: allData, title: "Attendance Records Report — All Periods" });
    } else {
      const period = periods.find((p) => p.key === selected);
      const filtered = allData.filter((r) => r.monthIndex === period.month && r.yearNum === period.year);
      onExport?.({ records: filtered, title: `Attendance Records Report — ${period.label}` });
    }
    onClose?.();
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="440px" fullWidth>
      <DialogHeader title="Export Attendance PDF" onClose={onClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={1.5}>
            Select which period to export
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={26} sx={{ color: "#AA2493" }} />
            </Box>
          ) : periods.length === 0 ? (
            <Typography fontSize="13px" color="text.secondary">
              No attendance data has been imported yet.
            </Typography>
          ) : (
            <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value)}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1, mb: 0.5, p: 1.25,
                borderRadius: "10px", backgroundColor: "#fff",
                border: selected === "all" ? "1.5px solid #AA2493" : "1px solid transparent",
              }}>
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" sx={{ color: "#AA2493", "&.Mui-checked": { color: "#AA2493" } }} />}
                  label={<Typography fontSize="13px" fontWeight={600}>All Imported Months ({periods.length})</Typography>}
                  sx={{ flex: 1, m: 0 }}
                />
              </Box>

              <Box sx={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.5 }}>
                {periods.map((p) => (
                  <Box key={p.key} sx={{
                    display: "flex", alignItems: "center", gap: 1, p: 1.25,
                    borderRadius: "10px", backgroundColor: "#fff",
                    border: selected === p.key ? "1.5px solid #AA2493" : "1px solid transparent",
                  }}>
                    <FormControlLabel
                      value={p.key}
                      control={<Radio size="small" sx={{ color: "#AA2493", "&.Mui-checked": { color: "#AA2493" } }} />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Calendar size={14} color="#67768B" />
                          <Typography fontSize="13px">{p.label}</Typography>
                        </Box>
                      }
                      sx={{ flex: 1, m: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            </RadioGroup>
          )}
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={onClose}
        onConfirm={handleConfirm}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Export"
        variant="gradient"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default ExportPdfDialog;