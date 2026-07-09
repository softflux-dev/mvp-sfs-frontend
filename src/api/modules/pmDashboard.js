// src/api/modules/pmDashboard.js — 
import api from "../index";

export const getPMDashboardStatsApi     = ()           => api("pm/dashboard/stats",              null, "get");
export const getPMProjectsApi           = (limit = 10) => api(`pm/dashboard/my-projects?limit=${limit}`, null, "get");
export const getPMUpcomingDeadlinesApi  = (limit = 10) => api(`pm/dashboard/upcoming-deadlines?limit=${limit}`, null, "get");
export const getPMTeamWorkloadApi       = (projectId = "") => api(`pm/dashboard/team-workload${projectId ? `?projectId=${projectId}` : ""}`, null, "get");