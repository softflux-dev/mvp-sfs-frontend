// src/api/modules/securitySettings.js — 
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getSecuritySettingsApi = () =>
  api(ENDPOINTS.getSecuritySettings, null, "get");

export const updateSecuritySettingsApi = (payload) =>
  api(ENDPOINTS.updateSecuritySettings, payload, "put");

export const changeAdminPasswordApi = (payload) =>
  api(ENDPOINTS.changeAdminPassword, payload, "put");