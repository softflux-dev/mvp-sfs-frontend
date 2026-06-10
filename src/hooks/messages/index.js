// src/hooks/messages.js
import { useState, useCallback, useEffect, useRef } from "react";
import {
  getConversationsApi,
  getMessagesApi,
  createConversationApi,
  markAsReadApi,
  sendMessageRestApi,
  getConversationUsersApi,
} from "../../api/modules/messages";
import { getSocket, emitWithAck } from "../../utils/socketManager";

// ── Hook: conversation list ───────────────────────────────────────────────────
export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getConversationsApi();
      if (res?.status === 200 || res?.status === 201) {
        setConversations(res.data.data.conversations || []);
      }
    } catch { setError("Failed to load conversations."); }
    finally   { setLoading(false); }
  }, []);

  // Update conversation's last message and unread count from socket events
  const updateConversation = useCallback((conversationId, updates) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId ? { ...c, ...updates } : c
      )
    );
  }, []);

  const bumpConversationToTop = useCallback((conversationId, lastMessage) => {
    setConversations((prev) => {
      const idx  = prev.findIndex((c) => c._id === conversationId);
      if (idx === -1) return prev;
      const conv = { ...prev[idx], lastMessage, updatedAt: new Date().toISOString() };
      const rest = prev.filter((c) => c._id !== conversationId);
      return [conv, ...rest];
    });
  }, []);

  const incrementUnread = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId
          ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
          : c
      )
    );
  }, []);

  const resetUnread = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  return {
    conversations, loading, error,
    fetchConversations, updateConversation,
    bumpConversationToTop, incrementUnread, resetUnread,
  };
};

// ── Hook: messages in one conversation ───────────────────────────────────────
export const useMessages = (conversationId) => {
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [sending,      setSending]      = useState(false);
  const [hasMore,      setHasMore]      = useState(true);
  const [error,        setError]        = useState("");
  const lastMessageId  = useRef(null);

  // ── Fetch initial messages ────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setMessages([]);
    setHasMore(true);
    try {
      const res = await getMessagesApi(conversationId, { limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        const msgs = res.data.data.messages || [];
        setMessages(msgs);
        setHasMore(msgs.length === 50);
        if (msgs.length > 0) {
          lastMessageId.current = msgs[msgs.length - 1]._id;
        }
      }
    } catch { setError("Failed to load messages."); }
    finally   { setLoading(false); }
  }, [conversationId]);

  // ── Load older messages (scroll up) ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || !messages[0]) return;
    try {
      const res = await getMessagesApi(conversationId, {
        before: messages[0]._id,
        limit:  50,
      });
      if (res?.status === 200 || res?.status === 201) {
        const older = res.data.data.messages || [];
        setMessages((prev) => [...older, ...prev]);
        setHasMore(older.length === 50);
      }
    } catch { /* silent */ }
  }, [conversationId, hasMore, messages]);

  // ── Fetch missed messages after reconnect ─────────────────────────────────
  const fetchMissed = useCallback(async () => {
    if (!conversationId || !lastMessageId.current) return;
    try {
      const res = await getMessagesApi(conversationId, {
        after: lastMessageId.current,
        limit: 100,
      });
      if (res?.status === 200 || res?.status === 201) {
        const missed = res.data.data.messages || [];
        if (missed.length > 0) {
          setMessages((prev) => {
            // Avoid duplicates
            const ids = new Set(prev.map((m) => m._id));
            const fresh = missed.filter((m) => !ids.has(m._id));
            return [...prev, ...fresh];
          });
          lastMessageId.current = missed[missed.length - 1]._id;
        }
      }
    } catch { /* silent */ }
  }, [conversationId]);

  // ── Send message via socket with fallback to REST ─────────────────────────
  const sendMessage = useCallback(async (text, tempId) => {
    if (!text?.trim() || !conversationId) return { success: false };
    setSending(true);

    // Optimistic UI — add message immediately with tempId
    const optimistic = {
      _id:          tempId,
      tempId,
      conversation: conversationId,
      text:         text.trim(),
      createdAt:    new Date().toISOString(),
      isOwn:        true,
      pending:      true,   // show as "sending..."
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const socket = getSocket();

      if (socket?.connected) {
        // ── Socket path: ACK confirms MongoDB save ──────────────────────────
        const response = await emitWithAck("send_message", {
          conversationId,
          text: text.trim(),
          tempId,
        });

        if (response.success) {
          // Replace optimistic message with real saved message
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId
                ? { ...response.message, isOwn: true, pending: false }
                : m
            )
          );
          lastMessageId.current = response.message._id;
          setSending(false);
          return { success: true, message: response.message };
        }
      }

      // ── REST fallback: socket unavailable or failed ─────────────────────
      const res = await sendMessageRestApi(conversationId, { text: text.trim(), tempId });
      if (res?.status === 200 || res?.status === 201) {
        const saved = res.data.data.message;
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId
              ? { ...saved, isOwn: true, pending: false }
              : m
          )
        );
        lastMessageId.current = saved._id;
        setSending(false);
        return { success: true, message: saved };
      }

      throw new Error("Send failed");

    } catch (err) {
      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...m, pending: false, failed: true } : m
        )
      );
      setSending(false);
      return { success: false, error: err.message };
    }
  }, [conversationId]);

  // ── Add incoming message from socket ─────────────────────────────────────
  const addIncomingMessage = useCallback((message) => {
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m._id));
      if (ids.has(message._id)) return prev;
      return [...prev, { ...message, isOwn: false }];
    });
    lastMessageId.current = message._id;
  }, []);

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  return {
    messages, loading, sending, hasMore, error,
    fetchMessages, loadMore, fetchMissed,
    sendMessage, addIncomingMessage,
    lastMessageId,
  };
};

// ── Hook: users list for new conversation modal ───────────────────────────────
export const useConversationUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await getConversationUsersApi(search);
      if (res?.status === 200 || res?.status === 201) {
        setUsers(res.data.data.users || []);
      }
    } catch { /* silent */ }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { searchUsers(); }, []);

  return { users, loading, searchUsers };
};