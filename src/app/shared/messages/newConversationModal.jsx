// src/app/shared/messages/newConversationModal.jsx — 
import { useState, useEffect }    from "react";
import { Box, Typography, Checkbox, Avatar, CircularProgress, TextField } from "@mui/material";
import { Search, Users }          from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import DialogActionButtons        from "../../../components/dialog/dialogAction";
import TextInput                  from "../../../components/textInput";
import { useConversationUsers }   from "../../../hooks/messages";
import useUserStore               from "../../../zustand/useUserStore";
import { resolveFileUrl } from "../../../utils/resolveFileUrl";


// ── Gradient checkbox ─────────────────────────────────────────────────────────
const UncheckedIcon = () => (
  <Box sx={{ width: 18, height: 18, borderRadius: "4px", border: "1.5px solid #D1D5DB", backgroundColor: "#fff", flexShrink: 0 }} />
);
const CheckedIcon = () => (
  <Box sx={{ width: 18, height: 18, borderRadius: "4px", background: "linear-gradient(135deg, #AA2493 0%, #022179 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Box>
);

const NewConversationModal = ({ open, onClose, onStart }) => {
  const { user } = useUserStore();
  const isAdminOrPM = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState([]); // array now (multi-select for group)
  const [isGroup,   setIsGroup]   = useState(false);
  const [groupName, setGroupName] = useState("");

  const { users, loading, searchUsers } = useConversationUsers();

  useEffect(() => {
    const t = setTimeout(() => searchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch(""); setSelected([]); setIsGroup(false); setGroupName("");
    }
  }, [open]);

  // Auto-switch to group mode if more than 1 person selected
  useEffect(() => {
    if (selected.length > 1) setIsGroup(true);
    if (selected.length <= 1 && isGroup && selected.length < 2) setIsGroup(false);
  }, [selected.length]);

  const togglePerson = (person) => {
    const exists = selected.find((p) => p._id === person._id);
    if (exists) {
      setSelected((prev) => prev.filter((p) => p._id !== person._id));
    } else {
      setSelected((prev) => [...prev, person]);
    }
  };

  const handleStart = () => {
    if (!selected.length) return;

    if (isGroup || selected.length > 1) {
      // Group chat — pass all selected IDs
      onStart?.({
        isGroup:        true,
        participantIds: selected.map((p) => p._id),
        name:           groupName.trim() || `Group (${selected.length + 1})`,
      });
    } else {
      // Direct chat — single person
      onStart?.(selected[0]);
    }
    setSelected([]);
    setSearch("");
    setGroupName("");
    setIsGroup(false);
  };

  const handleClose = () => {
    setSelected([]);
    setSearch("");
    setGroupName("");
    setIsGroup(false);
    onClose();
  };

  const canCreate = selected.length > 0 && (!isGroup || groupName.trim() || selected.length > 0);

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
      <DialogHeader title="New Conversation" onClose={handleClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2 }}>

          {/* Group mode toggle — Admin + PM only */}
          {isAdminOrPM && (
            <Box
              onClick={() => { setIsGroup((v) => !v); if (isGroup) setGroupName(""); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5, mb: 1.5,
                px: 2, py: 1.25, borderRadius: "10px", cursor: "pointer",
                backgroundColor: isGroup ? "#AA249310" : "#fff",
                border: isGroup ? "1px solid #AA2493" : "1px solid #E5E7EB",
                transition: "all 0.15s ease",
              }}
            >
              <Users size={16} color={isGroup ? "#AA2493" : "#9CA3AF"} />
              <Typography fontSize="13px" fontWeight={500} color={isGroup ? "#AA2493" : "text.secondary"}>
                {isGroup ? "Creating Group Chat" : "Create Group Chat"}
              </Typography>
              <Box sx={{ ml: "auto" }}>
                <Checkbox
                  checked={isGroup}
                  onChange={() => { setIsGroup((v) => !v); if (isGroup) setGroupName(""); }}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckedIcon />}
                  sx={{ p: 0 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            </Box>
          )}

          {/* Group name field */}
          {isGroup && (
            <Box mb={1.5}>
              <TextField
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                size="small" fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    fontSize: "13px",
                  },
                }}
              />
            </Box>
          )}

          {/* Selected count */}
          {selected.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
              {selected.map((p) => (
                <Box
                  key={p._id}
                  onClick={() => togglePerson(p)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    px: 1.5, py: 0.4, borderRadius: "20px",
                    backgroundColor: "#AA24931A", cursor: "pointer",
                    border: "1px solid #AA2493",
                  }}
                >
                  <Typography fontSize="12px" fontWeight={500} color="#AA2493">{p.name}</Typography>
                  <Typography fontSize="12px" color="#AA2493">×</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Search */}
          <TextInput
            placeholder={isGroup ? "Search people to add..." : "Search people..."}
            fullWidth
            inputBgColor="#fff"
            InputStartIcon={<Search size={16} color="#808080" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* People list */}
          <Box
            sx={{
              mt: 1.5, maxHeight: 300, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 0.5,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" },
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} sx={{ color: "#AA2493" }} />
              </Box>
            ) : users.length === 0 ? (
              <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
                No people found
              </Typography>
            ) : (
              users.map((person) => {
                const isSelected = selected.some((p) => p._id === person._id);
                return (
                  <Box
                    key={person._id}
                    onClick={() => isAdminOrPM || !isGroup ? togglePerson(person) : undefined}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      px: 1.5, py: 1, borderRadius: "10px", cursor: "pointer",
                      backgroundColor: isSelected ? "#AA249308" : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": { backgroundColor: isSelected ? "#AA249315" : "#F9F9F9" },
                    }}
                  >
                    {/* Show checkbox in group mode or multi-select */}
                    {(isGroup || isAdminOrPM) && (
                      <Checkbox
                        checked={isSelected}
                        icon={<UncheckedIcon />}
                        checkedIcon={<CheckedIcon />}
                        sx={{ p: 0 }}
                        onClick={(e) => { e.stopPropagation(); togglePerson(person); }}
                      />
                    )}
                    <Avatar
                       src={resolveFileUrl(person.avatar)}
                      sx={{ width: 34, height: 34, fontSize: "13px", fontWeight: 600 }}
                    >
                      {person.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">{person.name}</Typography>
                      {person.subtitle && (
                        <Typography fontSize="11px" color="text.secondary">{person.subtitle}</Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleStart}
        showCancelBtn
        cancelText="Cancel"
        confirmText={isGroup ? `Create Group (${selected.length + 1})` : "Start Conversation"}
        variant="gradient"
        confirmDisabled={!selected.length}
      />
    </DialogContainer>
  );
};

export default NewConversationModal;