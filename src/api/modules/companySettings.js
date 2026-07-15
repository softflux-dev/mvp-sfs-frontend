// src/api/modules/companySettings.js — 
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getCompanyProfileApi = () =>
  api(ENDPOINTS.getCompanyProfile, null, "get");

export const updateCompanyProfileApi = (payload) =>
  api(ENDPOINTS.updateCompanyProfile, payload, "put");