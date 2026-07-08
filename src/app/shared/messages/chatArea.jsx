// src/app/shared/messages/chatArea.jsx — 
import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Avatar, IconButton, CircularProgress, Menu, MenuItem } from "@mui/material";
import { Users, MoreVertical, Trash2, X } from "lucide-react";
import { v4 as uuid } from "uuid";

import ChatIcon   from "../../../assets/icons/chat.svg";
import EmojiIcon  from "../../../assets/icons/emoji.svg";
import AttachIcon from "../../../assets/icons/attach.svg";
import SendIcon   from "../../../assets/icons/send.svg";
import TextInput  from "../../../components/textInput";
import ChatBubble from "./chatBubble";
import GroupInfoPanel from "./groupInfoPanel";
import ConfirmationDialog from "../../../components/popups/confirmation";
import { useMessages, useConversationActions } from "../../../hooks/messages";
import { clearGroupMessagesApi } from "../../../api/modules/messages";
import { getSocket } from "../../../utils/socketManager";
import { resolveFileUrl } from "../../../utils/resolveFileUrl";

const DateDivider = ({ label }) => (
  <Box display="flex" alignItems="center" gap={2} my={2}>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
    <Typography fontSize="11px" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{label}</Typography>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
  </Box>
);

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

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr); const today = new Date();
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const tOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff  = Math.round((tOnly - dOnly) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const ChatArea = ({
  conversation,
  currentUser,
  onlineUsers = new Set(),
  onMessageSent,
  onDeleteConversation,
  onConversationRenamed,
  onMembersAdded,
}) => {
  const [input,          setInput]          = useState("");
  const [typingUsers,    setTypingUsers]    = useState([]);
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [menuAnchor,     setMenuAnchor]     = useState(null);
  const [pendingFiles,   setPendingFiles]   = useState([]);

  const bottomRef    = useRef(null);
  const topRef       = useRef(null);
  const typingTimer  = useRef(null);
  const confirmRef   = useRef();
  const fileInputRef = useRef(null);

  const {
    messages, loading, sending, hasMore,
    loadMore, fetchMissed, fetchMessages, sendMessage, sendWithAttachments,
    editMessage, deleteMessage,
    addIncomingMessage, applyMessageEdit, applyMessageDelete,
  } = useMessages(conversation?._id, currentUser?._id);

  const { renameGroup, deleteConversation, kickMember } = useConversationActions();

  useEffect(() => {
    setTypingUsers([]);
    setInput("");
    setPendingFiles([]);
  }, [conversation?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  useEffect(() => {
    if (!conversation?._id) return;
    const socket = getSocket();
    if (!socket) return;
    const convId = String(conversation._id);

    const handleNew     = ({ conversationId, message }) => { if (String(conversationId) === convId) addIncomingMessage(message); };
    const handleEdited  = ({ conversationId, message }) => { if (String(conversationId) === convId) applyMessageEdit({ message }); };
    const handleDeleted = ({ conversationId, messageId }) => {
      if (String(conversationId) !== convId) return;
      applyMessageDelete({ messageId });
      // Update sidebar — fetch latest non-deleted message
      onMessageSent?.(conversationId, { text: "", sender: "", sentAt: null });
    };
    const handleTypingStart = ({ conversationId, userId, userName }) => {
      if (String(conversationId) !== convId) return;
      if (String(userId) === String(currentUser?._id)) return;
      setTypingUsers((prev) => prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, userName }]);
    };
    const handleTypingStop = ({ conversationId, userId }) => {
      if (String(conversationId) !== convId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    fetchMissed();
    socket.on("new_message",         handleNew);
    socket.on("message_edited",      handleEdited);
    socket.on("message_deleted",     handleDeleted);
    socket.on("user_typing",         handleTypingStart);
    socket.on("user_stopped_typing", handleTypingStop);

    return () => {
      socket.off("new_message",         handleNew);
      socket.off("message_edited",      handleEdited);
      socket.off("message_deleted",     handleDeleted);
      socket.off("user_typing",         handleTypingStart);
      socket.off("user_stopped_typing", handleTypingStop);
    };
  }, [conversation?._id, currentUser?._id]);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && hasMore) loadMore(); }, { threshold: 1 });
    if (topRef.current) observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !pendingFiles.length) || !conversation?._id || sending) return;
    const text   = input.trim();
    const files  = pendingFiles;
    const tempId = uuid();
    setInput("");
    setPendingFiles([]);
    clearTimeout(typingTimer.current);
    getSocket()?.emit("typing_stop", { conversationId: conversation._id });

    const result = files.length
      ? await sendWithAttachments(files, text, tempId)
      : await sendMessage(text, tempId);

    if (result?.success) {
      onMessageSent?.(conversation._id, {
        text: text || (files.length ? `📎 ${files[0].name}` : ""),
        sender: currentUser?.name || "",
        sentAt: new Date().toISOString(),
      });
    }
  }, [input, pendingFiles, conversation?._id, sending, sendMessage, sendWithAttachments, onMessageSent, currentUser]);

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!conversation?._id) return;
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit("typing_start", { conversationId: conversation._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("typing_stop", { conversationId: conversation._id }), 2000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPendingFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const handleDeleteConversation = () => {
    setMenuAnchor(null);
    const isGroupChat = conversation?.type === "project";
    confirmRef.current?.open({
      title:       isGroupChat ? "Archive Group Chat?" : "Delete Chat?",
      description: isGroupChat
        ? "This group chat will be hidden from all members. Messages are preserved and can be restored from Archived Groups."
        : "This chat will be removed from your view.",
      confirmText: isGroupChat ? "Yes, Archive" : "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteConversation(conversation._id);
        if (result.success) onDeleteConversation?.(conversation._id);
      },
    });
  };

  if (!conversation) {
    return (
      <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: "20px", display: "flex", flexDirection: "column", border: "1px solid #F0F0F0" }}>
        <EmptyState />
      </Box>
    );
  }

  const isGroup  = conversation.type === "project";
  const isCreator = String(conversation.createdBy) === String(currentUser?._id);

  // Admin and PM can manage any group, not just ones they created
  const canManage = isCreator
    || currentUser?.role === "ADMIN"
    || currentUser?.role === "PROJECT_MANAGER";

  const otherParticipant = !isGroup
    ? conversation.participants?.find((p) => String(p.user?._id || p.user) !== String(currentUser?._id))
    : null;
  const displayName   = isGroup ? (conversation.name || "Project Chat") : (otherParticipant?.name || "Unknown");
  const displayAvatar = resolveFileUrl(otherParticipant?.avatar) || "";
  const otherUserId   = otherParticipant?.user?._id || otherParticipant?.user || "";
  const isOnline      = !isGroup && onlineUsers.has(String(otherUserId));

  let lastDateLabel = null;
  const messagesWithDates = messages.map((msg) => {
    const label = getDateLabel(msg.createdAt);
    const show  = label !== lastDateLabel;
    lastDateLabel = label;
    return { ...msg, showDateLabel: show, dateLabel: label };
  });

  return (
    <>
      <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: "20px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #F0F0F0" }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid #F5F5F5", flexShrink: 0 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ position: "relative" }}>
              <Avatar src={displayAvatar} sx={{ width: 40, height: 40, fontSize: "15px", fontWeight: 600 }}>
                {displayName?.charAt(0)}
              </Avatar>
              {!isGroup && (
                <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", backgroundColor: isOnline ? "#04C373" : "#D1D5DB", border: "2px solid #fff" }} />
              )}
            </Box>
            <Box>
              <Typography fontSize="15px" fontWeight={600} color="text.primary">{displayName}</Typography>
              <Typography fontSize="12px" color={isOnline ? "#04C373" : "text.secondary"}>
                {isGroup ? `${conversation.participants?.length || 0} members` : isOnline ? "Online" : "Offline"}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            {isGroup && (
              <IconButton onClick={() => setGroupPanelOpen(true)} sx={{ width: 36, height: 36, backgroundColor: "#F5F5F5", borderRadius: "10px" }}>
                <Users size={18} color="#67768B" />
              </IconButton>
            )}
            {/* Show 3-dot menu for direct chats always, for groups only if canManage */}
            {(conversation.type === "direct" || canManage) && (
              <>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ width: 36, height: 36, backgroundColor: "#F5F5F5", borderRadius: "10px" }}>
                  <MoreVertical size={18} color="#67768B" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 180 } }}
                >
                  {isGroup && canManage && (
                    <MenuItem onClick={() => { setMenuAnchor(null); setGroupPanelOpen(true); }} sx={{ fontSize: "13px", gap: 1.5, py: 1 }}>
                      <Users size={14} color="#67768B" /> Manage Group
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleDeleteConversation} sx={{ fontSize: "13px", gap: 1.5, py: 1, color: "#FF3B30" }}>
                    <Trash2 size={14} /> {isGroup ? "Archive Group" : "Delete Chat"}
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" } }}>
          <div ref={topRef} />
          {loading && <Box display="flex" justifyContent="center" py={3}><CircularProgress size={24} sx={{ color: "#AA2493" }} /></Box>}

          {messagesWithDates.map((msg) => (
            <Box key={msg._id || msg.tempId}>
              {msg.showDateLabel && <DateDivider label={msg.dateLabel} />}
              <ChatBubble
                message={msg}
                isOwn={msg.isOwn}
                isGroup={isGroup}
                onEdit={editMessage}
                onDelete={deleteMessage}
              />
            </Box>
          ))}

          {typingUsers.length > 0 && (
            <Typography fontSize="12px" color="text.secondary" fontStyle="italic" mb={1}>
              {typingUsers.map((u) => u.userName).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </Typography>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Pending files preview */}
        {pendingFiles.length > 0 && (
          <Box sx={{ px: 2, py: 1, borderTop: "1px solid #F5F5F5", display: "flex", gap: 1, flexWrap: "wrap" }}>
            {pendingFiles.map((f, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, backgroundColor: "#F5F5F5", borderRadius: "8px", px: 1.5, py: 0.5 }}>
                <Typography fontSize="12px" color="text.primary" noWrap sx={{ maxWidth: 160 }}>{f.name}</Typography>
                <IconButton size="small" onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))} sx={{ p: 0.25 }}>
                  <X size={12} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Input Bar */}
        <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "14px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { backgroundColor: "#EBEBEB" } }}>
            <Box component="img" src={EmojiIcon} alt="emoji" sx={{ width: 20, height: 20 }} />
          </Box>

          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{ width: 44, height: 44, borderRadius: "14px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { backgroundColor: "#EBEBEB" } }}
          >
            <Box component="img" src={AttachIcon} alt="attach" sx={{ width: 20, height: 20 }} />
          </Box>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />

          <Box flex={1}>
            <TextInput placeholder="Type a message..." value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} inputBgColor="#F5F5F5" fullWidth />
          </Box>

          <Box
            onClick={(input.trim() || pendingFiles.length) && !sending ? handleSend : undefined}
            sx={{ width: 44, height: 44, borderRadius: "14px", background: "linear-gradient(135deg, #AA2493, #022179)", display: "flex", alignItems: "center", justifyContent: "center", cursor: (input.trim() || pendingFiles.length) && !sending ? "pointer" : "default", flexShrink: 0, opacity: (input.trim() || pendingFiles.length) && !sending ? 1 : 0.5, transition: "all 0.2s ease" }}
          >
            {sending
              ? <CircularProgress size={16} sx={{ color: "#fff" }} />
              : <Box component="img" src={SendIcon} alt="send" sx={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }} />}
          </Box>
        </Box>
      </Box>

      {isGroup && (
        <GroupInfoPanel
          open={groupPanelOpen}
          onClose={() => setGroupPanelOpen(false)}
          conversation={conversation}
          currentUserId={currentUser?._id}
          currentUserRole={currentUser?.role}
          onRename={async (name) => {
            const result = await renameGroup(conversation._id, name);
            if (result.success) onConversationRenamed?.(conversation._id, name);
            return result;
          }}
          onDelete={async () => {
            await deleteConversation(conversation._id);
            onDeleteConversation?.(conversation._id);
          }}
          onClearMessages={async () => {
            try {
              await clearGroupMessagesApi(conversation._id);
              await fetchMessages();
            } catch { /* silent */ }
          }}
          onKickMember={async (memberId) => await kickMember(conversation._id, memberId)}
          onMembersAdded={onMembersAdded}
        />
      )}

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default ChatArea;