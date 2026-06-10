// src/app/shared/messages/index.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box }                                        from "@mui/material";

import ConversationList     from "./conversationList";
import ChatArea             from "./chatArea";
import NewConversationModal from "./newConversationModal";
import { useConversations } from "../../../hooks/messages";
import { connectSocket, getSocket } from "../../../utils/socketManager";
import { createConversationApi, markAsReadApi } from "../../../api/modules/messages";

// ── Get current user from JWT stored in localStorage ─────────────────────────
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      _id:   payload.id   || payload._id,
      email: payload.email,
      role:  payload.role,
      name:  payload.name  || payload.fullName || "",
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
    conversations,
    loading: convsLoading,
    fetchConversations,
    bumpConversationToTop,
    incrementUnread,
    resetUnread,
  } = useConversations();

  // ── Connect socket on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on("connect", () => {
      fetchConversations();
    });

    socket.on("new_message", ({ conversationId, message }) => {
      setActiveConversation((prev) => {
        if (prev?._id === conversationId) return prev;
        incrementUnread(conversationId);
        return prev;
      });
      bumpConversationToTop(conversationId, {
        text:   message.text,
        sender: message.senderName,
        sentAt: message.createdAt,
      });
    });

    socket.on("user_online",  ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });
    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    });

    return () => {
      socket.off("new_message");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("connect");
    };
  }, [token]);

  // ── Select a conversation ─────────────────────────────────────────────────
  const handleSelectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    resetUnread(conv._id);
    getSocket()?.emit("join_conversation", { conversationId: conv._id });
    markAsReadApi(conv._id).catch(() => {});
  }, [resetUnread]);

  // ── Start new conversation ────────────────────────────────────────────────
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
        handleSelectConversation(conv);
      }
    } catch (err) {
      console.error("Create conversation error:", err);
    }
  }, [fetchConversations, handleSelectConversation]);

  // ── Filter + split ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((c) => {
      const other = c.participants?.find(
        (p) => (p.user?._id || p.user)?.toString() !== currentUser?._id?.toString()
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
        />
        <ChatArea
          conversation={activeConversation}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          onMessageSent={(convId, lastMsg) => bumpConversationToTop(convId, lastMsg)}
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