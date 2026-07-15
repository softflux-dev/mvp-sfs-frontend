import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getSharedDocumentsApi = (params) =>
  api(ENDPOINTS.getSharedDocuments, params, "get");

export const uploadSharedDocumentApi = (payload) =>
  api(ENDPOINTS.uploadSharedDocument, payload, "post");

export const deleteSharedDocumentApi = (id) =>
  api(`${ENDPOINTS.deleteSharedDocument}/${id}`, null, "delete");

export const downloadSharedDocumentApi = (id) =>
  api(
    `${ENDPOINTS.downloadSharedDocument}/${id}/download`,
    null,
    "get",
    false,
    { responseType: "blob" }
  );