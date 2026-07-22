// src/api/modules/companySettings.js
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getCompanyProfileApi = () =>
  api(ENDPOINTS.getCompanyProfile, null, "get");

export const updateCompanyProfileApi = (payload) =>
  api(ENDPOINTS.updateCompanyProfile, payload, "put");

// ── Currency ──────────────────────────────────────────────────────────────
export const getCurrenciesApi = () =>
  api(ENDPOINTS.getCurrencies, null, "get");

export const getActiveCurrencyApi = () =>
  api(ENDPOINTS.getActiveCurrency, null, "get");

// ── Phone / countries ─────────────────────────────────────────────────────
export const getCountriesApi = () =>
  api(ENDPOINTS.getCountries, null, "get");

export const getPhoneConfigApi = () =>
  api(ENDPOINTS.getPhoneConfig, null, "get");