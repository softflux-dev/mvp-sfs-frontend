// src/api/modules/empDashboard.js — 
import api from "../index";

export const getEmpDashboardStatsApi      = ()           => api("employee/dashboard/stats",               null, "get");
export const getEmpAttendanceSummaryApi   = ()           => api("employee/dashboard/attendance",           null, "get");
export const getEmpUpcomingTasksApi       = (limit = 10) => api(`employee/dashboard/upcoming-tasks?limit=${limit}`, null, "get");
export const getEmpMonthlyPerformanceApi  = ()           => api("employee/dashboard/monthly-performance",  null, "get");