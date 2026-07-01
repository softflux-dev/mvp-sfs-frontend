// src/app/shared/messages/groupInfoPanel.jsx — FULL REPLACEMENT
import { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, IconButton, TextField, Drawer, Divider, CircularProgress } from "@mui/material";
import { X, Edit2, Trash2, UserMinus, Check, MessageSquareOff, UserPlus, Search } from "lucide-react";
import ConfirmationDialog from "../../../components/popups/confirmation";
import { getConversationUsersApi, addMembersApi } from "../../../api/modules/messages";

const GroupInfoPanel = ({
  open,
  onClose,
  conversation,
  currentUserId,
  currentUserRole,
  onRename,
  onDelete,
  onKickMember,
  onClearMessages,
  onMembersAdded,
}) => {
  const [editingName,   setEditingName]   = useState(false);
  const [newName,       setNewName]       = useState("");
  const [localName,     setLocalName]     = useState(conversation?.name || "");
  const [showAddPanel,  setShowAddPanel]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [usersList,     setUsersList]     = useState([]);
  const [usersLoading,  setUsersLoading]  = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [adding,        setAdding]        = useState(false);
  const confirmRef = useRef();

  const currentName = localName || conversation?.name || "Group Chat";
  const members     = conversation?.participants || [];

  // Admin and PM can manage any group
  const isManager = String(conversation?.createdBy) === String(currentUserId)
    || currentUserRole === "ADMIN"
    || currentUserRole === "PROJECT_MANAGER";

  const currentMemberIds = new Set(
    members.map((m) => (m.user?._id || m.user)?.toString())
  );

  useEffect(() => {
    if (!open) {
      setShowAddPanel(false);
      setSearchQuery("");
      setSelectedUsers([]);
    }
  }, [open]);

  useEffect(() => {
    if (!showAddPanel) return;
    const t = setTimeout(async () => {
      setUsersLoading(true);
      try {
        const res = await getConversationUsersApi(searchQuery);
        if (res?.status === 200 || res?.status === 201) {
          const all = res.data.data.users || [];
          setUsersList(all.filter((u) => !currentMemberIds.has(u._id?.toString())));
        }
      } catch { /* silent */ }
      finally { setUsersLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, showAddPanel, members.length]);

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length) return;
    setAdding(true);
    try {
      const res = await addMembersApi(conversation._id, {
        memberIds:   selectedUsers.map((u) => u._id),
        memberModel: "Employee",
      });
      if (res?.status === 200 || res?.status === 201) {
        setShowAddPanel(false);
        setSelectedUsers([]);
        setSearchQuery("");
        onMembersAdded?.();
      }
    } catch { /* silent */ }
    finally { setAdding(false); }
  };

  const handleRenameStart = () => { setNewName(currentName); setEditingName(true); };

  const handleRenameSave = async () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== currentName) {
      setLocalName(trimmed);
      await onRename?.(trimmed);
    }
    setEditingName(false);
  };

  const handleKick = (member) => {
    confirmRef.current?.open({
      title:       "Remove Member?",
      description: `Remove ${member.name || member.fullName || "this member"} from this group?`,
      confirmText: "Yes, Remove",
      cancelText:  "Cancel",
      onConfirm:   () => onKickMember?.(member.user || member._id),
    });
  };

  const handleDelete = () => {
    confirmRef.current?.open({
      title:       "Archive Group Chat?",
      description: "This group chat will be hidden from all members. Messages and history are preserved for auditing purposes.",
      confirmText: "Yes, Archive",
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
            <Typography fontSize="16px" fontWeight={600}>
              {showAddPanel ? "Add Members" : "Group Info"}
            </Typography>
            <IconButton size="small" onClick={showAddPanel ? () => setShowAddPanel(false) : onClose} sx={{ color: "#9CA3AF" }}>
              <X size={18} />
            </IconButton>
          </Box>

          {/* ── Add Members Panel ─────────────────────────────────────── */}
          {showAddPanel ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", px: 2.5, py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "#F5F5F5", borderRadius: "10px", px: 1.5, py: 1, mb: 1.5 }}>
                <Search size={15} color="#9CA3AF" />
                <TextField
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="standard" fullWidth
                  InputProps={{ disableUnderline: true, sx: { fontSize: "13px" } }}
                />
              </Box>

              {selectedUsers.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                  {selectedUsers.map((u) => (
                    <Box key={u._id} onClick={() => toggleUser(u)}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.4, borderRadius: "20px", backgroundColor: "#AA24931A", border: "1px solid #AA2493", cursor: "pointer" }}>
                      <Typography fontSize="12px" fontWeight={500} color="#AA2493">{u.name}</Typography>
                      <Typography fontSize="12px" color="#AA2493">×</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.5 }}>
                {usersLoading ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} sx={{ color: "#AA2493" }} />
                  </Box>
                ) : usersList.length === 0 ? (
                  <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
                    {searchQuery ? "No people found" : "All employees are already in this group"}
                  </Typography>
                ) : (
                  usersList.map((user) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                      <Box key={user._id} onClick={() => toggleUser(user)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.5,
                          px: 1.5, py: 1, borderRadius: "10px", cursor: "pointer",
                          backgroundColor: isSelected ? "#AA249308" : "#F9F9F9",
                          border: isSelected ? "1px solid #AA249330" : "1px solid transparent",
                          "&:hover": { backgroundColor: isSelected ? "#AA249315" : "#F0F0F0" },
                        }}
                      >
                        <Avatar src={user.avatar} sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}>
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography fontSize="13px" fontWeight={500} color="text.primary">{user.name}</Typography>
                          {user.subtitle && <Typography fontSize="11px" color="text.secondary">{user.subtitle}</Typography>}
                        </Box>
                        {isSelected && <Check size={14} color="#AA2493" />}
                      </Box>
                    );
                  })
                )}
              </Box>

              <Box
                onClick={selectedUsers.length && !adding ? handleAddMembers : undefined}
                sx={{
                  mt: 2, py: 1.5, borderRadius: "12px", textAlign: "center",
                  cursor: selectedUsers.length && !adding ? "pointer" : "default",
                  background: selectedUsers.length ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#E5E7EB",
                  opacity: adding ? 0.7 : 1, transition: "all 0.2s",
                }}
              >
                {adding
                  ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                  : <Typography fontSize="13px" fontWeight={600} color={selectedUsers.length ? "#fff" : "#9CA3AF"}>
                      {selectedUsers.length ? `Add ${selectedUsers.length} Member${selectedUsers.length > 1 ? "s" : ""}` : "Select members to add"}
                    </Typography>
                }
              </Box>
            </Box>

          ) : (

          /* ── Group Info Panel ─────────────────────────────────────── */
          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

            {/* Group name */}
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "14px", p: 2, mb: 2 }}>
              {editingName ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameSave(); if (e.key === "Escape") setEditingName(false); }}
                    size="small" autoFocus fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#fff" } }}
                  />
                  <IconButton size="small" onClick={handleRenameSave} sx={{ color: "#04C373" }}><Check size={16} /></IconButton>
                  <IconButton size="small" onClick={() => setEditingName(false)} sx={{ color: "#9CA3AF" }}><X size={16} /></IconButton>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography fontSize="14px" fontWeight={600} color="text.primary">{currentName}</Typography>
                  {isManager && (
                    <IconButton size="small" onClick={handleRenameStart} sx={{ color: "#AA2493" }}><Edit2 size={14} /></IconButton>
                  )}
                </Box>
              )}
              <Typography fontSize="12px" color="text.secondary" mt={0.5}>{members.length} members</Typography>
            </Box>

            {/* Members header with Add button */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontSize="12px" fontWeight={600} color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Members
              </Typography>
              {isManager && (
                <Box onClick={() => setShowAddPanel(true)}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", px: 1, py: 0.5, borderRadius: "8px", "&:hover": { backgroundColor: "#F5F5F5" } }}>
                  <UserPlus size={13} color="#AA2493" />
                  <Typography fontSize="11px" fontWeight={600} color="#AA2493">Add</Typography>
                </Box>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={0.5}>
              {members.map((member, i) => {
                const memberId        = (member.user?._id || member.user)?.toString();
                const isSelf          = memberId === currentUserId?.toString();
                const isCreatorMember = conversation?.createdBy?.toString() === memberId;
                const displayName     = member.name || member.fullName || "Unknown";
                return (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: "10px", backgroundColor: "#F9F9F9" }}>
                    <Avatar src={member.avatar} sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}>
                      {displayName?.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">
                        {displayName}
                        {isSelf && <Typography component="span" fontSize="11px" color="text.secondary"> (You)</Typography>}
                        {isCreatorMember && <Typography component="span" fontSize="11px" color="#AA2493"> · Creator</Typography>}
                      </Typography>
                      {member.subtitle && <Typography fontSize="11px" color="text.secondary">{member.subtitle}</Typography>}
                    </Box>
                    {isManager && !isSelf && !isCreatorMember && (
                      <IconButton size="small" onClick={() => handleKick(member)}
                        sx={{ color: "#9CA3AF", "&:hover": { color: "#FF3B30", backgroundColor: "#FF3B3010" } }}>
                        <UserMinus size={14} />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Actions — manager only */}
            {isManager && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box onClick={handleDelete}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderRadius: "10px", cursor: "pointer", color: "#FF3B30", backgroundColor: "#FF3B3008", border: "1px solid #FF3B3020", "&:hover": { backgroundColor: "#FF3B3015" } }}>
                  <Trash2 size={16} />
                  <Box>
                    <Typography fontSize="13px" fontWeight={500}>Delete Group Chat</Typography>
                    <Typography fontSize="11px" color="text.secondary">Chat is archived, not permanently deleted</Typography>
                  </Box>
                </Box>
                <Box
                  onClick={() => {
                    confirmRef.current?.open({
                      title:       "Clear All Messages?",
                      description: "All messages in this group will be permanently deleted. The group and its members will remain intact.",
                      confirmText: "Yes, Clear Messages",
                      cancelText:  "Cancel",
                      onConfirm:   () => onClearMessages?.(),
                    });
                  }}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderRadius: "10px", cursor: "pointer", color: "#D97706", backgroundColor: "#FEF3C708", border: "1px solid #FDE68A", mt: 1, "&:hover": { backgroundColor: "#FEF3C720" } }}
                >
                  <MessageSquareOff size={16} />
                  <Box>
                    <Typography fontSize="13px" fontWeight={500}>Clear Chat Messages</Typography>
                    <Typography fontSize="11px" color="text.secondary">Group stays, only messages are deleted</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          )}
        </Box>
      </Drawer>

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default GroupInfoPanel;