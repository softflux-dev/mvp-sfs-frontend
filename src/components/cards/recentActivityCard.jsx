// RecentActivityCard.jsx  ← reusable component
import React from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";

const RecentActivityCard = ({ item, onClick }) => {
  const clickable = typeof onClick === "function";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: "12px 16px",
        borderRadius: "14px",
        bgcolor: "#F6F6F6",
        cursor: clickable ? "pointer" : "default",
        transition: "background-color 0.15s",
        "&:hover": clickable ? { bgcolor: "#EFEFEF" } : undefined,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
        <Avatar
          src={item?.avatar}
          sx={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: 14, fontWeight: 700,
          }}
        >
          {!item?.avatar && item?.name?.charAt(0)}
        </Avatar>
        <Box minWidth={0}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Typography fontSize={14} fontWeight={600} color="text.primary">
              {item?.name}
            </Typography>
            {item?.role && (
              <Typography
                component="span"
                fontSize="11px"
                fontWeight={600}
                sx={{ backgroundColor: "#F0E8FA", color: "#AA2493", px: 1, py: 0.25, borderRadius: "8px", lineHeight: 1.6 }}
              >
                {item.role}
              </Typography>
            )}
          </Stack>
          <Typography fontSize={12} color="text.secondary" sx={{ wordBreak: "break-word" }}>
            {item?.action}{" "}
            <Box component="span" fontWeight={700} color="text.primary">
              {item?.target}
            </Box>
            {item?.taskId && (
              <Box component="span" color="text.secondary">{` (${item.taskId})`}</Box>
            )}
          </Typography>
        </Box>
      </Stack>
      <Typography fontSize={11} color="text.secondary" whiteSpace="nowrap" ml={2}>
        {item?.time}
      </Typography>
    </Box>
  );
};

export default RecentActivityCard;