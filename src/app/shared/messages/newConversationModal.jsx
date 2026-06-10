// src/shared/messages/newConversationModal.jsx
import { useState, useEffect }              from "react";
import { Box, Typography, Checkbox, Avatar, CircularProgress } from "@mui/material";
import { Search }                           from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput           from "../../../components/textInput";
import { useConversationUsers } from "../../../hooks/messages";

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
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);   // single select for direct chat

  const { users, loading, searchUsers } = useConversationUsers();

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => searchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset on close
  useEffect(() => {
    if (!open) { setSearch(""); setSelected(null); }
  }, [open]);

  const handleStart = () => {
    if (!selected) return;
    onStart?.(selected);
    setSelected(null);
    setSearch("");
  };

  const handleClose = () => {
    setSelected(null);
    setSearch("");
    onClose();
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="400px" fullWidth>
      <DialogHeader title="New Conversation" onClose={handleClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2 }}>

          {/* Search */}
          <TextInput
            placeholder="Search people..."
            fullWidth
            inputBgColor="#fff"
            InputStartIcon={<Search size={16} color="#808080" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* People list */}
          <Box
            sx={{
              mt: 1.5,
              maxHeight: 340,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              "&::-webkit-scrollbar":       { width: "4px" },
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
              users.map((person) => (
                <Box
                  key={person._id}
                  onClick={() => setSelected(selected?._id === person._id ? null : person)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 1.5, py: 1, borderRadius: "10px", cursor: "pointer",
                    backgroundColor: selected?._id === person._id ? "#AA249308" : "#fff",
                    transition: "all 0.15s ease",
                    "&:hover": { backgroundColor: "#F9F9F9" },
                  }}
                >
                  <Checkbox
                    checked={selected?._id === person._id}
                    onChange={() => setSelected(selected?._id === person._id ? null : person)}
                    icon={<UncheckedIcon />}
                    checkedIcon={<CheckedIcon />}
                    sx={{ p: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar
                    src={person.avatar}
                    sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}
                  >
                    {person.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography fontSize="13px" fontWeight={500} color="text.primary">
                      {person.name}
                    </Typography>
                    {person.subtitle && (
                      <Typography fontSize="11px" color="text.secondary">
                        {person.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleStart}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Start Conversation"
        variant="gradient"
        confirmDisabled={!selected}
      />
    </DialogContainer>
  );
};

export default NewConversationModal;