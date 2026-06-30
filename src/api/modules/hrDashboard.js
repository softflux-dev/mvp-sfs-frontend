// src/api/modules/hrDashboard.js — 
import api from "../index";

export const getHRDashboardStatsApi      = ()           => api("hr/dashboard/stats",               null, "get");
export const getHRAttendanceOverviewApi  = ()           => api("hr/dashboard/attendance-overview",  null, "get");
export const getRecentLeavesApi          = (limit = 10) => api(`hr/dashboard/recent-leaves?limit=${limit}`, null, "get");
export const getPreviousPayrollApi       = ()           => api("hr/dashboard/previous-payroll",     null, "get");