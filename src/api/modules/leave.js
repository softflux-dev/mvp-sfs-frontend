// src/api/modules/leave.js
import ENDPOINTS from "../endpoints";
import api       from "../index";

// ── Employee: own leave requests ──────────────────────────────────────────────
export const empGetMyLeavesApi = (params) =>
  api(ENDPOINTS.empGetMyLeaves, params, "get");

export const empCreateLeaveApi = (payload) =>
  api(ENDPOINTS.empGetMyLeaves, payload, "post");

export const empCancelLeaveApi = (leaveId) =>
  api(`${ENDPOINTS.empGetMyLeaves}/${leaveId}`, null, "delete");

// ── HR: all leave requests ────────────────────────────────────────────────────
export const hrGetLeavesApi = (params) =>
  api(ENDPOINTS.hrGetLeaves, params, "get");

export const hrReviewLeaveApi = (leaveId, payload) =>
  api(`${ENDPOINTS.hrReviewLeave}/${leaveId}`, payload, "patch");