import ENDPOINTS from "../endpoints";
import api       from "../index";

const base = (projectId, role = "admin") =>
  role === "pm" ? `pm/projects/${projectId}/modules` : `${ENDPOINTS.getModules}/${projectId}/modules`;

export const getModulesApi   = (projectId, role) => api(base(projectId, role), null, "get");
export const createModuleApi = (projectId, payload, role) => api(base(projectId, role), payload, "post");
export const updateModuleApi = (projectId, moduleId, payload, role) => api(`${base(projectId, role)}/${moduleId}`, payload, "put");
export const deleteModuleApi = (projectId, moduleId, role) => api(`${base(projectId, role)}/${moduleId}`, null, "delete");