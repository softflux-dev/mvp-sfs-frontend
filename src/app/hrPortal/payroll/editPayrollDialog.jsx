import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import TextInput           from "../../../components/textInput";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

const EditPayrollDialog = ({ open, onClose, payroll = {}, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ bonus: "", deductions: "", reason: "" });
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        bonus:       String(payroll.bonus      ?? ""),
        deductions:  String(payroll.deductions ?? ""),
        reason:      "",
      });
    }
  }, [open, payroll]);

  const netPay =
    (payroll.baseSalary ?? 0) +
    (Number(formData.bonus) || 0) -
    (Number(formData.deductions) || 0);

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

 const handleSave = async () => {
  setSaving(true);
  const result = await onSave?.({ ...payroll, ...formData, netPay });
  setSaving(false);
  // Only close on actual success; leave dialog open with data intact on failure
  if (!result || result.success !== false) {
    onClose();
  }
};

  return (
    <>
      <DialogContainer open={open} onClose={onClose} maxWidth="440px" fullWidth>
        <DialogHeader title="Edit Payroll Entry" onClose={onClose} />

        <DialogBody>

          {/* ── Read-only meta ────────────────────────────────────────────── */}
          <Box mb={2.5}>
            <Typography fontSize="13px" fontWeight={700} color="text.primary">
              Employee
            </Typography>
            <Typography fontSize="13px" color="text.secondary">
              {payroll.name || "Sarah Johnson"}
            </Typography>
          </Box>

          <Box mb={2.5}>
            <Typography fontSize="13px" fontWeight={700} color="text.primary">
              Month
            </Typography>
            <Typography fontSize="13px" color="text.secondary">
              March 2026
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography fontSize="13px" fontWeight={700} color="text.primary">
              Base Salary
            </Typography>
            <Typography fontSize="13px" color="text.secondary">
              ${(payroll.baseSalary ?? 7395).toLocaleString()}
            </Typography>
          </Box>

          {/* ── Editable fields ──────────────────────────────────────────── */}
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "16px",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Bonus */}
            <Box>
              <CustomInputLabel label="Bonus" />
              <TextInput
                placeholder="444"
                value={formData.bonus}
                onChange={handleChange("bonus")}
                inputBgColor="#fff"
                fullWidth
                type="number"
              />
            </Box>

            {/* Deductions */}
            <Box>
              <CustomInputLabel label="Deductions" />
              <TextInput
                placeholder="94"
                value={formData.deductions}
                onChange={handleChange("deductions")}
                inputBgColor="#fff"
                fullWidth
                type="number"
              />
            </Box>

            {/* Reason */}
            <Box>
              <CustomInputLabel label="Reason for Adjustment" />
              <TextInput
                placeholder="Add notes..."
                value={formData.reason}
                onChange={handleChange("reason")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* Net Pay preview */}
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                px: 2, py: 1.5,
              }}
            >
              <Typography fontSize="13px" color="text.secondary">
                Net Pay:{" "}
                <Typography component="span" fontSize="13px" fontWeight={700} color="text.primary">
                  ${netPay.toLocaleString()}
                </Typography>
              </Typography>
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

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Payroll updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default EditPayrollDialog;