// components/appBar/notifications.jsx  — 
// UI is identical to the original. Only the data source is replaced:
// mock array → useNotifications hook with 30s polling.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../zustand/useUserStore";
import {
  IconButton,
  Box,
  Typography,
  Popover,
} from "@mui/material";
import { X } from "lucide-react";
import { useNotifications } from "../../hooks/notification";

import notificationIcon from "../../assets/icons/notification-icon.svg";
import documentIcon     from "../../assets/icons/document-blue-icon.svg";
import clockIcon        from "../../assets/icons/time-icon-orange.svg";
import calendarIcon     from "../../assets/icons/calendar-icon-green.svg";
import mobileIcon       from "../../assets/icons/report-upload-icon-purple.svg";
import messageIcon      from "../../assets/icons/chat-icon-blue.svg";

// ── Map notification type → icon ─────────────────────────────────────────────
const TYPE_ICON = {
  newTaskAssignment:        { src: documentIcon,  alt: "Document", bg: "#EEF2FF" },
  projectDeadlineReminder:  { src: clockIcon,     alt: "Clock",    bg: "#FFF7ED" },
  projectDeadlineChanged:   { src: clockIcon,     alt: "Clock",    bg: "#FFF7ED" },
  leaveRequestSubmitted:    { src: calendarIcon,  alt: "Calendar", bg: "#ECFDF5" },
  leaveApprovedRejected:    { src: calendarIcon,  alt: "Calendar", bg: "#ECFDF5" },
  taskStatusUpdate:         { src: documentIcon,  alt: "Document", bg: "#EEF2FF" },
  projectTeamUpdated:       { src: mobileIcon,    alt: "Team",     bg: "#F5F3FF" },
  projectModuleUpdated:     { src: mobileIcon,    alt: "Module",   bg: "#F5F3FF" },
  newMessageReceived:       { src: messageIcon,   alt: "Message",  bg: "#EFF6FF" },
  bugStatusUpdated:         { src: documentIcon,  alt: "Bug",      bg: "#FFF7ED" },
};

const DEFAULT_ICON = { src: documentIcon, alt: "Notification", bg: "#EEF2FF" };

// ── Relative time helper ─────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Resolve where a notification click should navigate, based on type + role ──

const TASK_ASSIGN_STATUS_TYPES = ["newTaskAssignment", "taskStatusUpdate"];
const OTHER_TASK_TYPES         = ["taskDeadlineExtended", "taskOverdue"];
const BUG_TYPES                = ["bugStatusUpdated"];
const MESSAGE_TYPES            = ["newMessageReceived"];
const PROJECT_TYPES            = ["projectDeadlineChanged", "projectDeadlineReminder", "projectTeamUpdated", "projectModuleUpdated"];
const LEAVE_SUBMIT_TYPES       = ["leaveRequestSubmitted"];
const LEAVE_DECIDED_TYPES      = ["leaveApprovedRejected"];

function resolveNotificationRoute(n, role) {
  const { type, data = {} } = n;

  // ── Messages ──────────────────────────────────────────────────────────
  if (MESSAGE_TYPES.includes(type)) {
    if (role === "ADMIN")           return "/messages";
    if (role === "HR")              return "/hr-messages";
    if (role === "PROJECT_MANAGER") return "/pm-messages";
    return "/messages"; // Employee
  }

  // ── Bug status updates ───────────────────────────────────────────────
  if (BUG_TYPES.includes(type)) {
    if (role === "EMPLOYEE")                        return "/employee/bugs";
    if (role === "PROJECT_MANAGER" && data.taskId)  return `/pm-tasks/${data.taskId}`;
    if (role === "ADMIN" && data.taskId)            return `/projects/tasks/${data.taskId}`;
    return null;
  }

  // ── Leave submitted (HR/Admin need to review) ────────────────────────
  if (LEAVE_SUBMIT_TYPES.includes(type)) {
    if (role === "HR" || role === "ADMIN") return "/leave-management";
    return null;
  }

  // ── Leave approved/rejected (goes back to the requester) ─────────────
  if (LEAVE_DECIDED_TYPES.includes(type)) {
    if (role === "EMPLOYEE" || role === "HR" || role === "PROJECT_MANAGER") return "/emp-attendance";
    return null;
  }

  // ── Task assigned / task status updated ─────────────────────────────────
  if (TASK_ASSIGN_STATUS_TYPES.includes(type)) {
    if (role === "EMPLOYEE")                     return "/my-tasks";
    if (role === "PROJECT_MANAGER")              return "/task-management";
    if (role === "ADMIN" && data.taskId)         return `/projects/tasks/${data.taskId}`;
    return null;
  }

  // ── Other task-related (deadline extended, overdue) ──────────────────
  if (OTHER_TASK_TYPES.includes(type)) {
    if (role === "EMPLOYEE")                        return "/my-tasks";
    if (role === "PROJECT_MANAGER" && data.taskId)  return `/pm-tasks/${data.taskId}`;
    if (role === "ADMIN" && data.taskId)            return `/projects/tasks/${data.taskId}`;
    return null;
  }

  // ── Project-related (deadline change, team update, module update) ───────
  if (PROJECT_TYPES.includes(type)) {
    if (role === "ADMIN" && data.projectId)            return `/projects/${data.projectId}`;
    if (role === "PROJECT_MANAGER" && data.projectId)  return `/pm-projects/${data.projectId}`;
    return null;
  }

  return null;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const role = user?.role;
  const [anchorEl, setAnchorEl] = useState(null);
  const [tab,      setTab]      = useState(0);

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications();

  const displayed = tab === 0
    ? notifications
    : notifications.filter((n) => !n.isRead);

  const handleOpen  = (e) => { setAnchorEl(e.currentTarget); setTab(0); };
  const handleClose = ()  => setAnchorEl(null);

  const handleMarkAll = async () => {
    await markAllRead();
  };

  const handleClickNotif = async (n) => {
    if (!n.isRead) await markRead(n._id);
    const path = resolveNotificationRoute(n, role);
    if (path) {
      handleClose();
      navigate(path);
    }
  };

  return (
    <>
      {/* Bell button */}
      <IconButton onClick={handleOpen} sx={{ p: 0, position: "relative" }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: "50%",
            backgroundColor: "#F5F5F5",
            display: "flex", alignItems: "center", justifyContent: "center",
            "&:hover": { backgroundColor: "#EBEBEB" },
          }}
        >
          <img src={notificationIcon} alt="Notifications" style={{ width: 22, height: 22 }} />
        </Box>

        {unreadCount > 0 && (
          <Box
            sx={{
              position: "absolute", top: 2, right: 2,
              width: 10, height: 10, borderRadius: "50%",
              backgroundColor: "#AA2493", border: "2px solid #fff",
            }}
          />
        )}
      </IconButton>

      {/* Popover panel */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          sx: {
            borderRadius: "20px", width: 380, mt: 1,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
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
                fontSize="13px" fontWeight={500}
                onClick={handleMarkAll}
                sx={{
                  background:           "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                  cursor:               "pointer",
                }}
              >
                Mark All as Read
              </Typography>
              <IconButton
                size="small" onClick={handleClose}
                sx={{
                  background:   "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  color:        "#fff", width: 28, height: 28, borderRadius: "8px",
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
              backgroundColor: "#F5F5F5", borderRadius: "12px",
              p: "4px", display: "inline-flex", gap: 0.5, mb: 2,
            }}
          >
            {["All", "Unread"].map((label, i) => (
              <Box
                key={label}
                onClick={() => setTab(i)}
                sx={{
                  px: 2.5, py: 0.75, borderRadius: "10px", cursor: "pointer",
                  background: tab === i
                    ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)"
                    : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <Typography
                  fontSize="13px" fontWeight={500}
                  sx={{ color: tab === i ? "#fff" : "#67768B" }}
                >
                  {label}{i === 1 && unreadCount > 0 ? ` (${unreadCount})` : ""}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Notification list */}
          <Box
            sx={{
              display: "flex", flexDirection: "column", gap: 1,
              maxHeight: 380, overflowY: "auto", pr: 0.5,
              "&::-webkit-scrollbar":       { width: 4 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#E0E0E0", borderRadius: 4 },
            }}
          >
            {displayed.length === 0 ? (
              <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
                No notifications
              </Typography>
            ) : (
              displayed.map((n) => {
                const iconCfg = TYPE_ICON[n.type] || DEFAULT_ICON;
                const isUnread = !n.isRead;
                return (
                  <Box
                    key={n._id}
                    onClick={() => handleClickNotif(n)}
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1.5,
                      backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#EFEFEF" },
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        backgroundColor: iconCfg.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <img src={iconCfg.src} alt={iconCfg.alt} style={{ width: 20, height: 20 }} />
                    </Box>

                    {/* Text */}
                    <Box flex={1} minWidth={0}>
                      <Typography
                        fontSize="13px"
                        fontWeight={isUnread ? 600 : 400}
                        color="text.primary"
                        sx={{
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "normal", lineHeight: 1.4,
                        }}
                      >
                        {n.message}
                      </Typography>
                      <Typography fontSize="11px" color="text.secondary" mt={0.25}>
                        {relativeTime(n.createdAt)}
                      </Typography>
                    </Box>

                    {/* Unread dot */}
                    {isUnread && (
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: "#AA2493", flexShrink: 0, mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default Notifications;