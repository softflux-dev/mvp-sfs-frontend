// src/shared/messages/chatArea.jsx — FULL REPLACEMENT
import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Avatar, IconButton, CircularProgress } from "@mui/material";
import { Users }    from "lucide-react";
import { v4 as uuid } from "uuid";

import ChatIcon   from "../../../assets/icons/chat.svg";
import EmojiIcon  from "../../../assets/icons/emoji.svg";
import AttachIcon from "../../../assets/icons/attach.svg";
import SendIcon   from "../../../assets/icons/send.svg";
import TextInput  from "../../../components/textInput";
import ChatBubble from "./chatBubble";
import { useMessages } from "../../../hooks/messages";
import { getSocket }   from "../../../utils/socketManager";

// ── Date divider ──────────────────────────────────────────────────────────────
const DateDivider = ({ label }) => (
  <Box display="flex" alignItems="center" gap={2} my={2}>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
    <Typography fontSize="11px" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
  </Box>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
    <Box sx={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #AA249320, #02217920)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src={ChatIcon} alt="chat" style={{ width: 32, height: 32 }} />
    </Box>
    <Box textAlign="center">
      <Typography fontSize="16px" fontWeight={600} color="text.primary">Select a conversation</Typography>
      <Typography fontSize="13px" color="text.secondary" mt={0.5}>Choose a chat from the sidebar to start messaging</Typography>
    </Box>
  </Box>
);

// ── Group messages by date ────────────────────────────────────────────────────
const getDateLabel = (dateStr) => {
  const d     = new Date(dateStr);
  const today = new Date();
  const diff  = Math.floor((today - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const ChatArea = ({ conversation, currentUser, onlineUsers = new Set(), onMessageSent }) => {
  const [input,      setInput]      = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const topRef      = useRef(null);

  const {
    messages, loading, sending, hasMore,
    loadMore, fetchMissed, sendMessage, addIncomingMessage,
  } = useMessages(conversation?._id);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Socket event listeners for this conversation ──────────────────────────
  useEffect(() => {
    if (!conversation?._id) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (conversationId !== conversation._id) return;
      addIncomingMessage(message);
    };

    const handleTypingStart = ({ conversationId, userId, userName }) => {
      if (conversationId !== conversation._id) return;
      if (userId === currentUser?._id) return;
      setTypingUsers((prev) => prev.includes(userName) ? prev : [...prev, userName]);
    };

    const handleTypingStop = ({ conversationId, userId }) => {
      if (conversationId !== conversation._id) return;
      setTypingUsers((prev) => prev.filter((_, i) => i !== 0)); // simple: remove first
    };

    // Fetch any messages missed while this conversation wasn't open
    fetchMissed();

    socket.on("new_message",         handleNewMessage);
    socket.on("user_typing",         handleTypingStart);
    socket.on("user_stopped_typing", handleTypingStop);

    return () => {
      socket.off("new_message",         handleNewMessage);
      socket.off("user_typing",         handleTypingStart);
      socket.off("user_stopped_typing", handleTypingStop);
    };
  }, [conversation?._id, currentUser?._id]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || !conversation?._id) return;
    const text   = input.trim();
    const tempId = uuid();
    setInput("");

    // Stop typing indicator
    clearTimeout(typingTimer.current);
    getSocket()?.emit("typing_stop", { conversationId: conversation._id });

    const result = await sendMessage(text, tempId);
    if (result?.success) {
      onMessageSent?.(conversation._id, {
        text,
        sender: currentUser?.fullName || currentUser?.name || "",
        sentAt: new Date().toISOString(),
      });
    }
  }, [input, conversation?._id, sendMessage, onMessageSent, currentUser]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!conversation?._id) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing_start", { conversationId: conversation._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: conversation._id });
    }, 2000);
  };

  // ── Infinite scroll (load older messages) ────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 1 }
    );
    if (topRef.current) observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!conversation) {
    return (
      <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: "20px", display: "flex", flexDirection: "column", border: "1px solid #F0F0F0" }}>
        <EmptyState />
      </Box>
    );
  }

  // Get conversation display name — for direct chats, show other person's name
  const otherParticipant = conversation.participants?.find(
    (p) => p.user?._id !== currentUser?._id && p.user !== currentUser?._id
  );
  const displayName = conversation.name || otherParticipant?.name || "Unknown";
  const displayAvatar = otherParticipant?.avatar || "";
  const otherUserId   = otherParticipant?.user?._id || otherParticipant?.user || "";
  const isOnline      = onlineUsers.has(otherUserId?.toString());

  // ── Add date labels to messages ───────────────────────────────────────────
  let lastDateLabel = null;
  const messagesWithDates = messages.map((msg) => {
    const label = getDateLabel(msg.createdAt);
    const show  = label !== lastDateLabel;
    lastDateLabel = label;
    return { ...msg, showDateLabel: show, dateLabel: label };
  });

  return (
    <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: "20px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #F0F0F0" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid #F5F5F5", flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ position: "relative" }}>
            <Avatar src={displayAvatar} sx={{ width: 40, height: 40, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "15px", fontWeight: 600 }}>
              {displayName?.charAt(0)}
            </Avatar>
            {!conversation.isGroup && (
              <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", backgroundColor: isOnline ? "#04C373" : "#D1D5DB", border: "2px solid #fff" }} />
            )}
          </Box>
          <Box>
            <Typography fontSize="15px" fontWeight={600} color="text.primary">{displayName}</Typography>
            <Typography fontSize="12px" color={isOnline ? "#04C373" : "text.secondary"}>
              {conversation.isGroup ? conversation.subtitle : isOnline ? "Online" : "Offline"}
            </Typography>
          </Box>
        </Box>
        {conversation.isGroup && (
          <IconButton sx={{ width: 36, height: 36, backgroundColor: "#F5F5F5", borderRadius: "10px" }}>
            <Users size={18} color="#67768B" />
          </IconButton>
        )}
      </Box>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" } }}>

        {/* Sentinel for infinite scroll */}
        <div ref={topRef} />

        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} sx={{ color: "#AA2493" }} />
          </Box>
        )}

        {messagesWithDates.map((msg) => (
          <Box key={msg._id || msg.tempId}>
            {msg.showDateLabel && <DateDivider label={msg.dateLabel} />}
            <ChatBubble
              message={msg}
              isOwn={msg.isOwn || msg.sender?.toString() === currentUser?._id?.toString() || msg.sender === currentUser?._id}
            />
          </Box>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography fontSize="12px" color="text.secondary" fontStyle="italic">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </Typography>
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* ── Input Bar ─────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "14px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { backgroundColor: "#EBEBEB" } }}>
          <Box component="img" src={EmojiIcon} alt="emoji" sx={{ width: 20, height: 20 }} />
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: "14px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { backgroundColor: "#EBEBEB" } }}>
          <Box component="img" src={AttachIcon} alt="attach" sx={{ width: 20, height: 20 }} />
        </Box>
        <Box flex={1}>
          <TextInput
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Box>
        <Box
          onClick={input.trim() ? handleSend : undefined}
          sx={{ width: 44, height: 44, borderRadius: "14px", background: "linear-gradient(135deg, #AA2493, #022179)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0, opacity: input.trim() ? 1 : 0.5, transition: "all 0.2s ease", "&:hover": { background: input.trim() ? "linear-gradient(135deg, #022179, #AA2493)" : undefined } }}
        >
          <Box component="img" src={SendIcon} alt="send" sx={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }} />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatArea;