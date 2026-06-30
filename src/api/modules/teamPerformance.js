// src/api/modules/teamPerformance.js — 
import api from "../index";

export const getTeamPerformanceApi = (projectId = "") =>
  api(`pm/team-performance${projectId ? `?projectId=${projectId}` : ""}`, null, "get");

export const getPMProjectListApi = () =>
  api("pm/team-performance/projects", null, "get");