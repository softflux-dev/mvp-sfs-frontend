// performanceTabs/delayedTasks.jsx
import React from "react";
import { Box, Typography, Stack, Chip, styled, CircularProgress } from "@mui/material";

const ScrollContainer = styled(Box)({
  maxHeight: "400px",
  overflowY: "auto",
  paddingRight: "4px",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const DelayedTasks = ({ tasks = [], loading = false }) => {
  return (
    <Box sx={{
      bgcolor: "#fff", borderRadius: "25px",
      p: { xs: "16px", md: "24px" }, height: "100%",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography fontSize="18px" fontWeight={600} color="text.primary">
          Overdue Tasks{" "}
          <Typography component="span" fontSize="18px" fontWeight={600} color="text.primary">
            ({tasks.length})
          </Typography>
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={24} sx={{ color: "#AA2493" }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography fontSize={13} color="text.secondary">No overdue tasks 🎉</Typography>
        </Box>
      ) : (
        <ScrollContainer>
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#F9F9F9", borderRadius: "14px",
                  p: "14px 16px",
                }}
              >
                <Box>
                  <Typography fontSize={13} fontWeight={600} color="text.primary">
                    {task.title}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary" mt={0.25}>
                    {task.assignee}
                  </Typography>
                </Box>
                <Chip
                  label={`${task.daysOverdue}d overdue`}
                  size="small"
                  sx={{
                    bgcolor: "#FF00001A",
                    color: "#FF0000",
                    fontSize: 11,
                    fontWeight: 600,
                    height: 24,
                    borderRadius: "8px",
                    "& .MuiChip-label": { px: 1.5 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </ScrollContainer>
      )}
    </Box>
  );
};

export default DelayedTasks;