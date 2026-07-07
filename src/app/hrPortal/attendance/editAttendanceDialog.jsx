// hrPortal/attendance/editAttendanceDialog.jsx — 
import { useState, useEffect } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import { TimePicker }          from "@mui/x-date-pickers/TimePicker";
import { DatePicker }          from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs }        from "@mui/x-date-pickers/AdapterDayjs";
import dayjs                   from "dayjs";
import customParseFormat        from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

const STATUS_OPTIONS = [
  { value: "Present", label: "Present" },
  { value: "Absent",  label: "Absent"  },
  { value: "Late",    label: "Late"    },
  { value: "Leave",   label: "Leave"   },
  { value: "Holiday", label: "Holiday" },
];

const MAX_HOURS_PER_DAY = 24;

const INITIAL = { date: null, checkIn: null, checkOut: null, attendanceStatus: "", notes: "", offSiteHours: "", extraHours: "" };

// ── Parse time string — handles both 24hr ("09:24") and 12hr ("09:24 AM") ────
const parseTime = (timeStr) => {
  if (!timeStr || timeStr === "-" || timeStr.trim() === "") return null;
  const str = timeStr.trim();
  let parsed = dayjs(str, "HH:mm", true);
  if (parsed.isValid()) return parsed;
  parsed = dayjs(str, "hh:mm A", true);
  if (parsed.isValid()) return parsed;
  parsed = dayjs(str, "h:mm A", true);
  if (parsed.isValid()) return parsed;
  return null;
};

const formatTime = (dayjsObj) => {
  if (!dayjsObj || !dayjsObj.isValid()) return "";
  return dayjsObj.format("HH:mm");
};

// ── Hours field validation — both fields are OPTIONAL, so empty is always
// valid. Only validate when the user has actually typed something. ─────────
const validateHoursField = (raw) => {
  if (raw === "" || raw == null) return { valid: true, error: "" };

  const trimmed = String(raw).trim();
  if (!/^\d*\.?\d*$/.test(trimmed)) {
    return { valid: false, error: "Numbers only" };
  }

  const num = parseFloat(trimmed);
  if (isNaN(num)) return { valid: true, error: "" }; // e.g. just "." mid-typing, don't error yet
  if (num < 0) return { valid: false, error: "Cannot be negative" };
  if (num > MAX_HOURS_PER_DAY) return { valid: false, error: `Cannot exceed ${MAX_HOURS_PER_DAY}h` };

  return { valid: true, error: "" };
};

/**
 * EditAttendanceDialog — dual mode:
 *
 * EDIT mode   — pass `record` (existing Attendance doc shape with `id`).
 *               Title: "Edit Attendance". Date is shown read-only.
 *
 * CREATE mode — pass `record={null}` AND `manualEntry={{ employeeId, date }}`.
 *               Title: "Manual Attendance Entry". Date is editable
 *               (defaults to manualEntry.date, e.g. a weekend with no record).
 *               Used by the "Manual Entry" button in Attendance Detail.
 */
const EditAttendanceDialog = ({
  open, onClose, record = null, manualEntry = null, onSave, loading = false,
}) => {
  const isCreateMode = !record && !!manualEntry;
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({ offSiteHours: "", extraHours: "" });

  useEffect(() => {
    if (!open) return;
    setFieldErrors({ offSiteHours: "", extraHours: "" });
    if (record) {
      const status = record.attendanceStatus === "Partial" ? "Present" : (record.attendanceStatus || "");
      setForm({
        date:             record.rawDate ? dayjs(record.rawDate) : null,
        checkIn:          parseTime(record.checkIn),
        checkOut:         parseTime(record.checkOut),
        attendanceStatus: status,
        notes:            record.notes || "",
        offSiteHours:     record.offSiteHoursRaw != null ? String(record.offSiteHoursRaw) : "",
        extraHours:       record.extraHoursRaw   != null ? String(record.extraHoursRaw)   : "",
      });
    } else if (manualEntry) {
      setForm({
        ...INITIAL,
        date: manualEntry.date ? dayjs(manualEntry.date) : dayjs(),
      });
    } else {
      setForm(INITIAL);
    }
  }, [record, manualEntry, open]);

  // ── Reject invalid keystrokes (negative sign, letters, etc.) at the
  // input level, and surface a validation message for edge cases like
  // "over the max" that can't be blocked by typing alone. ────────────────
  const handleHoursChange = (field) => (e) => {
    const raw = e.target.value;
    // Block a leading minus sign / any non-numeric-ish character outright
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;

    const { error } = validateHoursField(raw);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setForm((prev) => ({ ...prev, [field]: raw }));
  };

  const hasBlockingError = Object.values(fieldErrors).some((e) => e);

  const handleSave = () => {
    // Final guard — don't let a save through if either field is invalid
    const offSiteCheck = validateHoursField(form.offSiteHours);
    const extraCheck    = validateHoursField(form.extraHours);
    if (!offSiteCheck.valid || !extraCheck.valid) {
      setFieldErrors({ offSiteHours: offSiteCheck.error, extraHours: extraCheck.error });
      return;
    }

    const checkIn  = formatTime(form.checkIn);
    const checkOut = formatTime(form.checkOut);

    let hoursStr = "";
    if (form.checkIn?.isValid() && form.checkOut?.isValid()) {
      const diffMins = form.checkOut.diff(form.checkIn, "minute");
      const netMins  = Math.max(0, diffMins - 60);
      const h = Math.floor(netMins / 60);
      const m = netMins % 60;
      hoursStr = `${h}h ${m}m`;
    }

    // ── Both fields are optional — blank/whitespace safely becomes 0,
    // and validation above already guarantees no negative or >24 values. ────
    const offSiteHours = form.offSiteHours === "" ? 0 : Math.max(0, parseFloat(form.offSiteHours) || 0);
    const extraHours   = form.extraHours   === "" ? 0 : Math.max(0, parseFloat(form.extraHours)   || 0);

    if (isCreateMode) {
      onSave?.({
        employeeId:       manualEntry.employeeId,
        date:             form.date ? form.date.format("YYYY-MM-DD") : null,
        checkIn,
        checkOut,
        attendanceStatus: form.attendanceStatus || undefined,
        notes:            form.notes,
        offSiteHours,
        extraHours,
      });
    } else {
      onSave?.({
        ...record,
        checkIn,
        checkOut,
        hours:            hoursStr,
        attendanceStatus: form.attendanceStatus,
        notes:            form.notes,
        offSiteHours,
        extraHours,
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
        <DialogHeader title={isCreateMode ? "Manual Attendance Entry" : "Edit Attendance"} onClose={onClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Date — editable in create mode, read-only label in edit mode */}
            {isCreateMode && (
              <Box>
                <CustomInputLabel label="Date" />
                <DatePicker
                  value={form.date}
                  onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  sx={{
                    ...GlobalStyle.datePickerStyle,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff", borderRadius: "14px",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            )}

            {/* Check-In / Check-Out */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Check-In" />
                <TimePicker
                  value={form.checkIn}
                  onChange={(val) => setForm((prev) => ({ ...prev, checkIn: val }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "09:00 AM" } }}
                  sx={{
                    ...GlobalStyle.datePickerStyle,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff", borderRadius: "14px",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
              <Box>
                <CustomInputLabel label="Check-Out" />
                <TimePicker
                  value={form.checkOut}
                  onChange={(val) => setForm((prev) => ({ ...prev, checkOut: val }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "06:00 PM" } }}
                  sx={{
                    ...GlobalStyle.datePickerStyle,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff", borderRadius: "14px",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Off-Site / Extra Hours — both optional, validated inline */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Off-Site / Remote Hours (optional)" />
                <TextInput
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                  value={form.offSiteHours}
                  onChange={handleHoursChange("offSiteHours")}
                  inputBgColor="#fff"
                  fullWidth
                  error={!!fieldErrors.offSiteHours}
                />
                {fieldErrors.offSiteHours && (
                  <Typography fontSize="11px" color="error" mt={0.5}>
                    {fieldErrors.offSiteHours}
                  </Typography>
                )}
              </Box>
              <Box>
                <CustomInputLabel label="Extra Hours (optional)" />
                <TextInput
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                  value={form.extraHours}
                  onChange={handleHoursChange("extraHours")}
                  inputBgColor="#fff"
                  fullWidth
                  error={!!fieldErrors.extraHours}
                />
                {fieldErrors.extraHours && (
                  <Typography fontSize="11px" color="error" mt={0.5}>
                    {fieldErrors.extraHours}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Status */}
            <Box>
              <CustomInputLabel label="Status" />
              <CustomSelect
                value={form.attendanceStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, attendanceStatus: e.target.value }))}
                fullWidth height="45px" inputBgColor="#fff"
              >
                <MenuItem value="">
                  {isCreateMode ? "Auto-detect (based on check-in/out)" : "Select Status"}
                </MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Notes */}
            <Box>
              <CustomInputLabel label="Notes" />
              <TextInput
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={onClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText={isCreateMode ? "Add Entry" : "Save Changes"}
          variant="gradient"
          confirmLoading={loading}
          confirmDisabled={hasBlockingError}
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default EditAttendanceDialog;