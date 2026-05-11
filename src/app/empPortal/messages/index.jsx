// app/admin/messages/index.jsx
import { useState } from "react";
import { Box } from "@mui/material";

import ConversationList    from "./conversationList";
import ChatArea            from "./chatArea";
import NewConversationModal from "./newConversationModal";

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockDirectMessages = [
  {
    id: 1,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 2,
    isOnline: true,
    subtitle: "Online",
    messages: [
      { id: 1, text: "Hello, I am unable to access my attendance report on the student portal.", time: "12 mins ago", isOwn: true,  dateLabel: null },
      { id: 2, text: "Hi! Thank you for reaching out. We are checking the issue. Could you please share a screenshot of the error you are seeing?", time: "12 mins ago", isOwn: false, senderInitials: "AD", dateLabel: null },
      { id: 3, text: "Here is the screenshot", time: "12 mins ago", isOwn: true, attachment: "error_screenshot.png", dateLabel: "Today" },
    ],
  },
  {
    id: 2,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 0,
    isOnline: false,
    subtitle: "Away",
    messages: [
      { id: 1, text: "Please review the leave request I submitted.", time: "3 hrs ago", isOwn: true, dateLabel: "Yesterday" },
    ],
  },
  {
    id: 3,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 1,
    isOnline: true,
    subtitle: "Online",
    messages: [],
  },
  {
    id: 4,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 0,
    isOnline: false,
    subtitle: "",
    messages: [],
  },
  {
    id: 5,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 0,
    isOnline: true,
    subtitle: "Online",
    messages: [],
  },
];

const mockProjectChats = [
  {
    id: 101,
    name: "Math Study Group",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 3,
    isOnline: false,
    isGroup: true,
    subtitle: "Mathematics 101 · 5 members",
    messages: [
      { id: 1, text: "Hello, I am unable to access my attendance report on the student portal.", time: "12 mins ago", isOwn: true,  dateLabel: null },
      { id: 2, text: "Hi! Thank you for reaching out. We are checking the issue. Could you please share a screenshot of the error you are seeing?", time: "12 mins ago", isOwn: false, senderInitials: "AD", dateLabel: null },
      { id: 3, text: "Here is the screenshot", time: "12 mins ago", isOwn: true, attachment: "error_screenshot.png", dateLabel: "Today" },
    ],
  },
  {
    id: 102,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 0,
    isOnline: false,
    isGroup: true,
    subtitle: "E-Commerce Platform · 4 members",
    messages: [],
  },
  {
    id: 103,
    name: "Admin Office",
    lastMessage: "Leave Request",
    time: "3 hrs ago",
    avatar: "",
    unreadCount: 0,
    isOnline: false,
    isGroup: true,
    subtitle: "Mobile Banking · 3 members",
    messages: [],
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [search,             setSearch]             = useState("");
  const [modalOpen,          setModalOpen]          = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          height: "calc(100vh - 120px)",
          minHeight: 0,
        }}
      >
        {/* ── Left: Conversation List ─────────────────────────────────────── */}
        <ConversationList
          directMessages={mockDirectMessages}
          projectChats={mockProjectChats}
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
          onNewConversation={() => setModalOpen(true)}
          search={search}
          onSearchChange={setSearch}
        />

        {/* ── Right: Chat Area ────────────────────────────────────────────── */}
        <ChatArea conversation={activeConversation} />
      </Box>

      {/* ── New Conversation Modal ──────────────────────────────────────────── */}
      <NewConversationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={(selectedIds) => {
          console.log("Start conversation with:", selectedIds);
        }}
      />
    </>
  );
};

export default Messages;