// tabs/workingHoursTab.jsx — 
// UNSAVED-CHANGES GUARD: reports dirty state up via onDirtyChange whenever
// formData drifts from the snapshot taken at load / after a successful save.
// Also registers its save handler with the shared unsaved-changes store, so
// the "Save Changes" button on the cross-tab/sidebar confirmation dialog can
// trigger THIS tab's actual save logic when it's the active dirty section.
import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";
import GlobalStyle      from "../../../../style/style";
import { useWorkingHours } from "../../../../hooks/workingHours";
import { useUnsavedChangesStore } from "../../../../zustand/useUnsavedChangesStore";

const DAYS = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
  { key: "SUN", label: "Sun" },
];

const INITIAL_FORM = {
  startTime:   dayjs().hour(8).minute(0),
  endTime:     dayjs().hour(17).minute(0),
  breakHours:  "1",
  workingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
};

// Format a decimal hours number as "Xh Ym"
const fmtHoursLabel = (decimalHrs) => {
  if (decimalHrs == null || isNaN(decimalHrs)) return "—";
  const h = Math.floor(decimalHrs);
  const m = Math.round((decimalHrs - h) * 60);
  return `${h}h ${m}m`;
};

const WorkingHoursTab = ({ onDirtyChange = () => {} }) => {
  const { settings, loading, actionLoading, error, saveSettings } = useWorkingHours();

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Unsaved-changes tracking ─────────────────────────────────────────────
  // dayjs objects serialize via toJSON() to a stable ISO string, so
  // JSON.stringify works fine for the diff here.
  const initialSnapshotRef = useRef(null);

  // Populate from backend once loaded
  useEffect(() => {
    if (settings) {
      const next = {
        startTime:   settings.startTime ? dayjs(settings.startTime, "HH:mm") : INITIAL_FORM.startTime,
        endTime:     settings.endTime   ? dayjs(settings.endTime, "HH:mm")   : INITIAL_FORM.endTime,
        breakHours:  settings.breakHours != null ? String(settings.breakHours) : "1",
        workingDays: settings.workingDays?.length ? settings.workingDays : INITIAL_FORM.workingDays,
      };
      setFormData(next);
      initialSnapshotRef.current = JSON.stringify(next);
    }
  }, [settings]);

  useEffect(() => {
    if (!initialSnapshotRef.current) return;
    onDirtyChange(JSON.stringify(formData) !== initialSnapshotRef.current);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDayToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(key)
        ? prev.workingDays.filter((d) => d !== key)
        : [...prev.workingDays, key],
    }));
    if (errors.workingDays) setErrors((prev) => ({ ...prev, workingDays: "" }));
  };

  const shiftHoursRaw = (() => {
  if (!formData.startTime?.isValid?.() || !formData.endTime?.isValid?.()) return null;
  const diffMins = formData.endTime.diff(formData.startTime, "minute");
  if (diffMins <= 0) return null;          // was: if (diffMins < 0) diffMins += 24*60
  return diffMins / 60;
})();

  const breakHoursNum = parseFloat(formData.breakHours) || 0;
  const dailyWorkHours = shiftHoursRaw != null ? Math.max(0, shiftHoursRaw - breakHoursNum) : null;

  const validate = () => {
    const e = {};

    if (!formData.startTime?.isValid?.()) {
      e.startTime = "Start time is required.";
    }
    if (!formData.endTime?.isValid?.()) {
      e.endTime = "End time is required.";
    }
   if (
  formData.startTime?.isValid?.() && formData.endTime?.isValid?.() &&
  formData.endTime.diff(formData.startTime, "minute") <= 0
) {
  e.endTime = "End time must be after start time.";  
}

    if (!formData.workingDays.length) {
      e.workingDays = "Select at least one working day.";
    }

    const breakVal = formData.breakHours.trim();
    if (!breakVal) {
      e.breakHours = "Break time is required.";
    } else {
      const num = parseFloat(breakVal);
      if (isNaN(num)) {
        e.breakHours = "Break time must be a number.";
      } else if (num < 0) {
        e.breakHours = "Break time cannot be negative.";
      } else if (num > 6) {
        e.breakHours = "Break time cannot exceed 6 hours.";
      }
    }

    // Cross-field check: break time can't exceed (or equal) the total shift span
    if (
      !e.breakHours && !e.startTime && !e.endTime &&
      shiftHoursRaw != null && breakHoursNum >= shiftHoursRaw
    ) {
      e.breakHours = "Break time cannot be greater than or equal to the total shift duration.";
    }

    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return { success: false };
    }

    const result = await saveSettings({
      startTime:    formData.startTime.format("HH:mm"),
      endTime:      formData.endTime.format("HH:mm"),
      breakHours:   breakHoursNum,
      workingDays:  formData.workingDays,
      dailyWorkHours, // sent for reference/payroll calculations server-side
    });

    if (result.success) {
      setSaveSuccess(true);
      setErrors({});
      initialSnapshotRef.current = JSON.stringify(formData);
      onDirtyChange(false);
    }
    return result;
  };

  // ── Register this tab's save logic with the shared unsaved-changes store
  // so the cross-tab/sidebar "Save Changes" dialog button can trigger it
  // without needing to know this component or its internals exist. ───────
  const handleSaveRef = useRef();
  const setSaveHandler = useUnsavedChangesStore((s) => s.setSaveHandler);

  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  useEffect(() => {
    setSaveHandler(() => handleSaveRef.current());
    return () => setSaveHandler(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 6, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={28} sx={{ color: "#AA2493" }} />
    </Box>
  );
}

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

        <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={3}>
          Working Hours
        </Typography>

        {error && (
          <Box mb={2.5} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
            <Typography fontSize={13} color="error">{error}</Typography>
          </Box>
        )}

        {/* ── Start Time + End Time ────────────────────────────────────── */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Start Time *" />
            <TimePicker
              value={formData.startTime}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, startTime: v }));
                setErrors((prev) => ({ ...prev, startTime: "", breakHours: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  placeholder: "08:00 am",
                  error: !!errors.startTime,
                  helperText: errors.startTime,
                },
              }}
              sx={{ ...GlobalStyle.datePickerStyle, width: "100%" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="End Time *" />
            <TimePicker
              value={formData.endTime}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, endTime: v }));
                setErrors((prev) => ({ ...prev, endTime: "", breakHours: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  placeholder: "05:00 pm",
                  error: !!errors.endTime,
                  helperText: errors.endTime,
                },
              }}
              sx={{ ...GlobalStyle.datePickerStyle, width: "100%" }}
            />
          </Grid>
        </Grid>

        {/* ── Working Days ─────────────────────────────────────────────── */}
        <Box mb={3}>
          <CustomInputLabel label="Working Days *" />
          <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
            {DAYS.map((day) => {
              const isActive = formData.workingDays.includes(day.key);
              return (
                <Button
                  key={day.key}
                  variant={isActive ? "gradient" : "button"}
                  onClick={() => handleDayToggle(day.key)}
                  sx={{
                    minWidth: "60px",
                    height: "36px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {day.label}
                </Button>
              );
            })}
          </Box>
          {errors.workingDays && (
            <Typography fontSize="12px" color="error" mt={0.5}>
              {errors.workingDays}
            </Typography>
          )}
        </Box>

        {/* ── Break Time + Daily Work Hours (auto-calculated) ─────────────── */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Break Time (hours) *" />
            <TextInput
              placeholder="e.g. 1"
              value={formData.breakHours}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, breakHours: e.target.value }));
                setErrors((prev) => ({ ...prev, breakHours: "" }));
              }}
              inputBgColor="#F5F5F5"
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 6, step: 0.5 }}
              error={!!errors.breakHours}
              helperText={errors.breakHours}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Daily Work Hours" />
            <Box sx={{
              height: "45px", display: "flex", alignItems: "center", px: 2,
              backgroundColor: "#F5F5F5", borderRadius: "10px",
            }}>
              <Typography fontSize="14px" fontWeight={600} color="text.primary">
                {fmtHoursLabel(dailyWorkHours)}
              </Typography>
              <Typography fontSize="11px" color="text.secondary" ml={1.5}>
                (Auto-calculated: Shift time minus break)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── Save ─────────────────────────────────────────────────────── */}
        <Box display="flex" justifyContent="flex-end">
          <CustomButton
            btnLabel={actionLoading ? "Saving..." : "Save Changes"}
            variant="gradient"
            handlePressBtn={handleSave}
            isDisabled={actionLoading || loading}
          />
        </Box>

      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Working hours saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </LocalizationProvider>
  );
};

export default WorkingHoursTab;