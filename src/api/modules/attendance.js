// src/api/modules/attendance.js — 
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getAttendanceSummaryApi = (params = {}) => {
  const q = new URLSearchParams();
  if (params.months)     q.set("months",     params.months);
  if (params.department) q.set("department", params.department);
  if (params.employee)   q.set("employee",   params.employee);
  if (params.search)     q.set("search",     params.search);
  const qs = q.toString();
  return api(`${ENDPOINTS.getAttendanceSummary}${qs ? `?${qs}` : ""}`, null, "get");
};

export const getAttendanceDetailApi = (employeeId, month, year) =>
  api(`${ENDPOINTS.getAttendanceDetail}/${employeeId}?month=${month}&year=${year}`, null, "get");

export const updateAttendanceRecordApi = (id, payload) =>
  api(`${ENDPOINTS.updateAttendanceRecord}/${id}`, payload, "patch");

// Create a brand-new record for a date that has none (Manual Entry button)
export const createManualEntryApi = (payload) =>
  api(`${ENDPOINTS.updateAttendanceRecord}/manual-entry`, payload, "post");

export const importAttendanceApi = (payload) =>
  api(ENDPOINTS.importAttendance, payload, "post");

export const getImportHistoryApi = (params = {}) => {
  const q = new URLSearchParams();
  if (params.page)  q.set("page",  params.page);
  if (params.limit) q.set("limit", params.limit);
  const qs = q.toString();
  return api(`${ENDPOINTS.getAttendanceImports}${qs ? `?${qs}` : ""}`, null, "get");
};

export const getPartialRecordsApi = () =>
  api(ENDPOINTS.getAttendancePartial, null, "get");

export const downloadImportFileApi = (id) =>
  api(`${ENDPOINTS.getAttendanceImports}/${id}/download`, null, "get", false, { responseType: "blob" });

export const deleteImportBatchApi = (id) =>
  api(`${ENDPOINTS.getAttendanceImports}/${id}`, null, "delete");