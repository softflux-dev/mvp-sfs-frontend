// src/shared/messages/conversationItem.jsx
import { Box, Typography, Avatar, Badge } from "@mui/material";
import chatIcon from "../../../assets/icons/chat-icon.svg";

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
  currentUserId,
  onlineUsers = new Set(),
}) => {
  const { type, name, lastMessage, unreadCount, participants = [] } = conversation;

  // For direct chats — show the other person's name and avatar
  const otherParticipant = type === "direct"
    ? participants.find((p) => {
        const pid = p.user?._id || p.user;
        return pid?.toString() !== currentUserId?.toString();
      })
    : null;

  const displayName   = type === "project"
    ? (name || "Project Chat")
    : (otherParticipant?.name || name || "Unknown");

  const displayAvatar = otherParticipant?.avatar || "";
  const otherUserId   = otherParticipant?.user?._id || otherParticipant?.user || "";
  const isOnline      = type === "direct" && onlineUsers.has(otherUserId?.toString());

  // Format last message time
  const timeStr = lastMessage?.sentAt
    ? (() => {
        const d    = new Date(lastMessage.sentAt);
        const now  = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (diff === 1) return "Yesterday";
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      })()
    : "";

  const lastText = lastMessage?.text
    ? lastMessage.text.length > 35
      ? lastMessage.text.slice(0, 35) + "..."
      : lastMessage.text
    : "No messages yet";

  return (
    <Box
      onClick={onClick}
      sx={{
        display:    "flex",
        alignItems: "center",
        gap:        1.5,
        px:         2,
        py:         1.5,
        borderRadius: "12px",
        cursor:     "pointer",
        transition: "all 0.2s ease",
        background: isActive
          ? "linear-gradient(90deg, #AA249315 0%, #02217910 100%)"
          : "transparent",
        border: isActive ? "1px solid #AA249330" : "1px solid transparent",
        "&:hover": { backgroundColor: isActive ? undefined : "#F5F5F5" },
      }}
    >
      {/* Avatar with online dot */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          isOnline ? (
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#04C373", border: "2px solid #fff" }} />
          ) : null
        }
      >
        <Avatar
          src={displayAvatar}
          sx={{ width: 42, height: 42, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "15px", fontWeight: 600, flexShrink: 0 }}
        >
          {displayName?.charAt(0)}
        </Avatar>
      </Badge>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            fontSize="13px"
            fontWeight={isActive ? 600 : unreadCount > 0 ? 600 : 500}
            color={isActive ? "#AA2493" : "text.primary"}
            noWrap
          >
            {displayName}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, ml: 1, gap: 0.25 }}>
            {chatIcon && (
              <Box component="img" src={chatIcon} alt="" sx={{ width: 14, height: 14, opacity: 0.4 }} />
            )}
            <Typography fontSize="11px" color="text.secondary">{timeStr}</Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.25}>
          <Typography
            fontSize="12px"
            color="text.secondary"
            noWrap
            sx={{ flex: 1, fontWeight: unreadCount > 0 ? 600 : 400 }}
          >
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
  );
};

export default ConversationItem;