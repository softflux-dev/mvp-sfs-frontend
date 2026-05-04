// tabs/emailConfigurationTab.jsx
import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";

const EmailConfigurationTab = () => {
  const [formData, setFormData] = useState({
    smtpHost:          "",
    smtpPort:          "",
    smtpUsername:      "",
    smtpPassword:      "",
    fromEmailAddress:  "",
    fromName:          "",
  });

  const [saveSuccess, setSaveSuccess]   = useState(false);
  const [testSuccess, setTestSuccess]   = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    console.log("Email config:", formData);
    setSaveSuccess(true);
  };

  const handleTestEmail = () => {
    console.log("Sending test email with config:", formData);
    setTestSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={3}>
        Email Configuration
      </Typography>

      {/* ── Fields ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={4}>

        {/* SMTP Host */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="SMTP Host" />
          <TextInput
            placeholder="Enter"
            value={formData.smtpHost}
            onChange={handleChange("smtpHost")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Grid>

        {/* SMTP Port */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="SMTP Port" />
          <TextInput
            placeholder="Enter"
            value={formData.smtpPort}
            onChange={handleChange("smtpPort")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
          />
        </Grid>

        {/* SMTP Username */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="SMTP Username" />
          <TextInput
            placeholder="Enter Username"
            value={formData.smtpUsername}
            onChange={handleChange("smtpUsername")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Grid>

        {/* SMTP Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="SMTP Password" />
          <TextInput
            placeholder="Enter Password"
            value={formData.smtpPassword}
            onChange={handleChange("smtpPassword")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="password"
          />
        </Grid>

        {/* From Email Address */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="From Email Address" />
          <TextInput
            placeholder="Enter Email"
            value={formData.fromEmailAddress}
            onChange={handleChange("fromEmailAddress")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="email"
          />
        </Grid>

        {/* From Name */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="From Name" />
          <TextInput
            placeholder="Enter Name"
            value={formData.fromName}
            onChange={handleChange("fromName")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Grid>

      </Grid>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" gap={1.5}>
        <CustomButton
          btnLabel="Send Test Email"
          variant="grayOutlined"
          handlePressBtn={handleTestEmail}
        />
        <CustomButton
          btnLabel="Save Changes"
          variant="gradient"
          handlePressBtn={handleSave}
        />
      </Box>

      {/* ── Popups ───────────────────────────────────────────────────────── */}
      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Email configuration saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={testSuccess}
        onClose={() => setTestSuccess(false)}
        message="Test email sent successfully"
        autoClose
        autoCloseDelay={2000}
      />

    </Box>
  );
};

export default EmailConfigurationTab;