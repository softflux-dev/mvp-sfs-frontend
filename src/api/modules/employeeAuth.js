import ENDPOINTS from "../endpoints";
import api       from "../index";

export const loginEmployeeApi = (payload) =>
  api(ENDPOINTS.employeeLogin, payload, "post");

export const forgotPasswordEmployeeApi = (payload) =>
  api(ENDPOINTS.employeeForgotPassword, payload, "post");

export const verifyOtpEmployeeApi = (payload) =>
  api(ENDPOINTS.employeeVerifyOtp, payload, "post");

export const resetPasswordEmployeeApi = (payload) =>
  api(ENDPOINTS.employeeResetPassword, payload, "post");