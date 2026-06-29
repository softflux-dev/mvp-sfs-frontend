// src/api/modules/dashboard.js
import api from "../index";

export const getDashboardStatsApi        = ()           => api("admin/dashboard/stats",                null, "get");
export const getRecentActivityApi        = (limit = 20) => api(`admin/dashboard/recent-activity?limit=${limit}`, null, "get");
export const getUpcomingDeadlinesApi     = (limit = 10) => api(`admin/dashboard/upcoming-deadlines?limit=${limit}`, null, "get");
export const getAttendanceOverviewApi    = ()           => api("admin/dashboard/attendance-overview",  null, "get");
export const getProjectProgressApi       = (projectType = "") => api(`admin/dashboard/project-progress${projectType ? `?projectType=${projectType}` : ""}`, null, "get");
export const getEmployeeProductivityApi  = (employeeId = "")  => api(`admin/dashboard/employee-productivity${employeeId ? `?employeeId=${employeeId}` : ""}`, null, "get");