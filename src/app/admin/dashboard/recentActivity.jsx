// RecentActivity.jsx
import React from "react";
import { Box, Typography, Stack, CircularProgress, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RecentActivityCard from "../../../components/cards/recentActivityCard";

const ScrollContainer = styled(Box)({
  maxHeight: "800px",
  overflowY: "auto",
  paddingRight: "4px",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const RecentActivity = ({ activity = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Recent Activity
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} py={4}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : activity.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} py={4}>
          <Typography fontSize={13} color="text.secondary">No recent activity.</Typography>
        </Box>
      ) : (
        <ScrollContainer>
          <Stack spacing={1.5}>
            {activity.map((item) => (
              <RecentActivityCard
                key={item.id}
                item={item}
                onClick={item.taskDocId ? () => navigate(`/projects/tasks/${item.taskDocId}`) : undefined}
              />
            ))}
          </Stack>
        </ScrollContainer>
      )}
    </Box>
  );
};

export default RecentActivity;