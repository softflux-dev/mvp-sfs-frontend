// components/appBar/notifications.jsx
import { useState } from "react";
import {
  IconButton,
  Box,
  Typography,
  Popover,
  Tabs,
  Tab,
} from "@mui/material";
import { X } from "lucide-react";
import notificationIcon from "../../assets/icons/notification-icon.svg";
import documentIcon from "../../assets/icons/document-blue-icon.svg";
import clockIcon from "../../assets/icons/time-icon-orange.svg";
import calendarIcon from "../../assets/icons/calendar-icon-green.svg";
import mobileIcon from "../../assets/icons/report-upload-icon-purple.svg";
import messageIcon from "../../assets/icons/chat-icon-blue.svg";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: { src: documentIcon, alt: "Document" },
    iconBg: "#EEF2FF",
    message: "You have been assigned: API Integration Module",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 2,
    icon: { src: clockIcon, alt: "Clock" },
    iconBg: "#FFF7ED",
    message: "Dashboard Redesign is due in 24 hours",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    icon: { src: calendarIcon, alt: "Calendar" },
    iconBg: "#ECFDF5",
    message: "Elena Rodriguez submitted a leave request",
    time: "2 Days Ago",
    unread: false,
  },
  {
    id: 4,
    icon: { src: calendarIcon, alt: "Check" },
    iconBg: "#ECFDF5",
    message: "Your leave request has been approved",
    time: "2 Days Ago",
    unread: false,
  },
  {
    id: 5,
    icon: {src:documentIcon, alt: "Document"},
    iconBg: "#EEF2FF",
    message: "Marcus Johnson marked Code Review as Completed",
    time: "2 Days Ago",
    unread: false,
  },
  {
    id: 6,
    icon: { src: mobileIcon, alt: "Mobile" },
    iconBg: "#F5F3FF",
    message: "Mobile App v2 has been updated by James Wilson",
    time: "2 Days Ago",
    unread: false,
  },
  {
    id: 7,
    icon: { src: messageIcon, alt: "Message" },
    iconBg: "#EFF6FF",
    message: "Sarah Chen sent you a message",
    time: "2 Days Ago",
    unread: false,
  },
];

const Notifications = () => {
  const [anchorEl,     setAnchorEl]     = useState(null);
  const [tab,          setTab]          = useState(0);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const displayed = tab === 0
    ? notifications
    : notifications.filter((n) => n.unread);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <>
      {/* Bell button */}
        
    <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ p: 0, position: "relative" }}
        >
        {/* Circle background */}
        <Box
            sx={{
            width:           40,
            height:          40,
            borderRadius:    "50%",
            backgroundColor: "#F5F5F5",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            "&:hover":       { backgroundColor: "#EBEBEB" },
            }}
        >
            <img
            src={notificationIcon}
            alt="Notifications"
            style={{ width: 22, height: 22 }}
            />
        </Box>

        {/* Unread dot badge */}
        {unreadCount > 0 && (
            <Box
            sx={{
                position:        "absolute",
                top:             2,
                right:           2,
                width:           10,
                height:          10,
                borderRadius:    "50%",
                backgroundColor: "#AA2493",
                border:          "2px solid #fff",
            }}
            />
        )}
        </IconButton>

      {/* Popover panel */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            width:        380,
            mt:           1,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.12)",
            overflow:     "hidden",
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>

          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography fontSize="18px" fontWeight={600} color="text.primary">
              Notifications
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                fontSize="13px"
                fontWeight={500}
                onClick={markAllRead}
                sx={{
                  background:            "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  WebkitBackgroundClip:  "text",
                  WebkitTextFillColor:   "transparent",
                  cursor:                "pointer",
                }}
              >
                Mark All as Read
              </Typography>
              <IconButton
                size="small"
                onClick={() => setAnchorEl(null)}
                sx={{
                  background:   "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  color:        "#fff",
                  width:        28,
                  height:       28,
                  borderRadius: "8px",
                  "&:hover":    { opacity: 0.85 },
                }}
              >
                <X size={14} />
              </IconButton>
            </Box>
          </Box>

          {/* All / Unread tabs */}
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius:    "12px",
              p:               "4px",
              display:         "inline-flex",
              gap:             0.5,
              mb:              2,
            }}
          >
            {["All", "Unread"].map((label, i) => (
              <Box
                key={label}
                onClick={() => setTab(i)}
                sx={{
                  px:           2.5,
                  py:           0.75,
                  borderRadius: "10px",
                  cursor:       "pointer",
                  background:   tab === i
                    ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                    : "transparent",
                  transition:   "background 0.2s",
                }}
              >
                <Typography
                  fontSize="13px"
                  fontWeight={500}
                  sx={{ color: tab === i ? "#fff" : "#67768B" }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Notification list */}
          <Box
            sx={{
              display:   "flex",
              flexDirection: "column",
              gap:       1,
              maxHeight: 380,
              overflowY: "auto",
              pr:        0.5,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background:   "#E0E0E0",
                borderRadius: 4,
              },
            }}
          >
            {displayed.length === 0 ? (
              <Typography
                fontSize="13px"
                color="text.secondary"
                textAlign="center"
                py={3}
              >
                No notifications
              </Typography>
            ) : (
              displayed.map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    display:         "flex",
                    alignItems:      "flex-start",
                    gap:             1.5,
                    backgroundColor: "#F5F5F5",
                    borderRadius:    "12px",
                    p:               1.5,
                    cursor:          "pointer",
                    "&:hover":       { backgroundColor: "#EFEFEF" },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width:           36,
                      height:          36,
                      borderRadius:    "10px",
                      backgroundColor: n.iconBg,
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                      fontSize:        "16px",
                      flexShrink:      0,
                    }}
                  >
                    <img
                    src={n.icon.src}
                    alt={n.icon.alt}
                    style={{ width: 20, height: 20 }}
                />
                  </Box>

                  {/* Text */}
                  <Box flex={1} minWidth={0}>
                    <Typography
                      fontSize="13px"
                      fontWeight={n.unread ? 600 : 400}
                      color="text.primary"
                      sx={{
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "normal",
                        lineHeight:   1.4,
                      }}
                    >
                      {n.message}
                    </Typography>
                    <Typography fontSize="11px" color="text.secondary" mt={0.25}>
                      {n.time}
                    </Typography>
                  </Box>

                  {/* Unread dot */}
                  {n.unread && (
                    <Box
                      sx={{
                        width:           8,
                        height:          8,
                        borderRadius:    "50%",
                        backgroundColor: "#AA2493",
                        flexShrink:      0,
                        mt:              0.5,
                      }}
                    />
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default Notifications;