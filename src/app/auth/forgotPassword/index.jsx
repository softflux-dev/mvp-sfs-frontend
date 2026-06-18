// app/auth/forgotPassword/index.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import { Box, Typography }     from "@mui/material";
import { useLocation }         from "react-router-dom";

import CustomInputLabel from "../../../components/customInputLabel";
import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import AuthLayout       from "../../../components/authLayout";
import OtpDialog        from "../login/otpDialog";
import { useAuth }      from "../../../hooks/auth";          // ← hook
import useUserStore     from "../../../zustand/useUserStore";

const ForgotPasswordPage = () => {
  const location = useLocation();
  const { authEmail } = useUserStore();
  const {
    loading, apiError, clearError,
    handleForgotPassword, handleVerifyOtp,
  } = useAuth();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // ── Arrived here from the Login page's "Forgot Password?" link ───────────
  // That flow already validated the email, confirmed it's registered, AND
  // sent the OTP — so we skip straight to the OTP dialog instead of asking
  // the user to enter their email a second time.
  useEffect(() => {
    if (location.state?.skipEmailStep) {
      setShowOtp(true);
    }
  }, [location.state]);

  const onSend = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("You have entered an invalid email.");
      return;
    }

    setError("");
    const result = await handleForgotPassword(trimmedEmail);
    if (result.success) setShowOtp(true);
  };

  // ── Resend — used by OtpDialog's "Resend Code" action ────────────────────
  // When we arrived via skipEmailStep, the local `email` state was never
  // populated (the field never rendered), so resending must re-send to
  // authEmail (already set in the store by the login page's earlier call)
  // instead of the empty local state.
  const onResend = async () => {
    if (location.state?.skipEmailStep) {
      await handleForgotPassword(authEmail);
    } else {
      await onSend();
    }
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

      {/* Only show the email field if the user landed here directly
          (e.g. typed the URL) rather than via the validated login flow */}
      {!location.state?.skipEmailStep && (
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
      )}

      {!location.state?.skipEmailStep && (
        <CustomButton
          btnLabel={loading ? "Sending..." : "Send Code"}
          variant="authbutton"
          handlePressBtn={onSend}
          fullWidth sx={{ width: "100%" }}
        />
      )}

      <OtpDialog
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={onVerify}
        apiError={apiError}
        loading={loading}
        onResend={onResend}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;