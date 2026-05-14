import ENDPOINTS from "../endpoints";
import api from "../index";

export const getDepartmentsApi = (params) =>
  api(ENDPOINTS.getDepartments, params, "get");

export const getDepartmentByIdApi = (id) =>
  api(`${ENDPOINTS.getDepartmentById}/${id}`, null, "get");

export const createDepartmentApi = (payload) =>
  api(ENDPOINTS.createDepartment, payload, "post");

export const updateDepartmentApi = (id, payload) =>
  api(`${ENDPOINTS.updateDepartment}/${id}`, payload, "put");

export const deleteDepartmentApi = (id) =>
  api(`${ENDPOINTS.deleteDepartment}/${id}`, null, "delete");