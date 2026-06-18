// src/api/modules/holiday.js — NEW FILE
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getHolidaysApi = (params = {}) => {
  const q = new URLSearchParams();
  if (params.page)    q.set("page",    params.page);
  if (params.limit)   q.set("limit",   params.limit);
  if (params.search)  q.set("search",  params.search);
  if (params.type)    q.set("type",    params.type);
  if (params.payType) q.set("payType", params.payType);
  if (params.year)    q.set("year",    params.year);
  const qs = q.toString();
  return api(`${ENDPOINTS.getHolidays}${qs ? `?${qs}` : ""}`, null, "get");
};

export const createHolidayApi = (payload) =>
  api(ENDPOINTS.getHolidays, payload, "post");

export const updateHolidayApi = (id, payload) =>
  api(`${ENDPOINTS.getHolidays}/${id}`, payload, "put");

export const deleteHolidayApi = (id) =>
  api(`${ENDPOINTS.getHolidays}/${id}`, null, "delete");