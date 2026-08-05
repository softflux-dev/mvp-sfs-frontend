import ENDPOINTS from "../endpoints";
import api from "../index";

export const getEmployeesApi = (params) =>
  api(ENDPOINTS.getEmployees, params, "get");

export const getEmployeeByIdApi = (id) =>
  api(`${ENDPOINTS.getEmployeeById}/${id}`, null, "get");

export const createEmployeeApi = (payload) =>
  api(ENDPOINTS.createEmployee, payload, "post");

export const updateEmployeeApi = (id, payload) =>
  api(`${ENDPOINTS.updateEmployee}/${id}`, payload, "put");

export const deleteEmployeeApi = (id) =>
  api(`${ENDPOINTS.deleteEmployee}/${id}`, null, "delete");

export const toggleEmployeeStatusApi = (id) =>
  api(`${ENDPOINTS.toggleEmployeeStatus}/${id}/status`, null, "patch");


// GET /api/admin/employees/:id/deactivation-impact
export const getDeactivationImpactApi = (employeeId) =>
  api(`${ENDPOINTS.getDeactivationImpact}/${employeeId}/deactivation-impact`, null, "get");
 
// GET /api/admin/employees/reassignment-candidates?roleId=&departmentId=&excludeId=
export const getReassignmentCandidatesApi = (params) =>
  api(ENDPOINTS.getReassignmentCandidates, params, "get");
 
// POST /api/admin/employees/:id/reassign-and-deactivate
// payload: { reassignments: [{ itemType, itemId, newOwnerId }], reason }
export const reassignAndDeactivateApi = (employeeId, payload) =>
  api(`${ENDPOINTS.reassignAndDeactivate}/${employeeId}/reassign-and-deactivate`, payload, "post");
 
// POST /api/admin/employees/:id/reactivate
// payload: { role?, department? }
export const reactivateEmployeeApi = (employeeId, payload) =>
  api(`${ENDPOINTS.reactivateEmployee}/${employeeId}/reactivate`, payload, "post");

// GET /api/admin/employees/:id/account-history
export const getEmployeeAccountHistoryApi = (employeeId) =>
  api(`${ENDPOINTS.getAccountHistory}/${employeeId}/account-history`, null, "get");