import { useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";

import { TextInput }    from "../../../../components";
import CustomInputLabel from "../../../../components/customInputLabel";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";

const SecurityTab = ({ profile = {}, loading = false, onSave }) => {
  if (!profile) return null;
  const [formData, setFormData] = useState({
    currentPassword:    "",
    newPassword:        "",
    confirmNewPassword: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error,       setError]       = useState("");

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleUpdate = async () => {
    setError("");

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const result = await onSave?.({
      currentPassword:    formData.currentPassword,
      newPassword:        formData.newPassword,
      confirmNewPassword: formData.confirmNewPassword,
    });

    if (result?.success) {
      setSaveSuccess(true);
      setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } else {
      setError(result?.message || "Failed to update password.");
    }
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      {error && (
        <Box mb={2} px={2} py={1}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Current Password" />
          <TextInput
            placeholder="" type="password"
            value={formData.currentPassword}
            onChange={handleChange("currentPassword")}
            inputBgColor="#F5F5F5" fullWidth showPassIcon
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="New Password" />
          <TextInput
            placeholder="" type="password"
            value={formData.newPassword}
            onChange={handleChange("newPassword")}
            inputBgColor="#F5F5F5" fullWidth showPassIcon
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Confirm New Password" />
          <TextInput
            placeholder="" type="password"
            value={formData.confirmNewPassword}
            onChange={handleChange("confirmNewPassword")}
            inputBgColor="#F5F5F5" fullWidth showPassIcon
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <CustomButton
          btnLabel={loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : "Update Password"
          }
          variant="gradient"
          handlePressBtn={handleUpdate}
          disabled={loading}
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