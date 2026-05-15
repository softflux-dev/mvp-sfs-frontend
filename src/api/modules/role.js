import ENDPOINTS from "../endpoints";
import api from "../index";

export const getRolesApi = (params) =>
  api(ENDPOINTS.getRoles, params, "get");

export const getRoleByIdApi = (id) =>
  api(`${ENDPOINTS.getRoleById}/${id}`, null, "get");

export const createRoleApi = (payload) =>
  api(ENDPOINTS.createRole, payload, "post");

export const updateRoleApi = (id, payload) =>
  api(`${ENDPOINTS.updateRole}/${id}`, payload, "put");

export const deleteRoleApi = (id) =>
  api(`${ENDPOINTS.deleteRole}/${id}`, null, "delete");