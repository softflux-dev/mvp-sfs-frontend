// hrPortal/attendance/editAttendanceDialog.jsx —
import { useState, useEffect } from "react";
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
  { value: "Late",    label: "Late"    },
  { value: "Leave",   label: "Leave"   },
  { value: "Holiday", label: "Holiday" },
];

const MAX_HOURS_PER_DAY = 24;

const INITIAL = {
  date: null, attendanceStatus: "", notes: "",
  useOnsite: false, onsiteCheckIn: null, onsiteCheckOut: null,
  useOffsite: false, offsiteCheckIn: null, offsiteCheckOut: null,
  useExtra: false, extraHoursValue: "",
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
 */
const EditAttendanceDialog = ({
  open, onClose, record = null, manualEntry = null, onSave, loading = false, errorMessage = "",
}) => {
  const isCreateMode = !record && !!manualEntry;
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({ extraHoursValue: "" });

  useEffect(() => {
    if (!open) return;
    setFieldErrors({ extraHoursValue: "" });
    if (record) {
      const status = record.attendanceStatus === "Partial" ? "Present" : (record.attendanceStatus || "");
      const hasOnsite  = !!(record.checkIn && record.checkOut);
      const hasOffsite = !!(record.offSiteCheckIn && record.offSiteCheckOut);
      const hasExtra   = (record.extraHoursRaw || 0) > 0;
      setForm({
        ...INITIAL,
        date: record.rawDate ? dayjs(record.rawDate) : null,
        attendanceStatus: status,
        notes: record.notes || "",
        useOnsite: hasOnsite, onsiteCheckIn: parseTime(record.checkIn), onsiteCheckOut: parseTime(record.checkOut),
        useOffsite: hasOffsite, offsiteCheckIn: parseTime(record.offSiteCheckIn), offsiteCheckOut: parseTime(record.offSiteCheckOut),
        useExtra: hasExtra, extraHoursValue: hasExtra ? String(record.extraHoursRaw) : "",
      });
    } else if (manualEntry) {
      setForm({ ...INITIAL, date: manualEntry.date ? dayjs(manualEntry.date) : dayjs(), useOnsite: true });
    } else {
      setForm(INITIAL);
    }
  }, [record, manualEntry, open]);

  const handleHoursChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
    const { error } = validateHoursField(raw);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    setForm((prev) => ({ ...prev, [field]: raw }));
  };

  const handleSave = () => {
    const { useOnsite, useOffsite, useExtra } = form;
    if (!useOnsite && !useOffsite && !useExtra) return;

    if (useExtra) {
      const check = validateHoursField(form.extraHoursValue);
      if (!check.valid || !form.extraHoursValue || Number(form.extraHoursValue) <= 0) {
        setFieldErrors((prev) => ({ ...prev, extraHoursValue: check.error || "Enter hours worked" }));
        return;
      }
    }
    if (useOnsite  && (!form.onsiteCheckIn  || !form.onsiteCheckOut))  return;
    if (useOffsite && (!form.offsiteCheckIn || !form.offsiteCheckOut)) return;

    const payload = {
      attendanceStatus: form.attendanceStatus || undefined,
      notes: form.notes,
    };
    if (useOnsite)  payload.onsite  = { checkIn: formatTime(form.onsiteCheckIn),  checkOut: formatTime(form.onsiteCheckOut) };
    if (useOffsite) payload.offsite = { checkIn: formatTime(form.offsiteCheckIn), checkOut: formatTime(form.offsiteCheckOut) };
    if (useExtra)   payload.extraHours = Math.max(0, parseFloat(form.extraHoursValue) || 0);

    if (isCreateMode) {
      payload.employeeId = manualEntry.employeeId;
      payload.date = form.date ? form.date.format("YYYY-MM-DD") : null;
    } else {
      payload.id = record.id;
    }

    onSave?.(payload);
  };

  const saveDisabled =
    (!form.useOnsite && !form.useOffsite && !form.useExtra) ||
    (form.useOnsite  && (!form.onsiteCheckIn  || !form.onsiteCheckOut))  ||
    (form.useOffsite && (!form.offsiteCheckIn || !form.offsiteCheckOut)) ||
    (form.useExtra   && (!form.extraHoursValue || Number(form.extraHoursValue) <= 0 || !!fieldErrors.extraHoursValue));

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

            {/* Entry Type — checkboxes, any combination */}
            <Box>
              <CustomInputLabel label="Entry Type — select any combination" />
              <Box display="flex" gap={1}>
                {[
                  { key: "useOnsite",  label: "On-Site"     },
                  { key: "useOffsite", label: "Off-Site"    },
                  { key: "useExtra",   label: "Extra Hours" },
                ].map((t) => (
                  <Button
                    key={t.key}
                    variant={form[t.key] ? "gradient" : "button"}
                    onClick={() => setForm((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                    sx={{ flex: 1, height: "40px", fontSize: "13px", fontWeight: 500 }}
                  >
                    {t.label}
                  </Button>
                ))}
              </Box>
              <Typography fontSize="11px" color="text.secondary" mt={0.75}>
                Combine On-Site and Off-Site for a split day. A break is deducted
                from each. Extra Hours is never break-adjusted.
              </Typography>
            </Box>

            {form.useOnsite && (
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

            {form.useOffsite && (
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

            {form.useExtra && (
              <Box>
                <CustomInputLabel label="Extra Hours Worked" />
                <TextInput
                  placeholder="0" type="text" inputMode="decimal"
                  value={form.extraHoursValue}
                  onChange={handleHoursChange("extraHoursValue")}
                  inputBgColor="#fff" fullWidth
                  error={!!fieldErrors.extraHoursValue}
                />
                {fieldErrors.extraHoursValue && (
                  <Typography fontSize="11px" color="error" mt={0.5}>{fieldErrors.extraHoursValue}</Typography>
                )}
              </Box>
            )}

            {/* Status */}
            <Box>
              <CustomInputLabel label="Status" />
              <CustomSelect
                value={form.attendanceStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, attendanceStatus: e.target.value }))}
                fullWidth height="45px" inputBgColor="#fff"
              >
                <MenuItem value="">Auto-detect (based on hours entered)</MenuItem>
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