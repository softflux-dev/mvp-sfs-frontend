// src/app/shared/messages/index.jsx — FULL REPLACEMENT
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";

import ConversationList     from "./conversationList";
import ChatArea             from "./chatArea";
import NewConversationModal from "./newConversationModal";
import { useConversations } from "../../../hooks/messages";
import { connectSocket, getSocket } from "../../../utils/socketManager";
import { createConversationApi, markAsReadApi } from "../../../api/modules/messages";

// ── base64url-safe JWT decode ────────────────────────────────────────────────
// JWTs use base64url ('-' and '_'); plain atob() throws on them.
// This was why employees couldn't edit/delete — currentUser came back null.
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    let b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const payload = JSON.parse(atob(b64));
    return {
      _id:   payload.id || payload._id,
      email: payload.email,
      role:  payload.role,
      name:  payload.name || payload.fullName || "",
    };
  } catch {
    return null;
  }
};

const Messages = () => {
  const token       = localStorage.getItem("token");
  const currentUser = useMemo(() => getCurrentUser(), [token]);

  const [activeConversation, setActiveConversation] = useState(null);
  const [search,             setSearch]             = useState("");
  const [modalOpen,          setModalOpen]          = useState(false);
  const [onlineUsers,        setOnlineUsers]        = useState(new Set());

  const {
    conversations, loading: convsLoading,
    fetchConversations, bumpConversationToTop,
    incrementUnread, resetUnread, removeConversation,
    updateConversation,
  } = useConversations();

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    const onConnect = () => fetchConversations();

    const onNewMessage = ({ conversationId, message }) => {
      setActiveConversation((prev) => {
        if (prev?._id === conversationId) {
          // Active chat — mark read immediately so unread doesn't accumulate
          markAsReadApi(conversationId).catch(() => {});
          return prev;
        }
        incrementUnread(conversationId);
        return prev;
      });
      bumpConversationToTop(conversationId, {
        text:   message.text || (message.attachments?.length ? `📎 ${message.attachments[0].fileName}` : ""),
        sender: message.senderName,
        sentAt: message.createdAt,
      });
    };

    // Keep sidebar preview in sync (covers edits of last message too)
    const onConvUpdated = ({ conversationId, lastMessage }) => {
      bumpConversationToTop(conversationId, lastMessage);
    };

    const onUserOnline  = ({ userId }) => setOnlineUsers((prev) => new Set([...prev, userId]));
    const onUserOffline = ({ userId }) => setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });

    socket.on("connect",              onConnect);
    socket.on("new_message",          onNewMessage);
    socket.on("conversation_updated", onConvUpdated);
    socket.on("user_online",          onUserOnline);
    socket.on("user_offline",         onUserOffline);

    return () => {
      socket.off("connect",              onConnect);
      socket.off("new_message",          onNewMessage);
      socket.off("conversation_updated", onConvUpdated);
      socket.off("user_online",          onUserOnline);
      socket.off("user_offline",         onUserOffline);
    };
  }, [token]);

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    resetUnread(conv._id);
    getSocket()?.emit("join_conversation", { conversationId: conv._id });
    markAsReadApi(conv._id).catch(() => {});
  }, [resetUnread]);

  const handleStartConversation = useCallback(async (participant) => {
    try {
      const res = await createConversationApi({
        participantId:    participant._id,
        participantModel: participant.userModel,
      });
      if (res?.status === 200 || res?.status === 201) {
        const conv = res.data.data.conversation;
        await fetchConversations();
        setModalOpen(false);
        // join the new room immediately so messages flow both ways
        getSocket()?.emit("join_conversation", { conversationId: conv._id });
        handleSelectConversation(conv);
      }
    } catch (err) { console.error("Create conversation error:", err); }
  }, [fetchConversations, handleSelectConversation]);

  // ── Delete chat — clears active chat + removes from sidebar ───────────────
  const handleConversationDeleted = useCallback((conversationId) => {
    removeConversation(conversationId);
    setActiveConversation((prev) => (prev?._id === conversationId ? null : prev));
  }, [removeConversation]);

  const filtered = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((c) => {
      const other = c.participants?.find(
        (p) => String(p.user?._id || p.user) !== String(currentUser?._id)
      );
      const name = c.name || other?.name || "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, currentUser]);

  const directMessages = filtered.filter((c) => c.type === "direct");
  const projectChats   = filtered.filter((c) => c.type === "project");

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 120px)", minHeight: 0 }}>
        <ConversationList
          directMessages={directMessages}
          projectChats={projectChats}
          activeId={activeConversation?._id}
          onSelect={handleSelectConversation}
          onNewConversation={() => setModalOpen(true)}
          search={search}
          onSearchChange={setSearch}
          loading={convsLoading}
          currentUserId={currentUser?._id}
          onlineUsers={onlineUsers}
          onConversationDeleted={handleConversationDeleted}
        />
        <ChatArea
          conversation={activeConversation}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          onMessageSent={(convId, lastMsg) => bumpConversationToTop(convId, lastMsg)}
          onDeleteConversation={handleConversationDeleted}
        />
      </Box>

      <NewConversationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={handleStartConversation}
      />
    </>
  );
};

export default Messages;