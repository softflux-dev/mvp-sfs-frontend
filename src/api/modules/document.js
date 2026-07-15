import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getEmployeeDocumentsApi = (employeeId) =>
  api(`${ENDPOINTS.getEmployeeDocuments}/${employeeId}/documents`, null, "get");

export const uploadEmployeeDocumentApi = (employeeId, payload) =>
  api(`${ENDPOINTS.uploadEmployeeDocument}/${employeeId}/documents`, payload, "post");

export const deleteEmployeeDocumentApi = (employeeId, documentId) =>
  api(`${ENDPOINTS.deleteEmployeeDocument}/${employeeId}/documents/${documentId}`, null, "delete");

export const downloadEmployeeDocumentApi = (employeeId, documentId) =>
  api(`${ENDPOINTS.downloadEmployeeDocument}/${employeeId}/documents/${documentId}/download`, null, "get");