// src/hooks/messages.js — FULL REPLACEMENT
import { useState, useCallback, useEffect, useRef } from "react";
import {
  getConversationsApi, getMessagesApi, markAsReadApi,
  sendMessageRestApi, getConversationUsersApi,
  editMessageRestApi, deleteMessageRestApi,
  updateConversationApi, deleteConversationApi,
  removeMemberApi, uploadAttachmentsApi,
} from "../../api/modules/messages";
import { getSocket, emitWithAck } from "../../utils/socketManager";

// ── useConversations ──────────────────────────────────────────────────────────
export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversationsApi();
      if (res?.status === 200 || res?.status === 201) {
        setConversations(res.data.data.conversations || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const updateConversation = useCallback((id, updates) => {
    setConversations((prev) => prev.map((c) => c._id === id ? { ...c, ...updates } : c));
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const bumpConversationToTop = useCallback((id, lastMessage) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c._id === id);
      if (idx === -1) return prev;
      const conv = { ...prev[idx], lastMessage, updatedAt: new Date().toISOString() };
      return [conv, ...prev.filter((c) => c._id !== id)];
    });
  }, []);

  const incrementUnread = useCallback((id) => {
    setConversations((prev) => prev.map((c) => c._id === id ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c));
  }, []);

  const resetUnread = useCallback((id) => {
    setConversations((prev) => prev.map((c) => c._id === id ? { ...c, unreadCount: 0 } : c));
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  return {
    conversations, loading, fetchConversations,
    updateConversation, removeConversation,
    bumpConversationToTop, incrementUnread, resetUnread,
  };
};

// ── useMessages ───────────────────────────────────────────────────────────────
export const useMessages = (conversationId, currentUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);
  const [hasMore,  setHasMore]  = useState(true);
  const lastMessageId = useRef(null);

  const markOwn = useCallback((msgs) =>
    msgs.map((m) => ({
      ...m,
      isOwn: String(m.sender?._id || m.sender) === String(currentUserId),
    })), [currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setMessages([]);
    setHasMore(true);
    try {
      const res = await getMessagesApi(conversationId, { limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        const msgs = markOwn(res.data.data.messages || []);
        setMessages(msgs);
        setHasMore(msgs.length === 50);
        if (msgs.length > 0) lastMessageId.current = msgs[msgs.length - 1]._id;
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [conversationId, markOwn]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || !messages[0]) return;
    try {
      const res = await getMessagesApi(conversationId, { before: messages[0]._id, limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        const older = markOwn(res.data.data.messages || []);
        setMessages((prev) => [...older, ...prev]);
        setHasMore(older.length === 50);
      }
    } catch { /* silent */ }
  }, [conversationId, hasMore, messages, markOwn]);

  const fetchMissed = useCallback(async () => {
    if (!conversationId || !lastMessageId.current) return;
    try {
      const res = await getMessagesApi(conversationId, { after: lastMessageId.current, limit: 100 });
      if (res?.status === 200 || res?.status === 201) {
        const missed = markOwn(res.data.data.messages || []);
        if (missed.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m._id));
            return [...prev, ...missed.filter((m) => !ids.has(m._id))];
          });
          lastMessageId.current = missed[missed.length - 1]._id;
        }
      }
    } catch { /* silent */ }
  }, [conversationId, markOwn]);

  // ── Send (text + optional attachments) ────────────────────────────────────
  const sendMessage = useCallback(async (text, tempId, attachments = []) => {
    if ((!text?.trim() && !attachments.length) || !conversationId) return { success: false };
    setSending(true);

    const optimistic = {
      _id: tempId, tempId, conversation: conversationId,
      text: text?.trim() || "", attachments,
      createdAt: new Date().toISOString(), isOwn: true, pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    const replaceOptimistic = (saved) => {
      setMessages((prev) => prev.map((m) => m.tempId === tempId ? { ...saved, isOwn: true, pending: false } : m));
      lastMessageId.current = saved._id;
    };

    try {
      const socket = getSocket();
      if (socket?.connected) {
        const response = await emitWithAck("send_message", { conversationId, text: text?.trim() || "", tempId, attachments });
        if (response?.success) {
          replaceOptimistic(response.message);
          setSending(false);
          return { success: true, message: response.message };
        }
      }
      // REST fallback
      const res = await sendMessageRestApi(conversationId, { text: text?.trim() || "", tempId, attachments });
      if (res?.status === 200 || res?.status === 201) {
        replaceOptimistic(res.data.data.message);
        setSending(false);
        return { success: true, message: res.data.data.message };
      }
      throw new Error("Send failed");
    } catch {
      setMessages((prev) => prev.map((m) => m.tempId === tempId ? { ...m, pending: false, failed: true } : m));
      setSending(false);
      return { success: false };
    }
  }, [conversationId]);

  // ── Upload attachments, then send ─────────────────────────────────────────
  const sendWithAttachments = useCallback(async (files, text, tempId) => {
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await uploadAttachmentsApi(conversationId, formData);
      if (res?.status === 200 || res?.status === 201) {
        const attachments = res.data.data.attachments || [];
        return await sendMessage(text, tempId, attachments);
      }
      return { success: false, message: "Upload failed." };
    } catch { return { success: false, message: "Upload failed." }; }
  }, [conversationId, sendMessage]);

  const editMessage = useCallback(async (messageId, text) => {
    const apply = () => setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, text, isEdited: true } : m));
    try {
      const socket = getSocket();
      if (socket?.connected) {
        const res = await emitWithAck("edit_message", { messageId, text, conversationId });
        if (res?.success) { apply(); return { success: true }; }
        return { success: false, message: res?.error };
      }
      const res = await editMessageRestApi(conversationId, messageId, { text });
      if (res?.status === 200) { apply(); return { success: true }; }
      return { success: false };
    } catch { return { success: false }; }
  }, [conversationId]);

  const deleteMessage = useCallback(async (messageId) => {
    const apply = () => setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, isDeleted: true, text: "" } : m));
    try {
      const socket = getSocket();
      if (socket?.connected) {
        const res = await emitWithAck("delete_message", { messageId, conversationId });
        if (res?.success) { apply(); return { success: true }; }
        return { success: false, message: res?.error };
      }
      const res = await deleteMessageRestApi(conversationId, messageId);
      if (res?.status === 200) { apply(); return { success: true }; }
      return { success: false };
    } catch { return { success: false }; }
  }, [conversationId]);

  const addIncomingMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === message._id)) return prev;
      return [...prev, { ...message, isOwn: String(message.sender?._id || message.sender) === String(currentUserId) }];
    });
    lastMessageId.current = message._id;
  }, [currentUserId]);

  const applyMessageEdit = useCallback(({ message }) => {
    setMessages((prev) => prev.map((m) => m._id === message._id
      ? { ...m, text: message.text, isEdited: true }
      : m));
  }, []);

  const applyMessageDelete = useCallback(({ messageId }) => {
    setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, isDeleted: true, text: "" } : m));
  }, []);

  useEffect(() => { if (conversationId) fetchMessages(); }, [conversationId]);

  return {
    messages, loading, sending, hasMore,
    fetchMessages, loadMore, fetchMissed,
    sendMessage, sendWithAttachments, editMessage, deleteMessage,
    addIncomingMessage, applyMessageEdit, applyMessageDelete,
  };
};

// ── useConversationActions ────────────────────────────────────────────────────
export const useConversationActions = () => {
  const [loading, setLoading] = useState(false);

  const renameGroup = useCallback(async (id, name) => {
    setLoading(true);
    try {
      const res = await updateConversationApi(id, { name });
      return res?.status === 200 ? { success: true } : { success: false, message: res?.data?.message };
    } catch { return { success: false }; }
    finally { setLoading(false); }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await deleteConversationApi(id);
      return res?.status === 200 ? { success: true } : { success: false, message: res?.data?.message };
    } catch { return { success: false }; }
    finally { setLoading(false); }
  }, []);

  const kickMember = useCallback(async (convId, memberId) => {
    setLoading(true);
    try {
      const res = await removeMemberApi(convId, memberId);
      return res?.status === 200 ? { success: true } : { success: false, message: res?.data?.message };
    } catch { return { success: false }; }
    finally { setLoading(false); }
  }, []);

  return { loading, renameGroup, deleteConversation, kickMember };
};

// ── useConversationUsers ──────────────────────────────────────────────────────
export const useConversationUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await getConversationUsersApi(search);
      if (res?.status === 200 || res?.status === 201) setUsers(res.data.data.users || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { searchUsers(); }, []);

  return { users, loading, searchUsers };
};