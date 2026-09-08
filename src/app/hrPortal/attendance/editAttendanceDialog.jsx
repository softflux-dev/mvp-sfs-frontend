// hrPortal/attendance/editAttendanceDialog.jsx —
import { useState, useEffect, useMemo } from "react";
import { Box, MenuItem, Typography, Button } from "@mui/material";
import { TimePicker }          from "@mui/x-date-pickers/TimePicker";
import { DatePicker }          from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs }        from "@mui/x-date-pickers/AdapterDayjs";
import dayjs                   from "dayjs";
import customParseFormat        from "dayjs/plugin/customParseFormat";
import { AlertCircle } from "lucide-react";

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
  { value: "Leave",   label: "Leave"   },
  { value: "Holiday", label: "Holiday" },
];

const MAX_HOURS_PER_DAY = 24;

// ── Status-first flow: these statuses can't carry On-Site/Off-Site
// Check-In/Check-Out times — Absent must have none, Leave/Holiday don't
// need them either since no attendance was expected that day. Present/Late/
// Auto-detect keep Check-In/Check-Out available as before. ──────────────────
const NO_TIME_STATUSES = ["Absent", "Leave", "Holiday"];

const INITIAL = {
  date: null, attendanceStatus: "", notes: "",
  useOnsite: false, onsiteCheckIn: null, onsiteCheckOut: null,
  useOffsite: false, offsiteCheckIn: null, offsiteCheckOut: null,
  useExtra: false, extraHoursValue: "", extraCheckIn: null, extraCheckOut: null,
};

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

// ── Span between two dayjs time values, in decimal hours. Returns null when
// either value is missing/invalid or check-out isn't after check-in, so the
// caller can tell "no valid duration yet" apart from "0 hours". ─────────────
const computeSpanHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut || !checkIn.isValid?.() || !checkOut.isValid?.()) return null;
  const diffMin = checkOut.diff(checkIn, "minute");
  if (diffMin <= 0) return null;
  return diffMin / 60;
};

// Returns true when two same-day time ranges genuinely overlap (touching
// endpoints, e.g. one ending exactly when the other starts, is NOT an overlap).
const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  if (!aStart?.isValid?.() || !aEnd?.isValid?.() || !bStart?.isValid?.() || !bEnd?.isValid?.()) return false;
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
};

// ── Same "Xh Ym" formatting used everywhere else in the app, kept local so
// this dialog doesn't need to import the hooks-file helper. ─────────────────
const formatHoursLabel = (decimal) => {
  if (!decimal || decimal <= 0) return "0h 0m";
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h}h ${m}m`;
};

const validateHoursField = (raw) => {
  if (raw === "" || raw == null) return { valid: true, error: "" };
  const trimmed = String(raw).trim();
  if (!/^\d*\.?\d*$/.test(trimmed)) return { valid: false, error: "Numbers only" };
  const num = parseFloat(trimmed);
  if (isNaN(num)) return { valid: true, error: "" };
  if (num < 0) return { valid: false, error: "Cannot be negative" };
  if (num > MAX_HOURS_PER_DAY) return { valid: false, error: `Cannot exceed ${MAX_HOURS_PER_DAY}h` };
  return { valid: true, error: "" };
};

/**
 * EditAttendanceDialog — dual mode, same On-Site/Off-Site/Extra Hours UI
 * in both:
 *
 * EDIT mode   — pass `record`. Date shown read-only. Checkboxes prefilled
 *               from the record's existing values.
 *
 * CREATE mode — pass `record={null}` AND `manualEntry={{ employeeId, date }}`.
 *               Date is editable, On-Site defaults checked.
 *
 * Both save through the same backend logic (upsert-merge, capped against
 * required daily hours, overflow spills into Extra Hours).
 *
 * Status/time rules (status-first flow):
 * - Absent, Leave, and Holiday cannot carry On-Site/Off-Site Check-In/
 *   Check-Out times — selecting one of these turns those entry types off and
 *   clears their times, and the toggle buttons are disabled while any of
 *   them is selected.
 * - Present, Late, and Auto-detect keep On-Site/Off-Site Check-In/Check-Out
 *   available as before.
 * - Extra Hours is entered as a Check-In/Check-Out pair (never break-adjusted);
 *   the resulting duration is shown in a read-only "Xh Ym" field.
 */
const EditAttendanceDialog = ({
  open, onClose, record = null, manualEntry = null, onSave, loading = false, errorMessage = "",
}) => {
  const isCreateMode = !record && !!manualEntry;
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({ extraHoursValue: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFieldErrors({ extraHoursValue: "" });
    setFormError("");
    if (record) {
      const status = record.attendanceStatus === "Partial" ? "Present" : (record.attendanceStatus || "");
      const noTimeStatus = NO_TIME_STATUSES.includes(status);
      const hasOnsite  = !noTimeStatus && !!(record.checkIn || record.checkOut);
      const hasOffsite = !noTimeStatus && !!(record.offSiteCheckIn && record.offSiteCheckOut);
      const hasExtra   = (record.extraHoursRaw || 0) > 0;
      setForm({
        ...INITIAL,
        date: record.rawDate ? dayjs(record.rawDate) : null,
        attendanceStatus: status,
        notes: record.notes || "",
        // Absent/Leave/Holiday can never carry On-Site/Off-Site times — clear
        // them even if stale/inconsistent data exists on the record.
        useOnsite: hasOnsite,
        onsiteCheckIn: hasOnsite ? parseTime(record.checkIn) : null,
        onsiteCheckOut: hasOnsite ? parseTime(record.checkOut) : null,
        useOffsite: hasOffsite,
        offsiteCheckIn: hasOffsite ? parseTime(record.offSiteCheckIn) : null,
        offsiteCheckOut: hasOffsite ? parseTime(record.offSiteCheckOut) : null,
        useExtra: hasExtra, extraHoursValue: hasExtra ? String(record.extraHoursRaw) : "",
        // Extra Hours Check-In/Check-Out are now persisted server-side, so
        // prefill them the same way On-Site/Off-Site are.
        extraCheckIn: hasExtra ? parseTime(record.extraCheckIn) : null,
        extraCheckOut: hasExtra ? parseTime(record.extraCheckOut) : null,
      });
    } else if (manualEntry) {
      setForm({ ...INITIAL, date: manualEntry.date ? dayjs(manualEntry.date) : dayjs(), useOnsite: true });
    } else {
      setForm(INITIAL);
    }
  }, [record, manualEntry, open]);

  // ── Live Extra Hours duration — computed from the Check-In/Check-Out pair
  // when both are set; otherwise falls back to the previously saved value
  // (e.g. when re-opening an edit and not touching Extra Hours). ─────────────
  const computedExtraHours = useMemo(() => {
    const spanned = computeSpanHours(form.extraCheckIn, form.extraCheckOut);
    if (spanned !== null) return spanned;
    const fallback = parseFloat(form.extraHoursValue);
    return isNaN(fallback) ? 0 : fallback;
  }, [form.extraCheckIn, form.extraCheckOut, form.extraHoursValue]);

  const timesDisabled = NO_TIME_STATUSES.includes(form.attendanceStatus);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormError("");
    setForm((prev) => ({
      ...prev,
      attendanceStatus: newStatus,
      // Absent/Leave/Holiday can't carry Check-In/Check-Out times — turn
      // those entry types off and clear their values the moment one of
      // these statuses is selected.
      ...(NO_TIME_STATUSES.includes(newStatus)
        ? {
            useOnsite: false, onsiteCheckIn: null, onsiteCheckOut: null,
            useOffsite: false, offsiteCheckIn: null, offsiteCheckOut: null,
          }
        : {}),
    }));
  };

  const handleEntryTypeToggle = (key) => {
    // Guard against enabling On-Site/Off-Site while a no-time status is
    // selected (buttons are disabled visually too, but this keeps state
    // consistent if disabled styling is ever bypassed).
    if (timesDisabled && key !== "useExtra") return;
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleHoursChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
    const { error } = validateHoursField(raw);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setForm((prev) => ({ ...prev, [field]: raw }));
  };

  const handleSave = () => {
    const { useOnsite, useOffsite, useExtra } = form;
    const hasAnyEntry = useOnsite || useOffsite || useExtra;

    setFormError("");

    // Absent/Leave/Holiday can never be saved together with On-Site/Off-Site times.
    if (timesDisabled && (useOnsite || useOffsite)) {
      setFormError(`${form.attendanceStatus} status can't include Check-In/Check-Out times. Turn off On-Site/Off-Site, or change the status.`);
      return;
    }

    // Creating a brand-new record needs at least one entry type. Editing an
    // EXISTING record can still save a status/notes-only change with no
    // entry type toggled.
    if (isCreateMode && !hasAnyEntry) {
      setFormError("Select at least one entry type (On-Site, Off-Site, or Extra Hours) and fill it in.");
      return;
    }

    let extraHoursFinal = 0;
    if (useExtra) {
      const spanned = computeSpanHours(form.extraCheckIn, form.extraCheckOut);
      extraHoursFinal = spanned !== null ? spanned : (parseFloat(form.extraHoursValue) || 0);
      if (!extraHoursFinal || extraHoursFinal <= 0) {
        setFieldErrors((prev) => ({ ...prev, extraHoursValue: "Enter Check-In and Check-Out for Extra Hours" }));
        setFormError("Please fix the errors below before saving.");
        return;
      }
    }
    if (useOnsite && (!form.onsiteCheckIn || !form.onsiteCheckOut)) {
      setFormError("On-Site is selected — enter both Check-In and Check-Out, or turn it off.");
      return;
    }
    if (useOffsite && (!form.offsiteCheckIn || !form.offsiteCheckOut)) {
      setFormError("Off-Site is selected — enter both Check-In and Check-Out, or turn it off.");
      return;
    }
    
    const overlapMsg = "The selected time overlaps with an existing attendance period. Please select a different time.";
    if (useOnsite && useOffsite && rangesOverlap(form.onsiteCheckIn, form.onsiteCheckOut, form.offsiteCheckIn, form.offsiteCheckOut)) {
      setFormError(overlapMsg);
      return;
    }
    if (useOnsite && useExtra && rangesOverlap(form.onsiteCheckIn, form.onsiteCheckOut, form.extraCheckIn, form.extraCheckOut)) {
      setFormError(overlapMsg);
      return;
    }
    if (useOffsite && useExtra && rangesOverlap(form.offsiteCheckIn, form.offsiteCheckOut, form.extraCheckIn, form.extraCheckOut)) {
      setFormError(overlapMsg);
      return;
    }

    const payload = {
      attendanceStatus: form.attendanceStatus || undefined,
      notes: form.notes,
    };
    if (useOnsite)  payload.onsite  = { checkIn: formatTime(form.onsiteCheckIn),  checkOut: formatTime(form.onsiteCheckOut) };
    if (useOffsite) payload.offsite = { checkIn: formatTime(form.offsiteCheckIn), checkOut: formatTime(form.offsiteCheckOut) };
        if (useExtra) {
      payload.extraHours = Math.max(0, extraHoursFinal);
      payload.extra = { checkIn: formatTime(form.extraCheckIn), checkOut: formatTime(form.extraCheckOut) };
    } else if (!isCreateMode) {
      // Extra Hours was unchecked during an edit — explicitly clear it AND
      // tell the backend to skip re-adding any on-site/off-site overflow,
      // otherwise a day whose on-site hours exceed the daily budget will
      // silently regenerate the same Extra Hours we just tried to remove.
      payload.extraHours = 0;
      payload.extra = { checkIn: "", checkOut: "" };
      payload.clearExtra = true;   
    }

    if (isCreateMode) {
      payload.employeeId = manualEntry.employeeId;
      payload.date = form.date ? form.date.format("YYYY-MM-DD") : null;
    } else {
      payload.id = record.id;
    }

    onSave?.(payload);
  };

  const saveDisabled = form.useExtra && !!fieldErrors.extraHoursValue;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
        <DialogHeader title={isCreateMode ? "Manual Attendance Entry" : "Edit Attendance"} onClose={onClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Date — editable in create mode, read-only in edit mode */}
            {isCreateMode ? (
              <Box>
                <CustomInputLabel label="Date" />
                <DatePicker
                value={form.date}
                onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
                minDate={dayjs("2000-01-01")}
                maxDate={dayjs().endOf("year")}
                slotProps={{ textField: { size: "small", fullWidth: true }, popper: { sx: GlobalStyle.datePickerPopperSx } }}
                sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
              />
              </Box>
            ) : (
              <Box>
                <CustomInputLabel label="Date" />
                <Box sx={{ height: "45px", display: "flex", alignItems: "center", px: 2, backgroundColor: "#fff", borderRadius: "14px" }}>
                  <Typography fontSize="14px" color="text.primary">{record?.date || "—"}</Typography>
                </Box>
              </Box>
            )}

            {/* Status — moved above Entry Type so Absent can gate the toggles below */}
            <Box>
              <CustomInputLabel label="Status" />
              <CustomSelect
                value={form.attendanceStatus}
                onChange={handleStatusChange}
                fullWidth height="45px" inputBgColor="#fff"
              >
                <MenuItem value="">Auto-detect (based on hours entered)</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Entry Type — checkboxes, any combination (On-Site/Off-Site disabled for Absent/Leave/Holiday) */}
            <Box>
              <CustomInputLabel label="Entry Type — select any combination" />
              <Box display="flex" gap={1}>
                {[
                  { key: "useOnsite",  label: "On-Site"     },
                  { key: "useOffsite", label: "Off-Site"    },
                  { key: "useExtra",   label: "Extra Hours" },
                ].map((t) => {
                  const disabledByStatus = timesDisabled && t.key !== "useExtra";
                  return (
                    <Button
                      key={t.key}
                      variant={form[t.key] ? "gradient" : "button"}
                      disabled={disabledByStatus}
                      onClick={() => handleEntryTypeToggle(t.key)}
                      sx={{ flex: 1, height: "40px", fontSize: "13px", fontWeight: 500, opacity: disabledByStatus ? 0.5 : 1 }}
                    >
                      {t.label}
                    </Button>
                  );
                })}
              </Box>
              <Typography fontSize="11px" color="text.secondary" mt={0.75}>
                {timesDisabled
                  ? `${form.attendanceStatus || "This status"} is selected — On-Site and Off-Site Check-In/Check-Out are disabled.`
                  : "Combine On-Site and Off-Site for a split day. A break is deducted from each. Extra Hours is never break-adjusted."}
              </Typography>
            </Box>

            {form.useOnsite && !timesDisabled && (
              <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                <Box>
                  <CustomInputLabel label="Check-In (On-Site)" />
                  <TimePicker
                    value={form.onsiteCheckIn}
                    onChange={(val) => setForm((prev) => ({ ...prev, onsiteCheckIn: val }))}
                    slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "09:00 AM" } }}
                    sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                  />
                </Box>
                <Box>
                  <CustomInputLabel label="Check-Out (On-Site)" />
                  <TimePicker
                    value={form.onsiteCheckOut}
                    onChange={(val) => setForm((prev) => ({ ...prev, onsiteCheckOut: val }))}
                    slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "01:00 PM" } }}
                    sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                  />
                </Box>
              </Box>
            )}

            {form.useOffsite && !timesDisabled && (
              <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                <Box>
                  <CustomInputLabel label="Check-In (Off-Site)" />
                  <TimePicker
                    value={form.offsiteCheckIn}
                    onChange={(val) => setForm((prev) => ({ ...prev, offsiteCheckIn: val }))}
                    slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "02:00 PM" } }}
                    sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                  />
                </Box>
                <Box>
                  <CustomInputLabel label="Check-Out (Off-Site)" />
                  <TimePicker
                    value={form.offsiteCheckOut}
                    onChange={(val) => setForm((prev) => ({ ...prev, offsiteCheckOut: val }))}
                    slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "06:00 PM" } }}
                    sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                  />
                </Box>
              </Box>
            )}

            {/* Extra Hours — entered as Check-In/Check-Out; duration is derived
                and shown in a read-only field, never typed directly. */}
            {form.useExtra && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                  <Box>
                    <CustomInputLabel label="Check-In (Extra Hours)" />
                    <TimePicker
                      value={form.extraCheckIn}
                      onChange={(val) => {
                        setFieldErrors((prev) => ({ ...prev, extraHoursValue: "" }));
                        setForm((prev) => ({ ...prev, extraCheckIn: val }));
                      }}
                      slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "06:00 PM" } }}
                      sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                    />
                  </Box>
                  <Box>
                    <CustomInputLabel label="Check-Out (Extra Hours)" />
                    <TimePicker
                      value={form.extraCheckOut}
                      onChange={(val) => {
                        setFieldErrors((prev) => ({ ...prev, extraHoursValue: "" }));
                        setForm((prev) => ({ ...prev, extraCheckOut: val }));
                      }}
                      slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "08:00 PM" } }}
                      sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                    />
                  </Box>
                </Box>

                <Box>
                  <CustomInputLabel label="Extra Hours Worked" />
                  <TextInput
                    value={formatHoursLabel(computedExtraHours)}
                    inputBgColor="#EFEFEF"
                    fullWidth
                    disabled
                    inputProps={{ readOnly: true }}
                    error={!!fieldErrors.extraHoursValue}
                  />
                  {fieldErrors.extraHoursValue && (
                    <Typography fontSize="11px" color="error" mt={0.5}>{fieldErrors.extraHoursValue}</Typography>
                  )}
                </Box>
              </Box>
            )}

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
            {formError && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", backgroundColor: "#FFF0F0", border: "1px solid #FFCCCC", borderRadius: "10px", px: 2, py: 1.5 }}>
                <AlertCircle size={16} color="#FF3B30" style={{ flexShrink: 0, marginTop: 1 }} />
                <Typography fontSize="12px" color="error">{formError}</Typography>
              </Box>
            )}

            {errorMessage && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", backgroundColor: "#FFF0F0", border: "1px solid #FFCCCC", borderRadius: "10px", px: 2, py: 1.5 }}>
                <AlertCircle size={16} color="#FF3B30" style={{ flexShrink: 0, marginTop: 1 }} />
                <Typography fontSize="12px" color="error">{errorMessage}</Typography>
              </Box>
            )}

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={onClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText={isCreateMode ? "Save Entry" : "Save Changes"}
          variant="gradient"
          confirmLoading={loading}
          confirmDisabled={saveDisabled}
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default EditAttendanceDialog;