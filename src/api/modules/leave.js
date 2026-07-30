// src/api/modules/leave.js — Phases 2/3 (Leave Management Enhancement)
import ENDPOINTS from "../endpoints";
import api       from "../index";

// ── Employee ──────────────────────────────────────────────────────────────────
export const empGetMyLeavesApi = (params) => api(ENDPOINTS.empGetMyLeaves, params, "get");
export const empCreateLeaveApi = (payload) => api(ENDPOINTS.empGetMyLeaves, payload, "post");
export const empCancelLeaveApi = (leaveId) => api(`${ENDPOINTS.empGetMyLeaves}/${leaveId}`, null, "delete");
export const empGetMyLeaveBalanceApi = () => api(`${ENDPOINTS.empGetMyLeaves}/balance`, null, "get");

// ── HR ────────────────────────────────────────────────────────────────────────
export const hrGetLeavesApi = (params) => api(ENDPOINTS.hrGetLeaves, params, "get");
export const hrGetEmployeeLeaveBalanceApi = (employeeId) => api(`${ENDPOINTS.hrGetLeaves}/${employeeId}/balance`, null, "get");
export const hrReviewLeaveApi = (leaveId, payload) => api(`${ENDPOINTS.hrReviewLeave}/${leaveId}`, payload, "patch");

// — live preview before confirming a decision (no persistence).
export const hrGetLeavePreviewApi = (leaveId, payload) => api(`${ENDPOINTS.hrGetLeaves}/${leaveId}/preview`, payload, "post");

// — HR nudges Admin about an escalated (locked) request. 24h cooldown enforced server-side.
export const hrSendReminderApi = (leaveId, payload) => api(`${ENDPOINTS.hrGetLeaves}/${leaveId}/remind`, payload, "post");

// ── Admin escalation queue ────────────────────────────────────────────────────
export const adminGetEscalatedLeavesApi = (params) => api(ENDPOINTS.adminGetEscalatedLeaves, params, "get");
export const adminReviewEscalationApi = (leaveId, payload) => api(`${ENDPOINTS.adminReviewEscalation}/${leaveId}/escalation`, payload, "patch");

// — HR company-wide leave balance dashboard (Phase 5).
export const hrGetAllBalancesApi = (params) => api(ENDPOINTS.hrGetAllBalances, params, "get");