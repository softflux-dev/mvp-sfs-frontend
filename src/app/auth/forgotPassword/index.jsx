// app/auth/forgotPassword/index.jsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";

import CustomInputLabel from "../../../components/customInputLabel";
import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import AuthLayout       from "../../../components/authLayout";
import OtpDialog        from "../login/otpDialog";
import { useAuth }      from "../../../hooks/auth";          // ← hook

const ForgotPasswordPage = () => {
  const {
    loading, apiError, clearError,
    handleForgotPassword, handleVerifyOtp,
  } = useAuth();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const onSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("You have entered an invalid email");
      return;
    }
    setError("");
    const result = await handleForgotPassword(email);
    if (result.success) setShowOtp(true);
  };

  const onVerify = async (code) => {
    await handleVerifyOtp(code);
    // navigation to /reset-password is handled inside the hook
  };

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
        Verification
      </Typography>
      <Typography fontSize="14px" color="text.secondary" mb={4}>
        Please Complete Your Verification
      </Typography>

      {apiError && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{apiError}</Typography>
        </Box>
      )}

      <Box mb={3}>
        <CustomInputLabel label="Email Address" />
        <TextInput
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error)    setError("");
            if (apiError) clearError();
          }}
          inputBgColor="#F5F5F5" fullWidth type="email"
          error={!!error} helperText={error}
        />
      </Box>

      <CustomButton
        btnLabel={loading ? "Sending..." : "Send Code"}
        variant="authbutton"
        handlePressBtn={onSend}
        fullWidth sx={{ width: "100%" }}
      />

      <OtpDialog
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={onVerify}
        apiError={apiError}
        loading={loading}
        onResend={onSend}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;