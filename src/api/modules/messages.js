// src/api/modules/messages.js
import api from "../index";

const BASE = "conversations";

// ── Conversations ─────────────────────────────────────────────────────────────
export const getConversationsApi = () =>
  api(BASE, null, "get");

export const createConversationApi = (payload) =>
  api(BASE, payload, "post");

export const markAsReadApi = (conversationId) =>
  api(`${BASE}/${conversationId}/read`, null, "patch");

export const getConversationUsersApi = (search = "") =>
  api(`${BASE}/users${search ? `?search=${search}` : ""}`, null, "get");

// ── Messages ──────────────────────────────────────────────────────────────────
export const getMessagesApi = (conversationId, params = {}) => {
  const query = new URLSearchParams();
  if (params.before) query.set("before", params.before);
  if (params.after)  query.set("after",  params.after);
  if (params.limit)  query.set("limit",  params.limit);
  const qs = query.toString();
  return api(`${BASE}/${conversationId}/messages${qs ? `?${qs}` : ""}`, null, "get");
};

// REST fallback — used when socket is unavailable
export const sendMessageRestApi = (conversationId, payload) =>
  api(`${BASE}/${conversationId}/messages`, payload, "post");