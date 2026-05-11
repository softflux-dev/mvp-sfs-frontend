// app/auth/login/index.jsx
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
  const { loading, apiError, clearError, handleLogin } = useAuth();

  const [form,       setForm]       = useState({ email: "", password: "" });
  const [errors,     setErrors]     = useState({});
  const [keepSigned, setKeepSigned] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "You have entered an invalid email";
    if (!form.password)
      e.password = "You have entered an invalid password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
    if (!validate()) return;
    await handleLogin({ email: form.email, password: form.password });
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
          onClick={() => navigate("/forgot-password")}
          sx={{ color: "#030229", textDecoration: "underline",
                fontFamily: '"Poppins", sans-serif', cursor: "pointer" }}
        >
          Forgot Password?
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