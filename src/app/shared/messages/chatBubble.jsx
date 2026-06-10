// src/shared/messages/chatBubble.jsx
import { Box, Typography, Avatar } from "@mui/material";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import paperclipIcon from "../../../assets/icons/img.svg";

const FileAttachment = ({ fileName }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", px: 1.5, py: 0.75 }}>
    <Box component="img" src={paperclipIcon} alt="file" sx={{ width: 14, height: 14, filter: "brightness(0) invert(1)", flexShrink: 0 }} />
    <Typography fontSize="12px" color="#fff" noWrap>{fileName}</Typography>
  </Box>
);

// ── Delivery status icon ──────────────────────────────────────────────────────
const StatusIcon = ({ pending, failed }) => {
  if (failed)  return <AlertCircle size={12} color="#FF3B30" />;
  if (pending) return <Clock size={12} color="rgba(255,255,255,0.6)" />;
  return <CheckCheck size={12} color="rgba(255,255,255,0.8)" />;
};

const ChatBubble = ({ message, isOwn }) => {
  const { text, createdAt, senderName, senderAvatar, attachments = [], pending, failed } = message;

  const timeStr = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <Box
      sx={{
        display:       "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems:    "flex-end",
        gap:           1,
        mb:            1.5,
        opacity:       pending ? 0.75 : 1,
        transition:    "opacity 0.2s ease",
      }}
    >
      {/* Avatar — only for received messages */}
      {!isOwn && (
        <Avatar
          src={senderAvatar}
          sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}
        >
          {senderName?.charAt(0)}
        </Avatar>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth: "62%" }}>

        {/* Sender name — only for received messages in group chats */}
        {!isOwn && senderName && (
          <Typography fontSize="11px" color="text.secondary" mb={0.4} ml={0.5}>
            {senderName}
          </Typography>
        )}

        {/* Bubble */}
        <Box
          sx={{
            px: 2, py: 1.25,
            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isOwn
              ? failed
                ? "linear-gradient(135deg, #FF3B30, #CC2A22)"
                : "linear-gradient(135deg, #AA2493 0%, #022179 100%)"
              : "#F5F5F5",
            boxShadow: isOwn
              ? "0 4px 15px rgba(170, 36, 147, 0.25)"
              : "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Typography fontSize="13px" lineHeight={1.6} color={isOwn ? "#fff" : "text.primary"}>
            {text}
          </Typography>

          {/* File attachments */}
          {attachments?.map((att, i) => (
            <FileAttachment key={i} fileName={att.fileName || att} />
          ))}
        </Box>

        {/* Time + status */}
        <Box display="flex" alignItems="center" gap={0.5} mt={0.5} sx={{ flexDirection: isOwn ? "row-reverse" : "row" }}>
          <Typography fontSize="11px" color="text.secondary">{timeStr}</Typography>
          {isOwn && <StatusIcon pending={pending} failed={failed} />}
          {failed && (
            <Typography fontSize="11px" color="#FF3B30">Failed — tap to retry</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBubble;