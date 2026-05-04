// app/auth/resetPassword/index.jsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomInputLabel from "../../../components/customInputLabel";
import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import AuthLayout       from "../../../components/authLayout";
import SuccessPopup     from "../../../components/popups/confirmationDialog";

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [form,        setForm]        = useState({ newPass: "", confirm: "" });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (form.newPass.length < 8)
      e.newPass = "Password must be at least 8 characters";
    if (form.confirm !== form.newPass)
      e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
        Reset Password
      </Typography>
      <Typography fontSize="14px" color="text.secondary" mb={4}>
        Enter Your New Password Below
      </Typography>

      <Box mb={2}>
        <CustomInputLabel label="New Password" />
        <TextInput
          placeholder="Enter New Password"
          value={form.newPass}
          onChange={(e) => {
            setForm((p) => ({ ...p, newPass: e.target.value }));
            if (errors.newPass) setErrors((p) => ({ ...p, newPass: "" }));
          }}
          inputBgColor="#F5F5F5"
          fullWidth
          type="password"
          showPassIcon
          error={!!errors.newPass}
          helperText={errors.newPass}
        />
      </Box>

      <Box mb={4}>
        <CustomInputLabel label="Confirm New Password" />
        <TextInput
          placeholder="Re-Enter New Password"
          value={form.confirm}
          onChange={(e) => {
            setForm((p) => ({ ...p, confirm: e.target.value }));
            if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
          }}
          inputBgColor="#F5F5F5"
          fullWidth
          type="password"
          showPassIcon
          error={!!errors.confirm}
          helperText={errors.confirm}
        />
      </Box>

      <CustomButton
        btnLabel={loading ? "Updating..." : "Update Password"}
        variant="authbutton"
        handlePressBtn={handleUpdate}
        fullWidth
        sx={{ width: "100%" }}
      />

      <SuccessPopup
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/login");
        }}
        message="Password updated successfully."
        autoClose
        autoCloseDelay={2000}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage;