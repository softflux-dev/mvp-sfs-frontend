// src/api/modules/companySettings.js — NEW FILE
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getCompanyProfileApi = () =>
  api(ENDPOINTS.getCompanyProfile, null, "get");

// payload is a FormData instance (since logo upload is multipart)
export const updateCompanyProfileApi = (payload) =>
  api(ENDPOINTS.updateCompanyProfile, payload, "put", true);