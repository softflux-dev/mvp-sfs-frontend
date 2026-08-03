// src/app/empPortal/myAttendance/applyLeaveDialog.jsx — Phase 1 (Leave Management Enhancement)
//
// New in this phase:
//  • Paid / Unpaid toggle (employee preference, spec §3.1).
//  • Inline "X days remaining" for the chosen type.
//  • Auto-default rule: if the type's paid balance is 0 -> default Unpaid with a
//    soft warning; the employee can still override to Paid (spec §3.1 ⚠ rule).
//  • Single-date lock for short leave — one day only, no range (spec §2.2.1).
//  • paymentPreference is sent in the payload.
//  • Removed the old "Approved leave is paid…" reassurance (contradicts the new flow).

import { useState, useEffect }        from "react";
import { Box, Typography, MenuItem }  from "@mui/material";
import { DatePicker }                 from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider }       from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }             from "@mui/x-date-pickers/AdapterDateFns";
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

// Must match the enum in models/employee/leave.js.
// FIX: "Annual Leave" removed as a selectable type. Annual is no longer an
// independently-consumable bucket — it's now derived as Sick+Casual+Emergency
// +Maternity (see backend fix in getEmployeeLeaveBalance/getAllEmployeeBalances).
// A NEW request submitted with leaveType:"annual" would be approved fine by
// HR, but its usage wouldn't reduce anything visible in any balance view —
// it'd silently vanish from tracking. Employees now pick the real type
// directly (Sick/Casual/Emergency/Maternity/Short/Full Day).
const LEAVE_TYPE_OPTIONS = [
  { value: "sick",      label: "Sick Leave"      },
  { value: "casual",    label: "Casual Leave"    },
  { value: "maternity", label: "Maternity Leave" },
  { value: "emergency", label: "Emergency Leave" },
  { value: "short",     label: "Short Leave"     },
 
];

// Types locked to a single day (no date range) — spec §2.2.1.
const SINGLE_DATE_TYPES = ["short"];

// Types with an annual allocation bucket in the balance response.
// "annual" removed — no longer selectable above, so never reached here.
const ANNUAL_BALANCE_TYPES = ["sick", "casual", "emergency", "maternity"];

// Resolve the remaining PAID allowance for a given type from the balance object.
// Returns null when the type has no tracked bucket (e.g. full_day).
const remainingForType = (leaveType, balance) => {
  if (!balance) return null;
  if (ANNUAL_BALANCE_TYPES.includes(leaveType)) return balance.balance?.[leaveType]?.remaining ?? null;
  if (leaveType === "short") return balance.shortLeave?.remaining ?? null;
  return null;
};

const INITIAL_FORM = {
  leaveType: "",
  fromDate: null,
  toDate: null,
  reason: "",
  paymentPreference: "paid",
};

const ApplyLeaveDialog = ({ open, onClose, onSubmit, loading = false, balance = null, balanceLoading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [zeroBalanceWarning, setZeroBalanceWarning] = useState(false);

  useEffect(() => {
    if (!open) { setFormData(INITIAL_FORM); setErrors({}); setZeroBalanceWarning(false); }
  }, [open]);

  const isSingleDate = SINGLE_DATE_TYPES.includes(formData.leaveType);
  const remaining    = remainingForType(formData.leaveType, balance);
  const hasBucket    = remaining !== null;

  // ── Auto-default rule: when the selected type has a paid bucket that is
  // exhausted, default the preference to Unpaid and surface a soft warning.
  // The employee can still switch it back to Paid. ─────────────────────────
  useEffect(() => {
    if (!formData.leaveType) { setZeroBalanceWarning(false); return; }
    const rem = remainingForType(formData.leaveType, balance);
    if (rem !== null && rem <= 0) {
      setZeroBalanceWarning(true);
      setFormData((p) => ({ ...p, paymentPreference: "unpaid" }));
    } else {
      setZeroBalanceWarning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.leaveType, balance]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // From-date change — for single-date types, keep toDate pinned to fromDate.
  const handleFromDateChange = (v) => {
    setFormData((prev) => ({
      ...prev,
      fromDate: v,
      toDate: SINGLE_DATE_TYPES.includes(prev.leaveType) ? v : prev.toDate,
    }));
    if (errors.fromDate) setErrors((p) => ({ ...p, fromDate: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.leaveType)      e.leaveType = "Leave type is required";
    if (!formData.fromDate)       e.fromDate  = "From date is required";
    if (!isSingleDate && !formData.toDate) e.toDate = "To date is required";
    if (!formData.reason?.trim()) e.reason    = "Reason is required";
    if (!isSingleDate && formData.fromDate && formData.toDate &&
        new Date(formData.toDate) < new Date(formData.fromDate)) {
      e.toDate = "To date cannot be before from date";
    }
    return e;
  };

  const calcTotalDays = (from, to) => {
    if (!from || !to) return 1;
    const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const effectiveTo = isSingleDate ? formData.fromDate : formData.toDate;

    const payload = {
      leaveType:         formData.leaveType,
      fromDate:          formData.fromDate,
      toDate:            effectiveTo,
      totalDays:         isSingleDate ? 1 : calcTotalDays(formData.fromDate, effectiveTo),
      reason:            formData.reason?.trim() || "",
      paymentPreference: formData.paymentPreference,
    };

    const result = await onSubmit?.(payload);
    if (result?.success !== false) {
      handleClose();
      setSuccessOpen(true);
    }
  };

  const handleClose = () => { setFormData(INITIAL_FORM); setErrors({}); setZeroBalanceWarning(false); onClose?.(); };

  // Small toggle button for Paid / Unpaid
  const ToggleBtn = ({ value, label }) => {
    const active = formData.paymentPreference === value;
    return (
      <Box
        onClick={() => setFormData((p) => ({ ...p, paymentPreference: value }))}
        sx={{
          flex: 1, textAlign: "center", cursor: "pointer",
          px: 2, py: 1, borderRadius: "10px", fontSize: "13px", fontWeight: 600,
          border: active ? "1.5px solid #AA2493" : "1px solid #E5E7EB",
          backgroundColor: active ? "#FAF0FF" : "#fff",
          color: active ? "#AA2493" : "text.secondary",
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </Box>
    );
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
          <DialogHeader title="Apply for Leave" onClose={handleClose} />

          <DialogBody>
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

              {/* Leave Type */}
              <Box>
                <CustomInputLabel label="Leave Type *" />
                <CustomSelect value={formData.leaveType} onChange={handleChange("leaveType")} fullWidth height="45px" inputBgColor="#fff" displayEmpty>
                  <MenuItem value="">Select Type</MenuItem>
                  {LEAVE_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.leaveType && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.leaveType}</Typography>}
                {isSingleDate && (
                  <Typography fontSize="11px" color="text.secondary" mt={0.5} ml={0.5}>
                    Short leave is a single day — pick one date only.
                  </Typography>
                )}
              </Box>

              {/* Dates */}
              {isSingleDate ? (
                <Box>
                  <CustomInputLabel label="Date *" />
                  <DatePicker
                    value={formData.fromDate}
                    onChange={handleFromDateChange}
                    slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.fromDate } }}
                    sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                  />
                  {errors.fromDate && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.fromDate}</Typography>}
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                  <Box>
                    <CustomInputLabel label="From Date *" />
                    <DatePicker
                      value={formData.fromDate}
                      onChange={handleFromDateChange}
                      slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.fromDate } }}
                      sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                    />
                    {errors.fromDate && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.fromDate}</Typography>}
                  </Box>
                  <Box>
                    <CustomInputLabel label="To Date *" />
                    <DatePicker
                      value={formData.toDate}
                      minDate={formData.fromDate || undefined}
                      onChange={(v) => { setFormData((p) => ({ ...p, toDate: v })); if (errors.toDate) setErrors((p) => ({ ...p, toDate: "" })); }}
                      slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.toDate } }}
                      sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } } }}
                    />
                    {errors.toDate && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.toDate}</Typography>}
                  </Box>
                </Box>
              )}

              {/* Paid / Unpaid preference */}
              <Box>
                <CustomInputLabel label="Leave Payment Preference" />
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <ToggleBtn value="paid"   label="Paid Leave" />
                  <ToggleBtn value="unpaid" label="Unpaid Leave" />
                </Box>

                {/* Inline remaining balance for the chosen type */}
                {formData.leaveType && !balanceLoading && hasBucket && (
                  <Typography fontSize="12px" color={remaining > 0 ? "#04C373" : "#DC2626"} mt={0.75} ml={0.5} fontWeight={600}>
                    {remaining} day(s) of paid {formData.leaveType === "short" ? "short leave (this month)" : "leave"} remaining
                  </Typography>
                )}
                {formData.leaveType && !balanceLoading && !hasBucket && (
                  <Typography fontSize="11px" color="text.secondary" mt={0.75} ml={0.5}>
                    This leave type has no tracked paid allowance — HR will decide the final classification.
                  </Typography>
                )}

                {/* Zero-balance soft warning */}
                {zeroBalanceWarning && (
                  <Box mt={1} sx={{ px: 1.5, py: 1, borderRadius: "10px", backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3" }}>
                    <Typography fontSize="11px" color="#B45309">
                      You have no remaining paid balance for this leave type. It defaults to <strong>Unpaid Leave</strong>,
                      but you may still submit as Paid — HR makes the final call during approval.
                    </Typography>
                  </Box>
                )}

                <Typography fontSize="11px" color="text.secondary" mt={0.75} ml={0.5}>
                  This is a preference only. HR may change the leave type during approval.
                </Typography>
              </Box>

              {/* Reason */}
              <Box>
                <CustomInputLabel label="Reason *" />
                <TextInput
                  placeholder="Enter reason for leave..."
                  value={formData.reason}
                  onChange={handleChange("reason")}
                  inputBgColor="#fff"
                  fullWidth multiline rows={4}
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
            confirmText="Submit Request"
            variant="gradient"
            confirmLoading={loading}
          />
        </DialogContainer>
      </LocalizationProvider>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Leave request submitted successfully!"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default ApplyLeaveDialog;