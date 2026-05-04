// tabs/securityTab.jsx
import { useState } from "react";
import { Box, Typography, Grid, MenuItem } from "@mui/material";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import CustomSwitch     from "../../../../components/switch";
import CustomSelect     from "../../../../components/customSelect";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";

const SESSION_TIMEOUT_OPTIONS = [
  { value: "15min",  label: "15 Min" },
  { value: "30min",  label: "30 Min" },
  { value: "1hour",  label: "1 Hour" },
  { value: "4hour",  label: "4 Hour" },
  { value: "never",  label: "Never" },
];

const SecurityTab = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [sessionTimeout,  setSessionTimeout]  = useState("30min");
  const [twoFactor,       setTwoFactor]       = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [settingSuccess,  setSettingSuccess]  = useState(false);

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdatePassword = () => {
    console.log("Update password:", passwords);
    setPasswordSuccess(true);
  };

  const handleSaveSettings = () => {
    console.log("Security settings:", { sessionTimeout, twoFactor });
    setSettingSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      {/* ── Section title ────────────────────────────────────────────────── */}
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray">
        Security Settings
      </Typography>
      <Typography fontSize="13px" color="text.secondary" mb={3}>
        Change Password
      </Typography>

      {/* ── Password fields ──────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={2}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Current Password" />
          <TextInput
            placeholder="Enter"
            value={passwords.current}
            onChange={handlePasswordChange("current")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="New Password" />
          <TextInput
            placeholder="Enter"
            value={passwords.newPass}
            onChange={handlePasswordChange("newPass")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomInputLabel label="Confirm New Password" />
          <TextInput
            placeholder="Enter Password"
            value={passwords.confirm}
            onChange={handlePasswordChange("confirm")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
          />
        </Grid>

      </Grid>

      {/* ── Update Password button ───────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <CustomButton
          btnLabel="Update Password"
          variant="gradient"
          handlePressBtn={handleUpdatePassword}
        />
      </Box>

      {/* ── Session Timeout ──────────────────────────────────────────────── */}
      <Box mb={3}>
        <CustomInputLabel label="Session Timeout" />
        <CustomSelect
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(e.target.value)}
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
      </Box>

      {/* ── Two-Factor Authentication ────────────────────────────────────── */}
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
          btnLabel="Save Setting"
          variant="gradient"
          handlePressBtn={handleSaveSettings}
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