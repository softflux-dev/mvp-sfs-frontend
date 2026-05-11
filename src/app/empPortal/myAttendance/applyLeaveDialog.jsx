import { useState, useEffect } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

// ── Options ───────────────────────────────────────────────────────────────
const LEAVE_TYPE_OPTIONS = [
  { value: "sick",      label: "Sick Leave"      },
  { value: "casual",    label: "Casual Leave"    },
  { value: "annual",    label: "Annual Leave"    },
  { value: "maternity", label: "Maternity Leave" },
  { value: "unpaid",    label: "Unpaid Leave"    },
];

const INITIAL_FORM = {
  leaveType: "",
  fromDate:  null,
  toDate:    null,
  reason:    "",
};

// ── Component ─────────────────────────────────────────────────────────────
const ApplyLeaveDialog = ({ open, onClose, onSubmit, loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM);
      setErrors({});
    }
  }, [open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.leaveType)   e.leaveType = "Leave type is required";
    if (!formData.fromDate)    e.fromDate  = "From date is required";
    if (!formData.toDate)      e.toDate    = "To date is required";
    if (!formData.reason.trim()) e.reason  = "Reason is required";
    return e;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit?.(formData);
    handleClose();
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
          <DialogHeader title="Apply for Leave" onClose={handleClose} />

          <DialogBody>
            <Box
              sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: "16px",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {/* Leave Type */}
              <Box>
                <CustomInputLabel label="Leave Type" />
                <CustomSelect
                  value={formData.leaveType}
                  onChange={handleChange("leaveType")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                  displayEmpty
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {LEAVE_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </CustomSelect>
                {errors.leaveType && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.leaveType}
                  </Typography>
                )}
              </Box>

              {/* From Date + To Date */}
              <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                {/* From Date */}
                <Box>
                  <CustomInputLabel label="From Date" />
                  <DatePicker
                    value={formData.fromDate}
                    onChange={(v) => {
                      setFormData((prev) => ({ ...prev, fromDate: v }));
                      if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: "" }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        placeholder: "Select Status",
                        error: !!errors.fromDate,
                      },
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
                  {errors.fromDate && (
                    <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                      {errors.fromDate}
                    </Typography>
                  )}
                </Box>

                {/* To Date */}
                <Box>
                  <CustomInputLabel label="To Date" />
                  <DatePicker
                    value={formData.toDate}
                    minDate={formData.fromDate || undefined}
                    onChange={(v) => {
                      setFormData((prev) => ({ ...prev, toDate: v }));
                      if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: "" }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        placeholder: "Select Status",
                        error: !!errors.toDate,
                      },
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
                  {errors.toDate && (
                    <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                      {errors.toDate}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Reason */}
              <Box>
                <CustomInputLabel label="Reason" />
                <TextInput
                  placeholder="Enter Reason"
                  value={formData.reason}
                  onChange={handleChange("reason")}
                  inputBgColor="#fff"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.reason}
                  helperText={errors.reason}
                />
              </Box>
            </Box>
          </DialogBody>

          <DialogActionButtons
            onCancel={handleClose}
            onConfirm={handleSubmit}
            showCancelBtn
            cancelText="Cancel"
            confirmText="Submit"
            variant="gradient"
            confirmLoading={loading}
          />
        </DialogContainer>
      </LocalizationProvider>

      {/* Success popup */}
      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Submit Successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default ApplyLeaveDialog;