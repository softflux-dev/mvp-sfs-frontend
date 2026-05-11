// src/hooks/auth/index.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
} from "../../api/modules/auth";
import useUserStore from "../../zustand/useUserStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUserData, setAuthEmail, setResetToken, resetToken, authEmail, setResetToken: clearToken, setAuthEmail: clearEmail } = useUserStore();

  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState("");

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await loginUser({
        email:    email.toLowerCase().trim(),
        password,
      });

      if (response?.status === 200 || response?.status === 201) {
        const { token, user } = response.data.data;
        if (token) localStorage.setItem("token", token);
        if (user)  setUserData(user);
        navigate("/");
        return { success: true };
      } else {
        const msg = response?.data?.message || "Invalid email or password.";
        setApiError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password (send OTP) ───────────────────────────────────────────
  const handleForgotPassword = async (email) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await forgotPasswordApi({
        email: email.toLowerCase().trim(),
      });

      if (response?.status === 200 || response?.status === 201) {
        setAuthEmail(email.toLowerCase().trim());
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to send code. Try again.";
        setApiError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await verifyOtpApi({
        email: authEmail,
        otp,
      });

      if (response?.status === 200 || response?.status === 201) {
        const { resetToken } = response.data.data;
        setResetToken(resetToken);
        navigate("/reset-password");
        return { success: true };
      } else {
        const msg = response?.data?.message || "Invalid or expired OTP.";
        setApiError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ───────────────────────────────────────────────────────
  const handleResetPassword = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await resetPasswordApi({
        resetToken,
        newPassword,
        confirmPassword,
      });

      if (response?.status === 200 || response?.status === 201) {
        clearToken("");
        clearEmail("");
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to reset password.";
        setApiError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setApiError("");

  return {
    loading,
    apiError,
    clearError,
    handleLogin,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
  };
};