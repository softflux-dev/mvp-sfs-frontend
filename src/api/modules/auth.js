// src/api/modules/auth.js
import ENDPOINTS from "../endpoints";
import api from "../index";

export const loginUser = (payload) =>
  api(ENDPOINTS.login, payload, "post");

export const checkEmailApi      = (payload) => api(ENDPOINTS.checkEmail,     payload, "post"); 

export const forgotPasswordApi = (payload) =>
  api(ENDPOINTS.forgotPassword, payload, "post");

export const verifyOtpApi = (payload) =>
  api(ENDPOINTS.verifyOtp, payload, "post");

export const resetPasswordApi = (payload) =>
  api(ENDPOINTS.resetPassword, payload, "post");

export const getMe = () =>
  api(ENDPOINTS.getMe, null, "get");