import { useState, useEffect }  from "react";
import { Box, MenuItem }        from "@mui/material";
import { TimePicker }           from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs }         from "@mui/x-date-pickers/AdapterDayjs";
import dayjs                    from "dayjs";

import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import GlobalStyle         from "../../../style/style";

const STATUS_OPTIONS = [
  { value: "Present", label: "Present" },
  { value: "Absent",  label: "Absent"  },
  { value: "Late",    label: "Late"    },
  { value: "Leave",   label: "Leave"   },
];

const INITIAL = { checkIn: null, checkOut: null, attendanceStatus: "", notes: "" };

const EditAttendanceDialog = ({ open, onClose, record = null, onSave }) => {
  const [form,        setForm]        = useState(INITIAL);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({
        checkIn:          record.checkIn  ? dayjs(record.checkIn,  "hh:mm A") : null,
        checkOut:         record.checkOut ? dayjs(record.checkOut, "hh:mm A") : null,
        attendanceStatus: record.attendanceStatus || "",
        notes:            record.notes            || "",
      });
    } else {
      setForm(INITIAL);
    }
  }, [record, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    onSave?.({
      ...record,
      checkIn:          form.checkIn  ? form.checkIn.format("hh:mm A")  : "",
      checkOut:         form.checkOut ? form.checkOut.format("hh:mm A") : "",
      hours:            (form.checkIn && form.checkOut)
                          ? `${form.checkOut.diff(form.checkIn, "hour")}h`
                          : "",
      attendanceStatus: form.attendanceStatus,
      notes:            form.notes,
    });
    setSuccessOpen(true);
    onClose?.();
  };

  return (
    <>
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
                    slotProps={{
                      textField: { size: "small", fullWidth: true, placeholder: "09:00 AM" },
                    }}
                    sx={{
                      ...GlobalStyle.datePickerStyle,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                        borderRadius: "14px",
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
                    slotProps={{
                      textField: { size: "small", fullWidth: true, placeholder: "06:00 PM" },
                    }}
                    sx={{
                      ...GlobalStyle.datePickerStyle,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                        borderRadius: "14px",
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
                  onChange={handleChange("attendanceStatus")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
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
                  onChange={handleChange("notes")}
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
          />
        </DialogContainer>
      </LocalizationProvider>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Attendance updated successfully."
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default EditAttendanceDialog;