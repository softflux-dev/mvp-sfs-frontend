import { Box, Typography, Avatar } from "@mui/material";
import paperclipIcon from "../../../assets/icons/img.svg"; // adjust path as needed

const FileAttachment = ({ fileName }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      mt: 1,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: "8px",
      px: 1.5,
      py: 0.75,
    }}
  >
    <Box
      component="img"
      src={paperclipIcon}
      alt="file"
      sx={{ width: 14, height: 14, filter: "brightness(0) invert(1)", flexShrink: 0 }}
    />
    <Typography fontSize="12px" color="#fff" noWrap>
      {fileName}
    </Typography>
  </Box>
);

const ChatBubble = ({ message, isOwn }) => {
  const { text, time, avatar, senderInitials, attachment } = message;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 1,
        mb: 2,
      }}
    >
      {/* Avatar (only for received) */}
      {!isOwn && (
        <Avatar
          src={avatar}
          sx={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: "13px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {senderInitials}
        </Avatar>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          maxWidth: "60%",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isOwn
              ? "linear-gradient(135deg, #AA2493 0%, #022179 100%)"
              : "#F5F5F5",
            boxShadow: isOwn
              ? "0 4px 15px rgba(170, 36, 147, 0.25)"
              : "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Typography
            fontSize="13px"
            lineHeight={1.6}
            color={isOwn ? "#fff" : "text.primary"}
          >
            {text}
          </Typography>
          {attachment && <FileAttachment fileName={attachment} />}
        </Box>
        <Typography fontSize="11px" color="text.secondary" mt={0.5}>
          {time}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatBubble;