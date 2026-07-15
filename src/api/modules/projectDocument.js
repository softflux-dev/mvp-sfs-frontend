import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getProjectDocumentsApi = (projectId) =>
  api(`${ENDPOINTS.getProjectDocuments}/${projectId}/documents`, null, "get");

export const uploadProjectDocumentApi = (projectId, payload) =>
  api(`${ENDPOINTS.uploadProjectDocument}/${projectId}/documents`, payload, "post");

export const deleteProjectDocumentApi = (projectId, documentId) =>
  api(`${ENDPOINTS.deleteProjectDocument}/${projectId}/documents/${documentId}`, null, "delete");

export const downloadProjectDocumentApi = (projectId, documentId) =>
  api(`${ENDPOINTS.downloadProjectDocument}/${projectId}/documents/${documentId}/download`, null, "get");