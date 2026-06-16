// hrPortal/attendance/editAttendanceDialog.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import { Box, MenuItem }       from "@mui/material";
import { TimePicker }          from "@mui/x-date-pickers/TimePicker";
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
 
];

const INITIAL = { checkIn: null, checkOut: null, attendanceStatus: "", notes: "" };

// ── Parse time string — handles both 24hr ("09:24") and 12hr ("09:24 AM") ────
const parseTime = (timeStr) => {
  if (!timeStr || timeStr === "-" || timeStr.trim() === "") return null;
  const str = timeStr.trim();
  // Try 24hr first "HH:mm" or "H:mm"
  let parsed = dayjs(str, "HH:mm", true);
  if (parsed.isValid()) return parsed;
  // Try 12hr "hh:mm A" / "h:mm A"
  parsed = dayjs(str, "hh:mm A", true);
  if (parsed.isValid()) return parsed;
  parsed = dayjs(str, "h:mm A", true);
  if (parsed.isValid()) return parsed;
  return null;
};

// ── Format time back for saving — use 24hr for backend consistency ────────────
const formatTime = (dayjsObj) => {
  if (!dayjsObj || !dayjsObj.isValid()) return "";
  return dayjsObj.format("HH:mm");
};

const EditAttendanceDialog = ({ open, onClose, record = null, onSave, loading = false }) => {
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
  if (!open) return;
  if (record) {
   
    const status = record.attendanceStatus === "Partial" ? "Present" : (record.attendanceStatus || "");
    setForm({
      checkIn:          parseTime(record.checkIn),
      checkOut:         parseTime(record.checkOut),
      attendanceStatus: status,
      notes:            record.notes || "",
    });
  } else {
    setForm(INITIAL);
  }
}, [record, open]);

  const handleSave = () => {
    const checkIn  = formatTime(form.checkIn);
    const checkOut = formatTime(form.checkOut);

    // Calculate hours if both present
    let hoursStr = "";
    if (form.checkIn?.isValid() && form.checkOut?.isValid()) {
      const diffMins = form.checkOut.diff(form.checkIn, "minute");
      const netMins  = Math.max(0, diffMins - 60);  // minus 1hr lunch
      const h = Math.floor(netMins / 60);
      const m = netMins % 60;
      hoursStr = `${h}h ${m}m`;
    }

    onSave?.({
      ...record,
      checkIn,
      checkOut,
      hours:            hoursStr,
      attendanceStatus: form.attendanceStatus,
      notes:            form.notes,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
        <DialogHeader title="Edit Attendance" onClose={onClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

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

            {/* Status */}
            <Box>
              <CustomInputLabel label="Status" />
              <CustomSelect
                value={form.attendanceStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, attendanceStatus: e.target.value }))}
                fullWidth height="45px" inputBgColor="#fff"
              >
                <MenuItem value="">Select Status</MenuItem>
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
          confirmText="Save Changes"
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default EditAttendanceDialog;