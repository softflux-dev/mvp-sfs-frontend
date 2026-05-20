import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getModulesApi = (projectId) =>
  api(`${ENDPOINTS.getModules}/${projectId}/modules`, null, "get");

export const createModuleApi = (projectId, payload) =>
  api(`${ENDPOINTS.createModule}/${projectId}/modules`, payload, "post");

export const updateModuleApi = (projectId, moduleId, payload) =>
  api(`${ENDPOINTS.updateModule}/${projectId}/modules/${moduleId}`, payload, "put");

export const deleteModuleApi = (projectId, moduleId) =>
  api(`${ENDPOINTS.deleteModule}/${projectId}/modules/${moduleId}`, null, "delete");