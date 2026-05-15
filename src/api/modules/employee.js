import ENDPOINTS from "../endpoints";
import api from "../index";

export const getEmployeesApi = (params) =>
  api(ENDPOINTS.getEmployees, params, "get");

export const getEmployeeByIdApi = (id) =>
  api(`${ENDPOINTS.getEmployeeById}/${id}`, null, "get");

export const createEmployeeApi = (payload) =>
  api(ENDPOINTS.createEmployee, payload, "post", true);  

export const updateEmployeeApi = (id, payload) =>
  api(`${ENDPOINTS.updateEmployee}/${id}`, payload, "put", true);

export const deleteEmployeeApi = (id) =>
  api(`${ENDPOINTS.deleteEmployee}/${id}`, null, "delete");

export const toggleEmployeeStatusApi = (id) =>
  api(`${ENDPOINTS.toggleEmployeeStatus}/${id}/status`, null, "patch");