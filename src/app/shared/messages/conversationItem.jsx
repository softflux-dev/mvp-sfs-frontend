// src/app/shared/messages/conversationItem.jsx — FULL REPLACEMENT
import { useState, useRef } from "react";
import { Box, Typography, Avatar, Badge, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVertical, Trash2 } from "lucide-react";
import ConfirmationDialog        from "../../../components/popups/confirmation";
import { useConversationActions } from "../../../hooks/messages";

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
  currentUserId,
  currentUserRole,
  onlineUsers = new Set(),
  onDeleted,
}) => {
  const { type, name, lastMessage, unreadCount, participants = [], createdBy } = conversation;
  const [hovered,    setHovered]    = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const confirmRef    = useRef();
  const menuButtonRef = useRef();

  const { deleteConversation } = useConversationActions();

  const otherParticipant = type === "direct"
    ? participants.find((p) => String(p.user?._id || p.user) !== String(currentUserId))
    : null;

  const displayName   = type === "project" ? (name || "Project Chat") : (otherParticipant?.name || name || "Unknown");
  const displayAvatar = otherParticipant?.avatar || "";
  const otherUserId   = otherParticipant?.user?._id || otherParticipant?.user || "";
  const isOnline      = type === "direct" && onlineUsers.has(String(otherUserId));
  const isCreator     = String(createdBy) === String(currentUserId);
  const isGroup       = type === "project";

  // Admin and PM can manage any group, not just ones they created
  const canDelete = type === "direct"
    || isCreator
    || currentUserRole === "ADMIN"
    || currentUserRole === "PROJECT_MANAGER";

  const timeStr = lastMessage?.sentAt
    ? (() => {
        const d = new Date(lastMessage.sentAt); const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (diff === 1) return "Yesterday";
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      })()
    : "";

  const lastText = lastMessage?.text
    ? lastMessage.text.length > 32 ? lastMessage.text.slice(0, 32) + "..." : lastMessage.text
    : "No messages yet";

  const handleDeleteGroup = (e) => {
    e.stopPropagation();
    setMenuAnchor(null);
    confirmRef.current?.open({
      title:       "Archive Group Chat?",
      description: "This group chat will be hidden from all members. Messages and history are preserved. You can restore it from the Archived Groups section.",
      confirmText: "Yes, Archive",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteConversation(conversation._id);
        if (result.success) onDeleted?.(conversation._id);
      },
    });
  };

  const handleDeleteDirect = (e) => {
    e.stopPropagation();
    setMenuAnchor(null);
    confirmRef.current?.open({
      title:       "Delete Chat?",
      description: "This chat will be removed from your view. The other person can still see it.",
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteConversation(conversation._id);
        if (result.success) onDeleted?.(conversation._id);
      },
    });
  };

  return (
    <>
      <Box
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5,
          borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease",
          background: isActive ? "linear-gradient(90deg, #AA249315 0%, #02217910 100%)" : "transparent",
          border: isActive ? "1px solid #AA249330" : "1px solid transparent",
          "&:hover": { backgroundColor: isActive ? undefined : "#F5F5F5" },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={isOnline ? (
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#04C373", border: "2px solid #fff" }} />
          ) : null}
        >
          <Avatar src={displayAvatar} sx={{ width: 42, height: 42, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "15px", fontWeight: 600, flexShrink: 0 }}>
            {displayName?.charAt(0)}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontSize="13px" fontWeight={isActive || unreadCount > 0 ? 600 : 500}
              color={isActive ? "#AA2493" : "text.primary"} noWrap>
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 1, gap: 0.25 }}>
              <Typography fontSize="11px" color="text.secondary"
                sx={{ visibility: hovered ? "hidden" : "visible" }}>
                {timeStr}
              </Typography>
              {canDelete && (
                <IconButton
                  ref={menuButtonRef}
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setMenuAnchor(menuButtonRef.current); }}
                  sx={{
                    p: 0.25, color: "#9CA3AF",
                    visibility: hovered ? "visible" : "hidden",
                    "&:hover": { color: "#AA2493" },
                  }}
                >
                  <MoreVertical size={14} />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.25}>
            <Typography fontSize="12px" color="text.secondary" noWrap
              sx={{ flex: 1, fontWeight: unreadCount > 0 ? 600 : 400 }}>
              {lastText}
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{ minWidth: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #AA2493, #022179)", display: "flex", alignItems: "center", justifyContent: "center", ml: 1, flexShrink: 0 }}>
                <Typography fontSize="10px" fontWeight={600} color="#fff">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={(e) => { e?.stopPropagation?.(); setMenuAnchor(null); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 180 } }}
      >
        {isGroup ? (
          <MenuItem onClick={handleDeleteGroup} sx={{ fontSize: "13px", gap: 1.5, py: 1, color: "#FF3B30" }}>
            <Trash2 size={14} /> Archive Group
          </MenuItem>
        ) : (
          <MenuItem onClick={handleDeleteDirect} sx={{ fontSize: "13px", gap: 1.5, py: 1, color: "#FF3B30" }}>
            <Trash2 size={14} /> Delete Chat
          </MenuItem>
        )}
      </Menu>

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default ConversationItem;