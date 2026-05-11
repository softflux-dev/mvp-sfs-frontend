import { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { Smile, Paperclip, Send, Users } from "lucide-react";
import ChatIcon  from "../../../assets/icons/chat.svg";
import EmojiIcon   from "../../../assets/icons/emoji.svg";
import AttachIcon  from "../../../assets/icons/attach.svg";   
import SendIcon    from "../../../assets/icons/send.svg";
import TextInput from "../../../components/textInput";
import ChatBubble from "./chatBubble";

const DateDivider = ({ label }) => (
  <Box display="flex" alignItems="center" gap={2} my={2}>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
    <Typography fontSize="11px" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
  </Box>
);

const EmptyState = () => (
  <Box
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #AA249320, #02217920)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
     <img
                   src={ChatIcon}
                   alt="Confirmation"
                   style={{ width: 32, height: 32 }}
                 />
    </Box>
    <Box textAlign="center">
      <Typography fontSize="16px" fontWeight={600} color="text.primary">
        Select a conversation
      </Typography>
      <Typography fontSize="13px" color="text.secondary" mt={0.5}>
        Choose a chat from the sidebar to start messaging
      </Typography>
    </Box>
  </Box>
);

const ChatArea = ({ conversation }) => {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState(conversation?.messages || []);
  const bottomRef               = useRef(null);

  useEffect(() => {
    setMessages(conversation?.messages || []);
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id:        Date.now(),
        text:      input.trim(),
        time:      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn:     true,
        dateLabel: null,
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #F0F0F0",
        }}
      >
        <EmptyState />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* ── Chat Header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          borderBottom: "1px solid #F5F5F5",
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            src={conversation.avatar}
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #AA2493, #022179)",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            {conversation.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontSize="15px" fontWeight={600} color="text.primary">
              {conversation.name}
            </Typography>
            {conversation.subtitle && (
              <Typography fontSize="12px" color="text.secondary">
                {conversation.subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {conversation.isGroup && (
          <IconButton
            sx={{
              width: 36,
              height: 36,
              backgroundColor: "#F5F5F5",
              borderRadius: "10px",
              "&:hover": { backgroundColor: "#EBEBEB" },
            }}
          >
            <Users size={18} color="#67768B" />
          </IconButton>
        )}
      </Box>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(#AA2493, #022179)",
            borderRadius: "4px",
          },
        }}
      >
        {messages.map((msg, index) => {
          const prevMsg  = messages[index - 1];
          const showDate = !prevMsg || prevMsg.dateLabel !== msg.dateLabel;
          return (
            <Box key={msg.id}>
              {showDate && msg.dateLabel && (
                <DateDivider label={msg.dateLabel} />
              )}
              <ChatBubble message={msg} isOwn={msg.isOwn} />
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

     {/* ── Input Bar ──────────────────────────────────────────────────── */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderTop: "1px solid #F5F5F5",
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexShrink: 0,
      }}
    >
      {/* Emoji icon — separate pill button */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          backgroundColor: "#F5F5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          "&:hover": { backgroundColor: "#EBEBEB" },
        }}
      >
        <Box component="img" src={EmojiIcon} alt="emoji" sx={{ width: 20, height: 20 }} />
      </Box>

      {/* Attachment icon — separate pill button */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          backgroundColor: "#F5F5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          "&:hover": { backgroundColor: "#EBEBEB" },
        }}
      >
        <Box component="img" src={AttachIcon} alt="attach" sx={{ width: 20, height: 20 }} />
      </Box>

      {/* TextInput — takes remaining space */}
      <Box flex={1}>
        <TextInput
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          inputBgColor="#F5F5F5"
          fullWidth
        />
      </Box>

      {/* Send button */}
    <Box
      onClick={input.trim() ? handleSend : undefined}
      sx={{
        width: 44,
        height: 44,
        borderRadius: "14px",
        background: "linear-gradient(135deg, #AA2493, #022179)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: input.trim() ? "pointer" : "default",
        flexShrink: 0,
        transition: "all 0.2s ease",
        opacity: input.trim() ? 1 : 0.5,
        "&:hover": {
          background: input.trim()
            ? "linear-gradient(135deg, #022179, #AA2493)"
            : "linear-gradient(135deg, #AA2493, #022179)",
        },
      }}
    >
      <Box
        component="img"
        src={SendIcon}
        alt="send"
        sx={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }}
      />
    </Box>
    </Box>
    </Box>
  );
};

export default ChatArea;