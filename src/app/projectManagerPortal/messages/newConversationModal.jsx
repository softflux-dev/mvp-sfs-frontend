import { useState } from "react";
import { Box, Typography, Checkbox, Avatar } from "@mui/material";
import { Search } from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput from "../../../components/textInput";

const mockPeople = [
  { id: 1, name: "Amara Johnson", role: "Developer"       },
  { id: 2, name: "Sara Ahmed",    role: "Designer"        },
  { id: 3, name: "Omar Farooq",   role: "QA Tester"       },
  { id: 4, name: "Fatima Khan",   role: "HR Manager"      },
  { id: 5, name: "Bilal Raza",    role: "Developer"       },
  { id: 6, name: "Ali Azeem",     role: "UI/UX Designer"  },
  { id: 7, name: "Usman Shah",    role: "Project Manager" },
  { id: 8, name: "Hina Malik",    role: "QA Tester"       },
];

// Gradient checkbox — same pattern used across the app (addRoleDialog, etc.)
const UncheckedIcon = () => (
  <Box sx={{
    width: 18, height: 18,
    borderRadius: "4px",
    border: "1.5px solid #D1D5DB",
    backgroundColor: "#fff",
    flexShrink: 0,
  }} />
);

const CheckedIcon = () => (
  <Box sx={{
    width: 18, height: 18,
    borderRadius: "4px",
    background: "linear-gradient(135deg, #AA2493 0%, #022179 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Box>
);

const NewConversationModal = ({ open, onClose, onStart, people = mockPeople }) => {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState([]);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleStart = () => {
    onStart?.(selected);
    setSelected([]);
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSelected([]);
    setSearch("");
    onClose();
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="400px" fullWidth>
      <DialogHeader title="New Conversation" onClose={handleClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2 }}>

          {/* Search — uses your TextInput component */}
          <TextInput
            placeholder="Search conversations or people"
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
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(#AA2493, #022179)",
                borderRadius: "4px",
              },
            }}
          >
            {filtered.map((person) => (
              <Box
                key={person.id}
                onClick={() => toggle(person.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: selected.includes(person.id) ? "#AA249308" : "#fff",
                  transition: "all 0.15s ease",
                  "&:hover": { backgroundColor: "#F9F9F9" },
                }}
              >
                <Checkbox
                  checked={selected.includes(person.id)}
                  onChange={() => toggle(person.id)}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckedIcon />}
                  sx={{ p: 0 }}
                  onClick={(e) => e.stopPropagation()}
                />
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    background: "linear-gradient(135deg, #AA2493, #022179)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {person.name.charAt(0)}
                </Avatar>
                <Typography fontSize="13px" fontWeight={500} color="text.primary">
                  {person.name}
                </Typography>
              </Box>
            ))}
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
        confirmDisabled={selected.length === 0}
      />
    </DialogContainer>
  );
};

export default NewConversationModal;