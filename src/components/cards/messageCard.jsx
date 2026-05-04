import React from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Avatar,
  Stack,
  Container,
} from "@mui/material";
import attachedIcon from "../../assets/icons/attached.svg";
import dateIcon from "../../assets/icons/date.svg";
import { flex } from "@mui/system";

const MessageCard = ({ item }) => {
  return (
    <Card
      elevation={0}
      // bgColor={"primary.lightGray"}
      sx={{
        backgroundColor: "#F5F5F5",
        p: 2.5,
        borderRadius: "24px",
        border: "1px solid #e7e7e7ff",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px #F973161A",
          borderColor: "transparent",
          bgcolor: "#ffff",
        },
      }}
    >
      {/* Header: Avatar, Info, and Badge */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
        marginBottom={2}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box
            width={35}
            height={35}
            p={1}
            borderRadius={2}
            bgcolor={"background.default"}
          >
            {item?.icon}
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              lineHeight={1.2}
              sx={{ color: "#000000" }}
            >
              {item?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item?.subject}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={item?.role}
          variant="default"
          sx={{ bgcolor: "#e0e0e0" }}
        />
      </Box>

      {/* Message Preview */}
      <Typography
        variant="body2"
        marginBottom={2}
        WebkitBoxOrient={1}
        color="text.dark"
        mb={2}
        overflow={"hidden"}
        fontSize={14}
        sx={{
          display: "-webkit-box",
          // WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item?.preview}
      </Typography>

      {/* Footer: Date and Attachments */}
      <Box display={"flex"} gap={3} alignItems={"center"}>
        <Box display={"flex"} gap={0.5} alignItems={"center"}>
          <img src={dateIcon} />
          <Typography fontWeight={500} variant="caption" color="text.secondary">
            {item?.date}
          </Typography>
        </Box>

        <Box gap={0.5} display={"flex"} alignItems={"center"}>
          <img src={attachedIcon} />
          <Typography variant="caption" fontWeight={500} color="text.secondary">
            {item?.attachments}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default MessageCard;
