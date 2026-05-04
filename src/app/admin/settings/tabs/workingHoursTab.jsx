// tabs/workingHoursTab.jsx
import { useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";
import GlobalStyle      from "../../../../style/style";

const DAYS = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
  { key: "SUN", label: "Sun" },
];

const WorkingHoursTab = () => {
  const [formData, setFormData] = useState({
    startTime:   dayjs().hour(8).minute(0),
    endTime:     dayjs().hour(9).minute(0),
    workingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    dailyHours:  "",
  });

  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDayToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(key)
        ? prev.workingDays.filter((d) => d !== key)
        : [...prev.workingDays, key],
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.startTime)       e.startTime   = "Start time is required";
    if (!formData.endTime)         e.endTime     = "End time is required";
    if (!formData.workingDays.length) e.workingDays = "Select at least one working day";
    if (!formData.dailyHours.trim())  e.dailyHours  = "Daily work hours is required";
    return e;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Save working hours:", formData);
    setSaveSuccess(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

        <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={3}>
          Working Hours
        </Typography>

        {/* ── Start Time + End Time ────────────────────────────────────── */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Start Time" />
            <TimePicker
              value={formData.startTime}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, startTime: v }));
                setErrors((prev) => ({ ...prev, startTime: "" }));
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
            <CustomInputLabel label="End Time" />
            <TimePicker
              value={formData.endTime}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, endTime: v }));
                setErrors((prev) => ({ ...prev, endTime: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  placeholder: "09:00 am",
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
          <CustomInputLabel label="Working Days" />
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

        {/* ── Daily Work Hours ─────────────────────────────────────────── */}
        <Box mb={3}>
          <CustomInputLabel label="Daily Work Hours" />
          <TextInput
            placeholder="Enter Hours"
            value={formData.dailyHours}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, dailyHours: e.target.value }));
              setErrors((prev) => ({ ...prev, dailyHours: "" }));
            }}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            error={!!errors.dailyHours}
            helperText={errors.dailyHours}
          />
        </Box>

        {/* ── Save ─────────────────────────────────────────────────────── */}
        <Box display="flex" justifyContent="flex-end">
          <CustomButton
            btnLabel="Save Changes"
            variant="gradient"
            handlePressBtn={handleSave}
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