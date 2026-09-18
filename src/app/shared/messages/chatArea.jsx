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

// ── Mention helpers ──────────────────────────────────────────────────────────
// Finds an in-progress "@query" the caret is currently sitting inside of.
// Returns null if the caret isn't inside a mention trigger.
const findMentionTrigger = (text, caretPos) => {
  const upToCaret = text.slice(0, caretPos);
  const at = upToCaret.lastIndexOf("@");
  if (at === -1) return null;
  // The character right before "@" must be start-of-string or whitespace
  const before = at === 0 ? "" : upToCaret[at - 1];
  if (before && !/\s/.test(before)) return null;
  const query = upToCaret.slice(at + 1);
  // If the user already typed a space after @, they're done mentioning
  if (/\s/.test(query)) return null;
  return { start: at, query };
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

  // ── @mention state ──────────────────────────────────────────────────────
  const [mentionOpen,     setMentionOpen]     = useState(false);
  const [mentionQuery,    setMentionQuery]    = useState("");
  const [mentionStart,    setMentionStart]    = useState(null);
  const [mentionActiveIdx,setMentionActiveIdx]= useState(0);
  const [mentionedUsers,  setMentionedUsers]  = useState([]); // [{id, name}] confirmed-inserted mentions

  const bottomRef    = useRef(null);
  const topRef       = useRef(null);
  const typingTimer  = useRef(null);
  const confirmRef   = useRef();
  const fileInputRef = useRef(null);
  const inputRef     = useRef(null);

  const {
    messages, loading, sending, hasMore,
    loadMore, fetchMissed, fetchMessages, sendMessage, sendWithAttachments,
    editMessage, deleteMessage,
    addIncomingMessage, applyMessageEdit, applyMessageDelete,
  } = useMessages(conversation?._id, currentUser?._id);

  const { renameGroup, deleteConversation, kickMember, makeGroupAdmin, removeGroupAdmin, transferOwnership } = useConversationActions();

   // Both "project" (Admin/PM-created team chats) and "group" (Employee
  // personal groups) are multi-person conversations — the header must show
  // the conversation's own name in either case, not fall through to the
  // "direct chat, show the other participant" branch below.
  const isGroup = conversation?.type === "project" || conversation?.type === "group";

  // ── Group members eligible to be @mentioned (everyone but yourself) ─────
  const mentionableMembers = (conversation?.participants || [])
    .map((p) => ({
      id:     (p.user?._id || p.user)?.toString(),
      name:   p.name || p.fullName || "Unknown",
      avatar: resolveFileUrl(p.avatar) || "",
    }))
    .filter((p) => p.id && p.id !== String(currentUser?._id));

  const mentionCandidates = mentionableMembers.filter((p) =>
    p.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    setTypingUsers([]);
    setInput("");
    setPendingFiles([]);
    setMentionOpen(false);
    setMentionedUsers([]);
  }, [conversation?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
    useEffect(() => {
    if (!conversation?._id) return;
    const socket = getSocket();
    if (!socket) return;
    const convId = String(conversation._id);

    // Guarantee this socket is actually in the conversation's room every time
    // a chat is opened/re-rendered here — don't rely solely on the sidebar's
    // click handler or the initial "join_conversations" done at connect time.
    // Both are fine in the common case, but any gap between them (a
    // reconnect that races with the room list fetch, this component staying
    // mounted across a background socket reconnect, etc.) meant this room
    // join could be silently missed, and messages for the OPEN chat would
    // then never arrive live — only a full reload re-established it.
    socket.emit("join_conversation", { conversationId: convId });

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

    // If this socket ever drops and reconnects while this chat stays open
    // (flaky wifi, backgrounded tab, tunnel hiccup, server restart), the
    // one-time fetchMissed() above can't help — it already ran. Any message
    // sent during that gap would otherwise be invisible in the chat pane
    // forever, even though separate systems (the notification bell) still
    // pick it up via polling. Re-running fetchMissed() on every reconnect
    // closes that gap.
    const handleReconnect = () => {
      socket.emit("join_conversation", { conversationId: convId });
      fetchMissed();
    };
    socket.on("connect", handleReconnect);

    // Belt-and-suspenders: also poll for anything missed every few seconds
    // while this chat stays open. The socket path above should be the one
    // doing the real work — this is just a cheap safety net so a single
    // dropped/delayed broadcast (whatever the exact cause) surfaces within
    // a few seconds instead of requiring a manual reload.
    const pollTimer = setInterval(() => { fetchMissed(); }, 4000);

    socket.on("new_message",         handleNew);
    socket.on("message_edited",      handleEdited);
    socket.on("message_deleted",     handleDeleted);
    socket.on("user_typing",         handleTypingStart);
    socket.on("user_stopped_typing", handleTypingStop);

    return () => {
      clearInterval(pollTimer);
      socket.off("connect",             handleReconnect);
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

  useEffect(() => { setMentionActiveIdx(0); }, [mentionQuery, mentionOpen]);

  const closeMentionMenu = () => {
    setMentionOpen(false);
    setMentionQuery("");
    setMentionStart(null);
  };

  const handleSelectMention = useCallback((person) => {
    if (mentionStart == null) return;
    const caret = inputRef.current?.selectionStart ?? input.length;
    const before = input.slice(0, mentionStart);
    const after  = input.slice(caret);
    const insertion = `@${person.name} `;
    const newValue = `${before}${insertion}${after}`;
    setInput(newValue);
    setMentionedUsers((prev) => prev.some((m) => m.id === person.id) ? prev : [...prev, person]);
    closeMentionMenu();
    // restore focus + caret after the inserted mention
    requestAnimationFrame(() => {
      const pos = before.length + insertion.length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange?.(pos, pos);
    });
  }, [input, mentionStart]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !pendingFiles.length) || !conversation?._id || sending) return;
    const text   = input.trim();
    const files  = pendingFiles;
    const tempId = uuid();

    // Only forward mentions whose "@Name" tag is still actually present in
    // the final text — protects against stale entries if the user deleted
    // a tag after inserting it.
    const mentionIds = mentionedUsers
      .filter((m) => text.includes(`@${m.name}`))
      .map((m) => m.id);

    setInput("");
    setPendingFiles([]);
    setMentionedUsers([]);
    closeMentionMenu();
    clearTimeout(typingTimer.current);
    getSocket()?.emit("typing_stop", { conversationId: conversation._id });

    const result = files.length
      ? await sendWithAttachments(files, text, tempId, mentionIds)
      : await sendMessage(text, tempId, [], mentionIds);

    if (result?.success) {
      onMessageSent?.(conversation._id, {
        text: text || (files.length ? `📎 ${files[0].name}` : ""),
        sender: currentUser?.name || "",
        sentAt: new Date().toISOString(),
      });
    }
  }, [input, pendingFiles, mentionedUsers, conversation?._id, sending, sendMessage, sendWithAttachments, onMessageSent, currentUser]);

  const handleKeyDown = (e) => {
    if (mentionOpen && mentionCandidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionActiveIdx((i) => (i + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionActiveIdx((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectMention(mentionCandidates[mentionActiveIdx]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeMentionMenu();
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    const value  = e.target.value;
    const caret  = e.target.selectionStart ?? value.length;
    setInput(value);

    if (!conversation?._id) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("typing_start", { conversationId: conversation._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit("typing_stop", { conversationId: conversation._id }), 2000);
    }

    // Only offer @mentions inside group chats — mentioning in a 1:1 direct
    // chat has no one else to pick from.
    if (!isGroup) { closeMentionMenu(); return; }

    const trigger = findMentionTrigger(value, caret);
    if (trigger) {
      setMentionOpen(true);
      setMentionQuery(trigger.query);
      setMentionStart(trigger.start);
    } else {
      closeMentionMenu();
    }
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

  // All participant display names — used by ChatBubble to highlight "@Name"
  // occurrences inside already-sent message text.
  const allParticipantNames = (conversation?.participants || [])
    .map((p) => p.name || p.fullName)
    .filter(Boolean);

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
                participantNames={allParticipantNames}
                currentUserId={currentUser?._id}
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
        <Box sx={{ position: "relative", px: 2, py: 1.5, borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>

          {/* @mention dropdown */}
          {mentionOpen && mentionCandidates.length > 0 && (
            <Box
              sx={{
                position: "absolute", bottom: "100%", left: 16, mb: 1,
                width: 260, maxHeight: 220, overflowY: "auto",
                backgroundColor: "#fff", borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #F0F0F0",
                zIndex: 20,
              }}
            >
              {mentionCandidates.map((p, i) => (
                <Box
                  key={p.id}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectMention(p); }}
                  onMouseEnter={() => setMentionActiveIdx(i)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.25,
                    px: 1.5, py: 1, cursor: "pointer",
                    backgroundColor: i === mentionActiveIdx ? "#AA249312" : "transparent",
                  }}
                >
                  <Avatar src={p.avatar} sx={{ width: 28, height: 28, fontSize: "11px", fontWeight: 600 }}>
                    {p.name?.charAt(0)}
                  </Avatar>
                  <Typography fontSize="13px" fontWeight={500} color="text.primary" noWrap>
                    {p.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

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
            <TextInput
              inputRef={inputRef}
              placeholder={isGroup ? "Type a message... use @ to mention someone" : "Type a message..."}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              inputBgColor="#F5F5F5"
              fullWidth
            />
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
           onMakeGroupAdmin={async (memberId) => await makeGroupAdmin(conversation._id, memberId)}
          onRemoveGroupAdmin={async (memberId) => await removeGroupAdmin(conversation._id, memberId)}
          onTransferOwnership={async (memberId) => {
            const result = await transferOwnership(conversation._id, memberId);
            if (result.success) onMembersAdded?.(); // reuse existing refresh callback
          }}
        />
      )}

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default ChatArea;