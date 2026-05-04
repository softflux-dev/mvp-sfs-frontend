import { Box, Typography, Avatar, Badge } from "@mui/material";
import chatIcon from "../../../assets/icons/chat-icon.svg"; 

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { name, lastMessage, time, avatar, unreadCount, isOnline } = conversation;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: isActive
          ? "linear-gradient(90deg, #AA249315 0%, #02217910 100%)"
          : "transparent",
        border: isActive ? "1px solid #AA249330" : "1px solid transparent",
        "&:hover": {
          backgroundColor: isActive ? undefined : "#F5F5F5",
        },
      }}
    >
      {/* Avatar with online indicator */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          isOnline ? (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#04C373",
                border: "2px solid #fff",
              }}
            />
          ) : null
        }
      >
        <Avatar
          src={avatar}
          alt={name}
          sx={{
            width: 42,
            height: 42,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: "15px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {name?.charAt(0)}
        </Avatar>
      </Badge>

      {/* Text content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            fontSize="13px"
            fontWeight={isActive ? 600 : 500}
            color={isActive ? "#AA2493" : "text.primary"}
            noWrap
          >
            {name}
          </Typography>

          {/* ── icon above time ── */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexShrink: 0,
              ml: 1,
              gap: 0.25,
            }}
          >
            <Box
              component="img"
              src={chatIcon}
              alt="chat"
              sx={{ width: 14, height: 14, opacity: 0.5 }}
            />
            <Typography fontSize="11px" color="text.secondary">
              {time}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.25}>
          <Typography fontSize="12px" color="text.secondary" noWrap sx={{ flex: 1 }}>
            {lastMessage}
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                minWidth: 18,
                height: 18,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #AA2493, #022179)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ml: 1,
                flexShrink: 0,
              }}
            >
              <Typography fontSize="10px" fontWeight={600} color="#fff">
                {unreadCount}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationItem;