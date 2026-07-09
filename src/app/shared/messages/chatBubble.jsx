// src/app/shared/messages/chatBubble.jsx — 
import { useState } from "react";
import { Box, Typography, Avatar, Menu, MenuItem, TextField, IconButton } from "@mui/material";
import { MoreVertical, Edit2, Trash2, Check, X, Paperclip } from "lucide-react";
import { resolveFileUrl } from "../../../utils/resolveFileUrl";
const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FileAttachment = ({ attachment, isOwn }) => {
  const fileName = attachment?.fileName || String(attachment);
  const url      = attachment?.url ? `${SERVER_URL}${attachment.url}` : null;
  return (
    <Box
      component={url ? "a" : "div"}
      href={url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex", alignItems: "center", gap: 1, mt: 1,
        backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
        borderRadius: "8px", px: 1.5, py: 0.75,
        textDecoration: "none", cursor: url ? "pointer" : "default",
        "&:hover": { backgroundColor: isOwn ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.08)" },
      }}
    >
      <Paperclip size={13} color={isOwn ? "#fff" : "#67768B"} />
      <Typography fontSize="12px" color={isOwn ? "#fff" : "text.primary"} noWrap sx={{ maxWidth: 200 }}>
        {fileName}
      </Typography>
      {attachment?.fileSize && (
        <Typography fontSize="10px" color={isOwn ? "rgba(255,255,255,0.7)" : "text.secondary"}>
          {attachment.fileSize}
        </Typography>
      )}
    </Box>
  );
};

const StatusLabel = ({ pending, failed }) => {
  if (failed)  return <Typography fontSize="10px" color="#FF3B30">Failed</Typography>;
  if (pending) return <Typography fontSize="10px" color="text.secondary">Sending...</Typography>;
  return null;
};

const ChatBubble = ({ message, isOwn, isGroup = false, onEdit, onDelete }) => {
  const { text, createdAt, senderName, senderAvatar, attachments = [], pending, failed, isEdited, isDeleted } = message;

  const [hovered,    setHovered]    = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing,    setEditing]    = useState(false);
  const [editText,   setEditText]   = useState(text || "");

  const timeStr = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const handleEditSave = async () => {
    if (editText.trim() && editText.trim() !== text) {
      const result = await onEdit?.(message._id, editText.trim());
      if (!result?.success) setEditText(text || "");  // revert on failure
    }
    setEditing(false);
  };

 if (isDeleted) return null;

  return (
    <Box
      sx={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", alignItems: "flex-end", gap: 1, mb: 1.5, opacity: pending ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isOwn && (
        <Avatar src={resolveFileUrl(senderAvatar)} sx={{ width: 34, height: 34, fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
          {senderName?.charAt(0)}
        </Avatar>
      )}

      {/* Edit/delete menu — own messages only */}
     {isOwn && !pending && !failed && !editing && (
        <Box sx={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s", alignSelf: "center" }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }} sx={{ p: 0.5, color: "#9CA3AF", "&:hover": { color: "#AA2493" } }}>
            <MoreVertical size={14} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 120 } }}
          >
            {text && (
              <MenuItem onClick={() => { setEditText(text || ""); setEditing(true); setMenuAnchor(null); }} sx={{ fontSize: "13px", gap: 1.5, py: 1 }}>
                <Edit2 size={14} color="#67768B" /> Edit
              </MenuItem>
            )}
            <MenuItem onClick={() => { setMenuAnchor(null); onDelete?.(message._id); }} sx={{ fontSize: "13px", gap: 1.5, py: 1, color: "#FF3B30" }}>
              <Trash2 size={14} /> Delete
            </MenuItem>
          </Menu>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth: "62%" }}>

        {/* Sender name — group chats, received only */}
        {!isOwn && isGroup && senderName && (
          <Typography fontSize="11px" color="text.secondary" mb={0.4} ml={0.5}>{senderName}</Typography>
        )}

        <Box sx={{
          px: editing ? 1 : 2, py: editing ? 1 : 1.25,
          borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isOwn
            ? failed ? "linear-gradient(135deg, #FF3B30, #CC2A22)" : "linear-gradient(135deg, #AA2493 0%, #022179 100%)"
            : "#F5F5F5",
          boxShadow: isOwn ? "0 4px 15px rgba(170, 36, 147, 0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
          minWidth: editing ? "220px" : "auto",
        }}>
          {editing ? (
            <Box>
              <TextField
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                  if (e.key === "Escape") { setEditText(text || ""); setEditing(false); }
                }}
                multiline autoFocus fullWidth size="small" variant="standard"
                InputProps={{ disableUnderline: true, sx: { color: "#fff", fontSize: "13px" } }}
              />
              <Box display="flex" justifyContent="flex-end" gap={0.5} mt={1}>
                <IconButton size="small" onClick={() => { setEditText(text || ""); setEditing(false); }} sx={{ p: 0.5, color: "rgba(255,255,255,0.7)" }}>
                  <X size={14} />
                </IconButton>
                <IconButton size="small" onClick={handleEditSave} sx={{ p: 0.5, color: "rgba(255,255,255,0.9)" }}>
                  <Check size={14} />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <>
              {text && (
                <Typography fontSize="13px" lineHeight={1.6} color={isOwn ? "#fff" : "text.primary"}>
                  {text}
                </Typography>
              )}
              {attachments?.map((att, i) => <FileAttachment key={i} attachment={att} isOwn={isOwn} />)}
            </>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={0.75} mt={0.5} sx={{ flexDirection: isOwn ? "row-reverse" : "row" }}>
          <Typography fontSize="11px" color="text.secondary">{timeStr}</Typography>
          {isEdited && <Typography fontSize="10px" color="text.secondary">(edited)</Typography>}
          {isOwn && <StatusLabel pending={pending} failed={failed} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBubble;