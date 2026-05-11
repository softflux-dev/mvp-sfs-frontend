// profile/tabs/securityTab.jsx
import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";

import { TextInput } from "../../../../components";
import CustomInputLabel from "../../../../components/customInputLabel";
import CustomButton from "../../../../components/customButton";
import SuccessPopup from "../../../../components/popups/confirmationDialog";

const SecurityTab = () => {
  const [formData, setFormData] = useState({
    currentPassword:    "",
    newPassword:        "",
    confirmNewPassword: "",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdate = () => {
    console.log("Update password:", formData);
    setSaveSuccess(true);
    setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Grid container spacing={2}>
        {/* Current Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Current Password" />
          <TextInput
            placeholder=""
            type="password"
            value={formData.currentPassword}
            onChange={handleChange("currentPassword")}
            inputBgColor="#F5F5F5"
            fullWidth
             showPassIcon
          />
        </Grid>

        {/* New Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="New Password" />
          <TextInput
            placeholder=""
            type="password"
            value={formData.newPassword}
            onChange={handleChange("newPassword")}
            inputBgColor="#F5F5F5"
            fullWidth
             showPassIcon
          />
        </Grid>

        {/* Confirm New Password*/}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Confirm New Password" />
          <TextInput
            placeholder=""
            type="password"
            value={formData.confirmNewPassword}
            onChange={handleChange("confirmNewPassword")}
            inputBgColor="#F5F5F5"
            fullWidth
             showPassIcon
          />
        </Grid>
      </Grid>

      {/* Update Password button*/}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <CustomButton
          btnLabel="Update Password"
          variant="gradient"
          handlePressBtn={handleUpdate}
        />
      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Password updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default SecurityTab;