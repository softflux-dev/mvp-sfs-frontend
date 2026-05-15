import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getProjectTypesApi = () =>
  api(ENDPOINTS.getProjectTypes, null, "get");

export const createProjectTypeApi = (payload) =>
  api(ENDPOINTS.createProjectType, payload, "post");

export const updateProjectTypeApi = (id, payload) =>
  api(`${ENDPOINTS.updateProjectType}/${id}`, payload, "put");

export const deleteProjectTypeApi = (id) =>
  api(`${ENDPOINTS.deleteProjectType}/${id}`, null, "delete");