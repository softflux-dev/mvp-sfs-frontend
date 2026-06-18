// app/auth/login/index.jsx — FULL REPLACEMENT
import { useState } from "react";
import {
  Box, Typography, Checkbox, FormControlLabel,
  Link, CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomInputLabel from "../../../components/customInputLabel";
import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import AuthLayout       from "../../../components/authLayout";
import { useAuth }      from "../../../hooks/auth";          // ← hook

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    loading, apiError, clearError,
    handleLogin, handleForgotPassword,
  } = useAuth();

  const [form,       setForm]       = useState({ email: "", password: "" });
  const [errors,     setErrors]     = useState({});
  const [keepSigned, setKeepSigned] = useState(false);
  const [fpLoading,  setFpLoading]  = useState(false);   // separate loading state for the forgot-password check

  const validate = () => {
    const e = {};
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      e.email = "Please enter your email address first.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      e.email = "You have entered an invalid email.";
    }

    if (!form.password) {
      e.password = "Please enter your password.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
    if (!validate()) return;
    await handleLogin({ email: form.email.trim(), password: form.password });
  };

  // ── "Forgot Password?" click — reuses the SAME email field on this page ───
  // 1. Must have something typed in the email field first.
  // 2. Must be a valid email format.
  // 3. We check with the backend whether this email is actually registered
  //    (this also sends the OTP if it is). Only on success do we navigate
  //    to /forgot-password — carrying the email forward so that page can
  //    skip straight to the OTP step instead of asking for the email again.
  const onForgotPasswordClick = async () => {
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      setErrors((p) => ({ ...p, email: "Please enter your email address first." }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors((p) => ({ ...p, email: "You have entered an invalid email." }));
      return;
    }

    setErrors((p) => ({ ...p, email: "" }));
    if (apiError) clearError();

    setFpLoading(true);
    const result = await handleForgotPassword(trimmedEmail);
    setFpLoading(false);

    if (result.success) {
      // Email is registered + OTP already sent — go straight to OTP step.
      navigate("/forgot-password", { state: { skipEmailStep: true } });
    }
    // On failure, handleForgotPassword already sets apiError (e.g.
    // "This email is not registered.") — shown via the existing apiError
    // banner on THIS page. No navigation happens.
  };

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
        Welcome Back!
      </Typography>
      <Typography fontSize="14px" color="text.secondary" mb={4}>
        Sign In To Your Account To Continue
      </Typography>

      {apiError && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{apiError}</Typography>
        </Box>
      )}

      <Box mb={2}>
        <CustomInputLabel label="Email Address" />
        <TextInput
          placeholder="Enter Your Email Address"
          value={form.email}
          onChange={(e) => {
            setForm((p) => ({ ...p, email: e.target.value }));
            if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            if (apiError)     clearError();
          }}
          inputBgColor="#F5F5F5" fullWidth type="email"
          error={!!errors.email} helperText={errors.email}
        />
      </Box>

      <Box mb={1}>
        <CustomInputLabel label="Password" />
        <TextInput
          placeholder="Enter Your Password"
          value={form.password}
          onChange={(e) => {
            setForm((p) => ({ ...p, password: e.target.value }));
            if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            if (apiError)        clearError();
          }}
          inputBgColor="#F5F5F5" fullWidth type="password" showPassIcon
          error={!!errors.password} helperText={errors.password}
        />
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <FormControlLabel
          control={
            <Checkbox size="small" checked={keepSigned}
              onChange={(e) => setKeepSigned(e.target.checked)}
              sx={{ color: "#E0E0E0", "&.Mui-checked": { color: "#AA2493" } }}
            />
          }
          label={<Typography fontSize="13px" color="text.secondary">Keep me signed in</Typography>}
        />
        <Link component="button" fontSize="13px" fontWeight={500}
          onClick={onForgotPasswordClick}
          disabled={fpLoading}
          sx={{ color: "#030229", textDecoration: "underline",
                fontFamily: '"Poppins", sans-serif', cursor: fpLoading ? "default" : "pointer",
                opacity: fpLoading ? 0.6 : 1 }}
        >
          {fpLoading ? "Checking..." : "Forgot Password?"}
        </Link>
      </Box>

      <CustomButton
        btnLabel={loading
          ? <CircularProgress size={20} sx={{ color: "#fff" }} />
          : "Login"
        }
        variant="authbutton"
        handlePressBtn={onLogin}
        fullWidth sx={{ width: "100%" }}
      />
    </AuthLayout>
  );
};

export default LoginPage;