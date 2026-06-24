// src/api/modules/bonusIncrement.js — NEW FILE
import ENDPOINTS from "../endpoints";
import api       from "../index";

// ── Bonus ─────────────────────────────────────────────────────────────────────
export const addBonusApi = (payload) =>
  api(ENDPOINTS.addBonus, payload, "post");

export const getBonusesApi = (params) =>
  api(ENDPOINTS.getBonuses, params, "get");

export const updateBonusApi = (id, payload) =>
  api(`${ENDPOINTS.updateBonus}/${id}`, payload, "put");

export const deleteBonusApi = (id) =>
  api(`${ENDPOINTS.deleteBonus}/${id}`, null, "delete");

// ── Increment ─────────────────────────────────────────────────────────────────
export const addIncrementApi = (payload) =>
  api(ENDPOINTS.addIncrement, payload, "post");

export const getIncrementsApi = (params) =>
  api(ENDPOINTS.getIncrements, params, "get");

export const deleteIncrementApi = (id) =>
  api(`${ENDPOINTS.deleteIncrement}/${id}`, null, "delete");