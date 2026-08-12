import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getModuleCategoriesApi = (projectId) =>
  api(`${ENDPOINTS.getModules}/${projectId}/module-categories`, null, "get");

export const createModuleCategoryApi = (projectId, payload) =>
  api(`${ENDPOINTS.createModule}/${projectId}/module-categories`, payload, "post");

export const updateModuleCategoryApi = (projectId, id, payload) =>
  api(`${ENDPOINTS.updateModule}/${projectId}/module-categories/${id}`, payload, "put");

export const deleteModuleCategoryApi = (projectId, id) =>
  api(`${ENDPOINTS.deleteModule}/${projectId}/module-categories/${id}`, null, "delete");