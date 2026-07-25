// tabs/leavePolicyTab.jsx — 
import { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";
import CustomSwitch     from "../../../../components/switch";
import { useLeavePolicy } from "../../../../hooks/leavePolicy";

const INITIAL_FORM = {
  annualLeaveDays:    "12",
  sickLeaveDays:      "10",
  casualLeaveDays:    "8",
  emergencyLeaveDays: "5",
  maternityLeaveDays:  "90",
  shortLeavesPerMonth: "2",
  autoApprove:        false,
  autoApproveDays:    "1",
};

// Whole-number-only validator for day/count fields (0–365 range, sane upper bound)
const validateWholeNumberField = (value, label, { min = 0, max = 365 } = {}) => {
  if (value === "" || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const num = Number(value);
  if (isNaN(num)) return `${label} must be a number.`;
  if (!Number.isInteger(num)) return `${label} must be a whole number.`;
  if (num < min) return `${label} cannot be negative.`;
  if (num > max) return `${label} cannot exceed ${max}.`;
  return "";
};

// ── Keystroke guard ────────────────────────────────────────────────────────
// Blocks the sign/exponent/decimal characters outright, and stops ArrowDown
// (and the spinner's down-arrow, which fires the same key event) from
// decrementing past the field's minimum. `min` differs per field — 0 for the
// allowance counts, 1 for the auto-approve threshold.
const blockInvalidNumericKeys = (min = 0) => (e) => {
  if (["-", "+", "e", "E", "."].includes(e.key)) {
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowDown") {
    const current = Number(e.target.value);
    if (e.target.value === "" || isNaN(current) || current <= min) {
      e.preventDefault();
    }
  }
};

// Pasting is the other way a negative slips in — the keydown guard never
// fires for it.
const blockInvalidPaste = (e) => {
  const pasted = (e.clipboardData || window.clipboardData).getData("text");
  if (!/^\d+$/.test(String(pasted).trim())) e.preventDefault();
};

const LeavePolicyTab = () => {
  const { policy, loading, actionLoading, error, savePolicy } = useLeavePolicy();

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
  if (policy) {
    setFormData({
      annualLeaveDays:     policy.annualLeaveDays    != null ? String(policy.annualLeaveDays)    : "0",
      sickLeaveDays:       policy.sickLeaveDays       != null ? String(policy.sickLeaveDays)      : "0",
      casualLeaveDays:     policy.casualLeaveDays     != null ? String(policy.casualLeaveDays)    : "0",
      emergencyLeaveDays:  policy.emergencyLeaveDays  != null ? String(policy.emergencyLeaveDays) : "0",
      maternityLeaveDays:  policy.maternityLeaveDays  != null ? String(policy.maternityLeaveDays) : "0", 
      shortLeavesPerMonth: policy.shortLeavesPerMonth != null ? String(policy.shortLeavesPerMonth): "0",
      autoApprove:         policy.autoApprove         || false,
      autoApproveDays:     policy.autoApproveDays     != null ? String(policy.autoApproveDays)    : "1",
    });
  }
}, [policy]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Numeric change handler ───────────────────────────────────────────────
  // Last line of defence: even if a negative or non-integer reaches the input
  // by some route the keydown/paste guards miss, it never lands in state.
  // Empty is allowed so the field can be cleared while retyping.
  const handleNumericChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw !== "" && !/^\d+$/.test(raw)) return;
    setFormData((prev) => ({ ...prev, [field]: raw }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};

    const annualErr = validateWholeNumberField(formData.annualLeaveDays, "Annual leave days", { min: 0, max: 365 });
    if (annualErr) e.annualLeaveDays = annualErr;

    const sickErr = validateWholeNumberField(formData.sickLeaveDays, "Sick leave days", { min: 0, max: 365 });
    if (sickErr) e.sickLeaveDays = sickErr;

    const casualErr = validateWholeNumberField(formData.casualLeaveDays, "Casual leave days", { min: 0, max: 365 });
    if (casualErr) e.casualLeaveDays = casualErr;

    const emergencyErr = validateWholeNumberField(formData.emergencyLeaveDays, "Emergency leave days", { min: 0, max: 365 });
    if (emergencyErr) e.emergencyLeaveDays = emergencyErr;

    const maternityErr = validateWholeNumberField(formData.maternityLeaveDays, "Maternity leave days", { min: 0, max: 365 });
    if (maternityErr) e.maternityLeaveDays = maternityErr;

    // Short leave — monthly count, separate scale (0–31, since it can't
    // realistically exceed the days in a month)
    const shortErr = validateWholeNumberField(formData.shortLeavesPerMonth, "Short leaves per month", { min: 0, max: 31 });
    if (shortErr) e.shortLeavesPerMonth = shortErr;

    if (formData.autoApprove) {
      const autoErr = validateWholeNumberField(formData.autoApproveDays, "Auto-approve threshold", { min: 1, max: 365 });
      if (autoErr) e.autoApproveDays = autoErr;
    }

    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

  const result = await savePolicy({
  annualLeaveDays:     Number(formData.annualLeaveDays),
  sickLeaveDays:       Number(formData.sickLeaveDays),
  casualLeaveDays:     Number(formData.casualLeaveDays),
  emergencyLeaveDays:  Number(formData.emergencyLeaveDays),
  maternityLeaveDays:  Number(formData.maternityLeaveDays),   
  shortLeavesPerMonth: Number(formData.shortLeavesPerMonth),
  autoApprove:         formData.autoApprove,
  autoApproveDays:     formData.autoApprove ? Number(formData.autoApproveDays) : 0,
});
    if (result.success) {
      setSaveSuccess(true);
      setErrors({});
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={3}>
        Leave Policies
      </Typography>

      {error && (
        <Box mb={2.5} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {/* ── Annual-basis leave types ─────────────────────────────────────── */}
      <Typography fontSize="13px" fontWeight={600} color="text.secondary" mb={1.5}>
        Annual Allowances (days per year)
      </Typography>

      <Grid container spacing={2} mb={1}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Annual Leave Days *" />
          <TextInput
            placeholder="e.g. 12"
            value={formData.annualLeaveDays}
            onChange={handleNumericChange("annualLeaveDays")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 365, step: 1 }}
            error={!!errors.annualLeaveDays}
            helperText={errors.annualLeaveDays}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Sick Leave Days *" />
          <TextInput
            placeholder="e.g. 10"
            value={formData.sickLeaveDays}
            onChange={handleNumericChange("sickLeaveDays")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 365, step: 1 }}
            error={!!errors.sickLeaveDays}
            helperText={errors.sickLeaveDays}
          />
        </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Emergency Leave Days *" />
          <TextInput
            placeholder="e.g. 5"
            value={formData.emergencyLeaveDays}
            onChange={handleNumericChange("emergencyLeaveDays")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 365, step: 1 }}
            error={!!errors.emergencyLeaveDays}
            helperText={errors.emergencyLeaveDays}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Maternity Leave Days *" />
          <TextInput
            placeholder="e.g. 90"
            value={formData.maternityLeaveDays}
            onChange={handleNumericChange("maternityLeaveDays")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 365, step: 1 }}
            error={!!errors.maternityLeaveDays}
            helperText={errors.maternityLeaveDays}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Casual Leave Days *" />
          <TextInput
            placeholder="e.g. 8"
            value={formData.casualLeaveDays}
            onChange={handleNumericChange("casualLeaveDays")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 365, step: 1 }}
            error={!!errors.casualLeaveDays}
            helperText={errors.casualLeaveDays}
          />
        </Grid>

        {/* Short Leave — sits directly below Casual Leave, separate monthly scale */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Short Leaves Allowed (per month) *" />
          <TextInput
            placeholder="e.g. 2"
            value={formData.shortLeavesPerMonth}
            onChange={handleNumericChange("shortLeavesPerMonth")}
            onKeyDown={blockInvalidNumericKeys(0)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 31, step: 1 }}
            error={!!errors.shortLeavesPerMonth}
            helperText={errors.shortLeavesPerMonth || "Counted per calendar month, not annually."}
          />
        </Grid>

    

      </Grid>

      {/* ── Auto-approve toggle ──────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mt={2} mb={1}>
        <CustomSwitch
          checked={formData.autoApprove}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, autoApprove: e.target.checked }));
            if (errors.autoApproveDays) setErrors((prev) => ({ ...prev, autoApproveDays: "" }));
          }}
        />
        <Typography fontSize="13px" color="text.secondary">
          Auto-approve leaves under X days
        </Typography>

        <Box sx={{ width: 100 }}>
          <TextInput
            value={formData.autoApproveDays}
            onChange={handleNumericChange("autoApproveDays")}
            onKeyDown={blockInvalidNumericKeys(1)}
            onPaste={blockInvalidPaste}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            inputProps={{ min: 1, max: 365, step: 1 }}
            disabled={!formData.autoApprove}
            error={!!errors.autoApproveDays}
          />
        </Box>
      </Box>
      {errors.autoApproveDays && (
        <Typography fontSize="12px" color="error" mb={2}>{errors.autoApproveDays}</Typography>
      )}

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <CustomButton
          btnLabel={actionLoading ? "Saving..." : "Save Changes"}
          variant="gradient"
          handlePressBtn={handleSave}
          isDisabled={actionLoading}
        />
      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Leave policy saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default LeavePolicyTab;