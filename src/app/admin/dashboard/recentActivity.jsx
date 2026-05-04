// RecentActivity.jsx
import React from "react";
import { Box, Typography, Stack, styled } from "@mui/material";
import RecentActivityCard from "../../../components/cards/recentActivityCard";

const ScrollContainer = styled(Box)({
  flex: 1,
  overflowY: "auto",
  paddingRight: "4px",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const activityData = [
  { id: 1, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 2, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 3, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 4, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 5, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 6, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 7, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 8, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  { id: 9, name: "Ali Hassan", action: "marked Build API as Completed", target: "E-Commerce Platform", time: "2 hours ago", avatar: "" },
  
];

const RecentActivity = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",         // ← stretch to match left column
      display: "flex",
      flexDirection: "column",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Recent Activity
        </Typography>
        <Typography
          fontSize={13}
          fontWeight={600}
          sx={{
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            cursor: "pointer",
          }}
        >
          View All
        </Typography>
      </Box>

      {/* Scrollable list grows to fill remaining height */}
      <ScrollContainer>
        <Stack spacing={1.5}>
          {activityData.map((item) => (
            <RecentActivityCard key={item.id} item={item} />
          ))}
        </Stack>
      </ScrollContainer>
    </Box>
  );
};

export default RecentActivity;