import { Box, Typography, IconButton } from "@mui/material";
import { Plus, Search } from "lucide-react";
import TextInput from "../../../components/textInput";
import ConversationItem from "./conersationItem";


const SectionLabel = ({ label }) => (
  <Typography
    fontSize="11px"
    fontWeight={700}
    color="text.darkGray"
    sx={{
      px: 1,
      pt: 2,
      pb: 0.75,
      letterSpacing: "0.8px",
      textTransform: "uppercase",
    }}
  >
    {label}
  </Typography>
);

const ConversationList = ({
  directMessages = [],
  projectChats = [],
  activeId,
  onSelect,
  onNewConversation,
  search,
  onSearchChange,
}) => {
  const filterList = (list) =>
    list.filter((c) =>
      c.name.toLowerCase().includes((search || "").toLowerCase())
    );

  return (
    <Box
      sx={{
        width: 400,
        flexShrink: 0,
        backgroundColor: "#fff",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 2.5,
          pb: 1.5,
        }}
      >
        <Typography fontSize="18px" fontWeight={600} color="text.primary">
          Messages
        </Typography>

        <IconButton
          onClick={onNewConversation}
          sx={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            borderRadius: "10px",
            "&:hover": {
              background: "linear-gradient(135deg, #022179, #AA2493)",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={18} color="#fff" />
        </IconButton>
      </Box>

      {/* ── Search — uses your TextInput component ─────────────────────── */}
      <Box px={2} pb={1}>
        <TextInput
          placeholder="Search conversations or people"
          fullWidth
          inputBgColor="#F5F5F5"
          InputStartIcon={<Search size={15} color="#808080" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>

      {/* ── Lists ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          pb: 2,
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(#AA2493, #022179)",
            borderRadius: "4px",
          },
        }}
      >
        {/* Direct Messages */}
        <SectionLabel label="Direct Messages" />
        {filterList(directMessages).map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeId === conv.id}
            onClick={() => onSelect(conv)}
          />
        ))}

        {/* Project Chats */}
        <SectionLabel label="Project Chats" />
        {filterList(projectChats).map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeId === conv.id}
            onClick={() => onSelect(conv)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ConversationList;