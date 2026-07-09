// src/api/modules/leave.js — 
import ENDPOINTS from "../endpoints";
import api       from "../index";

// ── Employee ──────────────────────────────────────────────────────────────────
export const empGetMyLeavesApi = (params) =>
  api(ENDPOINTS.empGetMyLeaves, params, "get");

export const empCreateLeaveApi = (payload) =>
  api(ENDPOINTS.empGetMyLeaves, payload, "post");

export const empCancelLeaveApi = (leaveId) =>
  api(`${ENDPOINTS.empGetMyLeaves}/${leaveId}`, null, "delete");

// ── HR ────────────────────────────────────────────────────────────────────────
export const hrGetLeavesApi = (params) =>
  api(ENDPOINTS.hrGetLeaves, params, "get");

// employeeId here is the leave's employee._id (MongoDB ObjectId), NOT empId
export const hrGetEmployeeLeaveBalanceApi = (employeeId) =>
  api(`${ENDPOINTS.hrGetLeaves}/${employeeId}/balance`, null, "get");

export const hrReviewLeaveApi = (leaveId, payload) =>
  api(`${ENDPOINTS.hrReviewLeave}/${leaveId}`, payload, "patch");