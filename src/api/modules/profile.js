import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getProfileApi = () =>
  api(ENDPOINTS.getProfile, null, "get");

export const updateProfileApi = (payload) =>
  api(ENDPOINTS.updateProfile, payload, "put");

export const changePasswordApi = (payload) =>
  api(ENDPOINTS.changePassword, payload, "patch");