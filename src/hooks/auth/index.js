// src/hooks/auth/index.js — 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  checkEmailApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
} from "../../api/modules/auth";
import useUserStore from "../../zustand/useUserStore";
import { getSecuritySettingsApi } from "../../api/modules/securitySettings";

const ROLE_HOME = {
  ADMIN:          "/admin-dashboard",
  HR:              "/hr-dashboard",
  PROJECT_MANAGER: "/dashboard",
  EMPLOYEE:        "/employee-dashboard",
};

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUserData, setAuthEmail, setResetToken, resetToken, authEmail } = useUserStore();

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await loginUser({ email: email.toLowerCase().trim(), password });
      if (response?.status === 200 || response?.status === 201) {
        const { token, user } = response.data.data;
        if (token) localStorage.setItem("token", token);

        try {
          const secRes = await getSecuritySettingsApi();
          if (secRes?.status === 200 || secRes?.status === 201) {
            localStorage.setItem("sessionTimeout", secRes.data.data.settings.sessionTimeout || "30min");
          }
        } catch { /* non-fatal */ }

        let jwtRole = "EMPLOYEE";
        try {
          const base64  = token.split(".")[1];
          const padding = "=".repeat((4 - (base64.length % 4)) % 4);
          jwtRole = JSON.parse(atob(base64 + padding)).role || "EMPLOYEE";
        } catch (e) {}

        const rolePages   = user?.rolePages || user?.role?.pages || [];
        const loggedInUser = { ...(user || {}), role: jwtRole, rolePages };
        setUserData(loggedInUser);

        const home = ROLE_HOME[jwtRole] || "/admin-dashboard";
        navigate(home, { replace: true });
        return { success: true };
      }
      const msg = response?.data?.message || "Invalid email or password.";
      setApiError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Check email exists (no OTP sent) ─────────────────────────────────────
  const handleCheckEmail = async (email) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await checkEmailApi({ email: email.toLowerCase().trim() });
      if (response?.status === 200 || response?.status === 201) {
        return { success: true };
      }
      const msg = response?.data?.message || "This email is not registered.";
      setApiError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password (sends OTP) ───────────────────────────────────────────
  const handleForgotPassword = async (email) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await forgotPasswordApi({ email: email.toLowerCase().trim() });
      if (response?.status === 200 || response?.status === 201) {
        setAuthEmail(email.toLowerCase().trim());
        return { success: true };
      }
      const msg = response?.data?.message || "Failed to send code. Try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await verifyOtpApi({ email: authEmail, otp });
      if (response?.status === 200 || response?.status === 201) {
        const { resetToken: token } = response.data.data;
        setResetToken(token);
        navigate("/reset-password");
        return { success: true };
      }
      const msg = response?.data?.message || "Invalid or expired OTP.";
      setApiError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong. Please try again.";
      setApiError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ────────────────────────────────────────────────────────
  const handleResetPassword = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await resetPasswordApi({ resetToken, newPassword, confirmPassword });
      if (response?.status === 200 || response?.status === 201) {
        setResetToken("");
        setAuthEmail("");
        return { success: true };
      }
      const msg = response?.data?.message || "Failed to reset password.";
      setApiError(msg);
      return { success: false, message: msg };
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
    loading, apiError, clearError,
    handleLogin, handleCheckEmail,
    handleForgotPassword, handleVerifyOtp, handleResetPassword,
  };
};