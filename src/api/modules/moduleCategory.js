import ENDPOINTS from "../endpoints";
import api       from "../index";

const base = (projectId, role = "admin") =>
  role === "pm" ? `pm/projects/${projectId}/module-categories` : `${ENDPOINTS.getModules}/${projectId}/module-categories`;

export const getModuleCategoriesApi    = (projectId, role) => api(base(projectId, role), null, "get");
export const createModuleCategoryApi   = (projectId, payload, role) => api(base(projectId, role), payload, "post");
export const updateModuleCategoryApi   = (projectId, id, payload, role) => api(`${base(projectId, role)}/${id}`, payload, "put");
export const deleteModuleCategoryApi   = (projectId, id, role) => api(`${base(projectId, role)}/${id}`, null, "delete");