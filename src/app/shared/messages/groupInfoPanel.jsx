// src/app/shared/messages/groupInfoPanel.jsx
import { useState }  from "react";
import { Box, Typography, Avatar, IconButton, TextField, Drawer, Divider, CircularProgress } from "@mui/material";
import { X, Edit2, Trash2, UserMinus, Check }  from "lucide-react";
import ConfirmationDialog from "../../../components/popups/confirmation";
import { useRef }         from "react";

const GroupInfoPanel = ({
  open,
  onClose,
  conversation,
  currentUserId,
  onRename,
  onDelete,
  onKickMember,
  loading = false,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [newName,     setNewName]     = useState(conversation?.name || "");
  const confirmRef = useRef();

  const isCreator = conversation?.createdBy?.toString() === currentUserId?.toString();
  const members   = conversation?.participants || [];

  const handleRenameSave = async () => {
    if (newName.trim()) await onRename?.(newName.trim());
    setEditingName(false);
  };

  const handleKick = (member) => {
    confirmRef.current?.open({
      title:       "Remove Member?",
      description: `Remove ${member.name} from this group?`,
      confirmText: "Yes, Remove",
      cancelText:  "Cancel",
      onConfirm:   () => onKickMember?.(member.user || member._id),
    });
  };

  const handleDelete = () => {
    confirmRef.current?.open({
      title:       "Delete Group Chat?",
      description: "This will permanently delete the group and all messages.",
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm:   () => { onDelete?.(); onClose(); },
    });
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 320, borderRadius: "20px 0 0 20px", p: 0 } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid #F0F0F0" }}>
            <Typography fontSize="16px" fontWeight={600}>Group Info</Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF" }}>
              <X size={18} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

            {/* Group name */}
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "14px", p: 2, mb: 2 }}>
              {editingName ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameSave(); if (e.key === "Escape") setEditingName(false); }}
                    size="small"
                    autoFocus
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#fff" } }}
                  />
                  <IconButton size="small" onClick={handleRenameSave} sx={{ color: "#04C373" }}>
                    <Check size={16} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setEditingName(false)} sx={{ color: "#9CA3AF" }}>
                    <X size={16} />
                  </IconButton>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography fontSize="14px" fontWeight={600} color="text.primary">
                    {conversation?.name || "Project Chat"}
                  </Typography>
                  {isCreator && (
                    <IconButton size="small" onClick={() => { setNewName(conversation?.name || ""); setEditingName(true); }} sx={{ color: "#AA2493" }}>
                      <Edit2 size={14} />
                    </IconButton>
                  )}
                </Box>
              )}
              <Typography fontSize="12px" color="text.secondary" mt={0.5}>
                {members.length} members
              </Typography>
            </Box>

            {/* Members list */}
            <Typography fontSize="12px" fontWeight={600} color="text.secondary" mb={1} sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Members
            </Typography>

            <Box display="flex" flexDirection="column" gap={0.5}>
              {members.map((member, i) => {
                const memberId  = (member.user?._id || member.user)?.toString();
                const isSelf    = memberId === currentUserId?.toString();
                const isCreatorMember = conversation?.createdBy?.toString() === memberId;

                return (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: "10px", backgroundColor: "#F9F9F9" }}
                  >
                    <Avatar
                      src={member.avatar}
                      sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}
                    >
                      {member.name?.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">
                        {member.name || "Unknown"}
                        {isSelf && <Typography component="span" fontSize="11px" color="text.secondary"> (You)</Typography>}
                        {isCreatorMember && <Typography component="span" fontSize="11px" color="#AA2493"> · Creator</Typography>}
                      </Typography>
                      {member.subtitle && (
                        <Typography fontSize="11px" color="text.secondary">{member.subtitle}</Typography>
                      )}
                    </Box>

                    {/* Kick button — PM only, not self, not another creator */}
                    {isCreator && !isSelf && !isCreatorMember && (
                      <IconButton
                        size="small"
                        onClick={() => handleKick(member)}
                        sx={{ color: "#9CA3AF", "&:hover": { color: "#FF3B30", backgroundColor: "#FF3B3010" } }}
                      >
                        <UserMinus size={14} />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Delete group — PM only */}
            {isCreator && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box
                  onClick={handleDelete}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderRadius: "10px", cursor: "pointer", color: "#FF3B30", backgroundColor: "#FF3B3008", border: "1px solid #FF3B3020", "&:hover": { backgroundColor: "#FF3B3015" } }}
                >
                  <Trash2 size={16} />
                  <Typography fontSize="13px" fontWeight={500}>Delete Group Chat</Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default GroupInfoPanel;