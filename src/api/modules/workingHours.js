// src/api/modules/workingHours.js — NEW FILE
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getWorkingHoursApi = () =>
  api(ENDPOINTS.getWorkingHours, null, "get");

export const updateWorkingHoursApi = (payload) =>
  api(ENDPOINTS.updateWorkingHours, payload, "put");