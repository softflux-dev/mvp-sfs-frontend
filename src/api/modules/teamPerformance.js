// src/api/modules/teamPerformance.js —
import api           from "../index";
import useUserStore  from "../../zustand/useUserStore";

export const getTeamPerformanceApi = (projectId = "") => {
  const role = useUserStore.getState()?.user?.role;
  const base = role === "ADMIN" ? "admin/team-performance" : "pm/team-performance";
  return api(`${base}${projectId ? `?projectId=${projectId}` : ""}`, null, "get");
};

export const getPMProjectListApi = () => {
  const role = useUserStore.getState()?.user?.role;
  const base = role === "ADMIN" ? "admin/team-performance" : "pm/team-performance";
  return api(`${base}/projects`, null, "get");
};