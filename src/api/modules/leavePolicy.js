// src/api/modules/leavePolicy.js — NEW FILE
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getLeavePolicyApi = () =>
  api(ENDPOINTS.getLeavePolicy, null, "get");

export const updateLeavePolicyApi = (payload) =>
  api(ENDPOINTS.updateLeavePolicy, payload, "put");