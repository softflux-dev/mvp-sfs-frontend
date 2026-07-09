// tabs/securityTab.jsx — 
import { useState, useEffect } from "react";
import { Box, Typography, Grid, MenuItem, CircularProgress } from "@mui/material";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import CustomSwitch     from "../../../../components/switch";
import CustomSelect     from "../../../../components/customSelect";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";
import { useSecuritySettings } from "../../../../hooks/securitySettings";

const SESSION_TIMEOUT_OPTIONS = [
  { value: "15min", label: "15 Min" },
  { value: "30min", label: "30 Min" },
  { value: "1hour", label: "1 Hour" },
  { value: "4hour", label: "4 Hour" },
  { value: "never",  label: "Never" },
];

const SecurityTab = () => {
  const { settings, loading, actionLoading, error, saveSettings, changePassword } = useSecuritySettings();

  const [passwords,       setPasswords]       = useState({ current: "", newPass: "", confirm: "" });
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [passwordApiErr,  setPasswordApiErr]  = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [sessionTimeout,  setSessionTimeout]  = useState("30min");
  const [timeoutError,    setTimeoutError]    = useState("");
  const [settingSuccess,  setSettingSuccess]  = useState(false);

  // 2FA — STATIC / VISUAL ONLY. Not persisted, not sent to the backend.
  // Purely a local UI toggle reserved for a future real implementation.
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (settings) {
      setSessionTimeout(settings.sessionTimeout || "30min");
    }
  }, [settings]);

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
    if (passwordErrors[field]) setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    if (passwordApiErr) setPasswordApiErr("");
  };

  const validatePasswords = () => {
    const e = {};
    if (!passwords.current) e.current = "Current password is required.";
    if (!passwords.newPass) {
      e.newPass = "New password is required.";
    } else if (passwords.newPass.length < 8) {
      e.newPass = "Password must be at least 8 characters.";
    }
    if (!passwords.confirm) {
      e.confirm = "Please confirm your new password.";
    } else if (passwords.newPass && passwords.confirm !== passwords.newPass) {
      e.confirm = "Passwords do not match.";
    }
    if (passwords.current && passwords.newPass && passwords.current === passwords.newPass) {
      e.newPass = "New password must be different from the current password.";
    }
    return e;
  };

  const handleUpdatePassword = async () => {
    const validationErrors = validatePasswords();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    const result = await changePassword({
      currentPassword:    passwords.current,
      newPassword:        passwords.newPass,
      confirmNewPassword: passwords.confirm,
    });

    if (result.success) {
      setPasswordSuccess(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      setPasswordErrors({});
    } else {
      setPasswordApiErr(result.message);
    }
  };

  const handleSaveSettings = async () => {
    if (!sessionTimeout) {
      setTimeoutError("Please select a session timeout.");
      return;
    }
    setTimeoutError("");

    // NOTE: twoFactor is intentionally NOT included in this payload —
    // it's a static frontend-only toggle for now, no backend persistence.
    const result = await saveSettings({ sessionTimeout });
    if (result.success) {
      setSettingSuccess(true);
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

      {/* ── Section title ────────────────────────────────────────────────── */}
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray">
        Security Settings
      </Typography>
      <Typography fontSize="13px" color="text.secondary" mb={3}>
        Change Password
      </Typography>

      {passwordApiErr && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{passwordApiErr}</Typography>
        </Box>
      )}

      {/* ── Password fields ──────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={2}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Current Password *" />
          <TextInput
            placeholder="Enter"
            value={passwords.current}
            onChange={handlePasswordChange("current")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
            showPassIcon
            error={!!passwordErrors.current}
            helperText={passwordErrors.current}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="New Password *" />
          <TextInput
            placeholder="Enter"
            value={passwords.newPass}
            onChange={handlePasswordChange("newPass")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
            showPassIcon
            error={!!passwordErrors.newPass}
            helperText={passwordErrors.newPass}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomInputLabel label="Confirm New Password *" />
          <TextInput
            placeholder="Enter Password"
            value={passwords.confirm}
            onChange={handlePasswordChange("confirm")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
            showPassIcon
            error={!!passwordErrors.confirm}
            helperText={passwordErrors.confirm}
          />
        </Grid>

      </Grid>

      {/* ── Update Password button ───────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <CustomButton
          btnLabel={actionLoading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : "Update Password"
          }
          variant="gradient"
          handlePressBtn={handleUpdatePassword}
          isDisabled={actionLoading}
        />
      </Box>

      {/* ── Session Timeout ──────────────────────────────────────────────── */}
      {error && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      <Box mb={3}>
        <CustomInputLabel label="Session Timeout *" />
        <CustomSelect
          value={sessionTimeout}
          onChange={(e) => { setSessionTimeout(e.target.value); setTimeoutError(""); }}
          placeholder="Select Timeout"
          inputBgColor="#F5F5F5"
          fullWidth
          height="48px"
        >
          {SESSION_TIMEOUT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </CustomSelect>
        {timeoutError && (
          <Typography fontSize="12px" color="error" mt={0.5}>{timeoutError}</Typography>
        )}
        <Typography fontSize="11px" color="text.secondary" mt={0.5}>
          Automatically logs out every user (Admin, HR, PM, Employee) after this period of inactivity.
        </Typography>
      </Box>

      {/* ── Two-Factor Authentication — STATIC, not functional yet ──────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <CustomSwitch
          checked={twoFactor}
          onChange={(e) => setTwoFactor(e.target.checked)}
        />
        <Box>
          <Typography fontSize="15px" fontWeight={500} color="text.darkGray">
            Two-Factor Authentication
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
            Add an extra layer of security to your account
          </Typography>
        </Box>
      </Box>

      {/* ── Save Settings ────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel={actionLoading ? "Saving..." : "Save Setting"}
          variant="gradient"
          handlePressBtn={handleSaveSettings}
          isDisabled={actionLoading}
        />
      </Box>

      {/* ── Popups ───────────────────────────────────────────────────────── */}
      <SuccessPopup
        open={passwordSuccess}
        onClose={() => setPasswordSuccess(false)}
        message="Password updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={settingSuccess}
        onClose={() => setSettingSuccess(false)}
        message="Security settings saved successfully"
        autoClose
        autoCloseDelay={2000}
      />

    </Box>
  );
};

export default SecurityTab;