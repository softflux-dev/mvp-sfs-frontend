// app/auth/forgotPassword/index.jsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomInputLabel from "../../../components/customInputLabel";
import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import AuthLayout       from "../../../components/authLayout";
import OtpDialog        from "../login/otpDialog";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleSend = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("You have entered an invalid email");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);       // ← open OTP dialog
    }, 1000);
  };

  const handleOtpVerify = (code) => {
    console.log("OTP verified:", code);
    setShowOtp(false);
    navigate("/reset-password");  // ← proceed to reset password
  };

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
        Verification
      </Typography>
      <Typography fontSize="14px" color="text.secondary" mb={4}>
        Please Complete Your Verification
      </Typography>

      <Box mb={3}>
        <CustomInputLabel label="Email Address" />
        <TextInput
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          inputBgColor="#F5F5F5"
          fullWidth
          type="email"
          error={!!error}
          helperText={error}
        />
      </Box>

      <CustomButton
        btnLabel={loading ? "Sending..." : "Send Code"}
        variant="authbutton"
        handlePressBtn={handleSend}
        fullWidth
        sx={{ width: "100%" }}
      />

      <OtpDialog
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={handleOtpVerify}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;