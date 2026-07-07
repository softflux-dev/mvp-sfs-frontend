// hrPortal/attendance/editAttendanceDialog.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import { Box, MenuItem }       from "@mui/material";
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

// ── Added offSiteHours/extraHours to initial form state ──────────────────
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

  useEffect(() => {
    if (!open) return;
    if (record) {
      const status = record.attendanceStatus === "Partial" ? "Present" : (record.attendanceStatus || "");
      setForm({
        date:             record.rawDate ? dayjs(record.rawDate) : null,
        checkIn:          parseTime(record.checkIn),
        checkOut:         parseTime(record.checkOut),
        attendanceStatus: status,
        notes:            record.notes || "",
        // ── Pre-fill off-site/extra hours from the existing record, if present ──
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

  const handleSave = () => {
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

    // ── Parse off-site/extra hours — blank/invalid input safely becomes 0 ────
    const offSiteHours = Math.max(0, parseFloat(form.offSiteHours) || 0);
    const extraHours   = Math.max(0, parseFloat(form.extraHours)   || 0);

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

            {/* ── NEW: Off-Site / Extra Hours ─────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Off-Site / Remote Hours" />
                <TextInput
                  placeholder="0"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={form.offSiteHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, offSiteHours: e.target.value }))}
                  inputBgColor="#fff"
                  fullWidth
                />
              </Box>
              <Box>
                <CustomInputLabel label="Extra Hours" />
                <TextInput
                  placeholder="0"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={form.extraHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, extraHours: e.target.value }))}
                  inputBgColor="#fff"
                  fullWidth
                />
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
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default EditAttendanceDialog;