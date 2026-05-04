// RecentActivityCard.jsx  ← reusable component
import React from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";

const RecentActivityCard = ({ item }) => {
  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      p: "12px 16px",
      borderRadius: "14px",
      bgcolor: "#F6F6F6",
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
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
        <Box>
          <Typography fontSize={14} fontWeight={600} color="text.primary">
            {item?.name}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {item?.action}{" "}
            <Box component="span" fontWeight={700} color="text.primary">
              {item?.target}
            </Box>
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