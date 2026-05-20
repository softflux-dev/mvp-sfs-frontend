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

// First route for each role after login
const ROLE_HOME = {
  ADMIN:           "/",
  HR:              "/hr-dashboard",
  PROJECT_MANAGER: "/dashboard",
  EMPLOYEE:        "/employee-dashboard",
};

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    setUserData,
    setAuthEmail,
    setResetToken,
    resetToken,
    authEmail,
  } = useUserStore();

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");



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

      // Decode role from JWT — most reliable source
      // Employee.role is an ObjectId ref, NOT a string like "EMPLOYEE"
      // The JWT always has the correct string role set by the backend
      let jwtRole = "EMPLOYEE";
      try {
      const base64  = token.split(".")[1];
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      jwtRole = JSON.parse(atob(base64 + padding)).role || "EMPLOYEE";
    } catch (e) {}

      const rolePages = user?.role?.pages || [];

    
     const loggedInUser = {
        ...(user || {}),
        role:      jwtRole,   
        rolePages,            
      };
      setUserData(loggedInUser);

      const home = ROLE_HOME[jwtRole] || "/";
      navigate(home, { replace: true });

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

  // ── Forgot Password ───────────────────────────────────────────────────────
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

  // ── Verify OTP ───────────────────────────────────────────────────────────
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

  // ── Reset Password ───────────────────────────────────────────────────────
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
    loading,
    apiError,
    clearError,
    handleLogin,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
  };
};