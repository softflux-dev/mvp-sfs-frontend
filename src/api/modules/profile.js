import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getProfileApi = () =>
  api(ENDPOINTS.getProfile, null, "get");

export const updateProfileApi = (formData) =>
  api(ENDPOINTS.updateProfile, formData, "put", true);   // true = multipart

export const changePasswordApi = (payload) =>
  api(ENDPOINTS.changePassword, payload, "patch");