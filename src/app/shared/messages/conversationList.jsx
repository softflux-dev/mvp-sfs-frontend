// src/shared/messages/conversationList.jsx
import { Box, Typography, IconButton, Skeleton } from "@mui/material";
import { Plus, Search } from "lucide-react";
import TextInput         from "../../../components/textInput";
import ConversationItem  from "./conversationItem";

const SectionLabel = ({ label }) => (
  <Typography
    fontSize="11px"
    fontWeight={700}
    color="text.darkGray"
    sx={{ px: 1, pt: 2, pb: 0.75, letterSpacing: "0.8px", textTransform: "uppercase" }}
  >
    {label}
  </Typography>
);

const ConversationSkeleton = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
    <Skeleton variant="circular" width={42} height={42} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="80%" height={13} sx={{ mt: 0.5 }} />
    </Box>
  </Box>
);

const EmptySection = ({ label }) => (
  <Box px={2} py={1.5}>
    <Typography fontSize="12px" color="text.secondary" fontStyle="italic">
      No {label.toLowerCase()} yet
    </Typography>
  </Box>
);

const ConversationList = ({
  directMessages = [],
  projectChats   = [],
  activeId,
  onSelect,
  onNewConversation,
  search,
  onSearchChange,
  loading        = false,
  currentUserId,
  onlineUsers    = new Set(),
}) => {
  return (
    <Box
      sx={{
        width:           380,
        flexShrink:      0,
        backgroundColor: "#fff",
        borderRadius:    "20px",
        display:         "flex",
        flexDirection:   "column",
        overflow:        "hidden",
        border:          "1px solid #F0F0F0",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2.5, pb: 1.5 }}>
        <Typography fontSize="18px" fontWeight={600} color="text.primary">
          Messages
        </Typography>
        <IconButton
          onClick={onNewConversation}
          sx={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            borderRadius: "10px",
            "&:hover": { background: "linear-gradient(135deg, #022179, #AA2493)", transform: "scale(1.05)" },
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={18} color="#fff" />
        </IconButton>
      </Box>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <Box px={2} pb={1}>
        <TextInput
          placeholder="Search conversations..."
          fullWidth
          inputBgColor="#F5F5F5"
          InputStartIcon={<Search size={15} color="#808080" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>

      {/* ── Lists ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          pb: 2,
          "&::-webkit-scrollbar":       { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" },
        }}
      >
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)}
          </>
        ) : (
          <>
            {/* Direct Messages */}
            <SectionLabel label="Direct Messages" />
            {directMessages.length === 0
              ? <EmptySection label="Direct Messages" />
              : directMessages.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conversation={conv}
                    isActive={activeId === conv._id}
                    onClick={() => onSelect(conv)}
                    currentUserId={currentUserId}
                    onlineUsers={onlineUsers}
                  />
                ))
            }

            {/* Project Chats */}
            <SectionLabel label="Project Chats" />
            {projectChats.length === 0
              ? <EmptySection label="Project Chats" />
              : projectChats.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conversation={conv}
                    isActive={activeId === conv._id}
                    onClick={() => onSelect(conv)}
                    currentUserId={currentUserId}
                    onlineUsers={onlineUsers}
                  />
                ))
            }
          </>
        )}
      </Box>
    </Box>
  );
};

export default ConversationList;