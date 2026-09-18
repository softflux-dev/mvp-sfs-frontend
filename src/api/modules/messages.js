// src/api/modules/messages.js
import api from "../index";

const BASE = "conversations";

// Conversations
export const getConversationsApi     = ()            => api(BASE, null, "get");
export const createConversationApi   = (payload)     => api(BASE, payload, "post");
export const markAsReadApi           = (id)          => api(`${BASE}/${id}/read`, null, "patch");
export const getConversationUsersApi = (search = "") => api(`${BASE}/users${search ? `?search=${search}` : ""}`, null, "get");
export const updateConversationApi   = (id, payload) => api(`${BASE}/${id}`, payload, "patch");
export const deleteConversationApi   = (id)          => api(`${BASE}/${id}`, null, "delete");

// Members
export const addMembersApi   = (id, payload)  => api(`${BASE}/${id}/members`, payload, "post");
export const removeMemberApi = (id, memberId) => api(`${BASE}/${id}/members/${memberId}`, null, "delete");

// Messages
export const getMessagesApi = (conversationId, params = {}) => {
  const q = new URLSearchParams();
  if (params.before) q.set("before", params.before);
  if (params.after)  q.set("after",  params.after);
  if (params.limit)  q.set("limit",  params.limit);
  const qs = q.toString();
  return api(`${BASE}/${conversationId}/messages${qs ? `?${qs}` : ""}`, null, "get");
};
export const sendMessageRestApi   = (id, payload)        => api(`${BASE}/${id}/messages`, payload, "post");
export const editMessageRestApi   = (id, msgId, payload) => api(`${BASE}/${id}/messages/${msgId}`, payload, "patch");
export const deleteMessageRestApi = (id, msgId)          => api(`${BASE}/${id}/messages/${msgId}`, null, "delete");

// Attachments — multipart upload (4th arg true = FormData)
export const uploadAttachmentsApi = (id, formData) =>
  api(`${BASE}/${id}/attachments`, formData, "post", true);

export const getArchivedConversationsApi = ()    => api(`${BASE}/archived`, null, "get");
export const restoreConversationApi      = (id)  => api(`${BASE}/${id}/restore`, null, "patch");
export const clearGroupMessagesApi = (id) => api(`${BASE}/${id}/clear-messages`, null, "delete");

export const makeGroupAdminApi    = (id, memberId) => api(`${BASE}/${id}/members/${memberId}/admin`, null, "patch");
export const removeGroupAdminApi  = (id, memberId) => api(`${BASE}/${id}/members/${memberId}/admin`, null, "delete");
export const transferOwnershipApi = (id, newOwnerId) => api(`${BASE}/${id}/transfer-ownership`, { newOwnerId }, "patch");
