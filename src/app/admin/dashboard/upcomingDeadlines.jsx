// UpcomingDeadlines.jsx
import React from "react";
import { Box, Typography, Stack, Chip, styled } from "@mui/material";

const ScrollContainer = styled(Box)({
  maxHeight: "400px",
  overflowY: "auto",
  paddingRight: "4px",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const priorityConfig = {
  High: { bg: "#FF00001A", color: "#FF0000" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low: { bg: "#04C3731A", color: "#04C373" },
};

const DeadlineRow = ({ item }) => {
  const priority = priorityConfig[item.priority] || priorityConfig.Medium;
  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      p: "14px 16px",
      borderRadius: "14px",
      bgcolor: "#F6F6F6",
    }}>
      <Box>
        <Typography fontSize={14} fontWeight={600} color="text.primary">
          {item.title}
        </Typography>
        <Typography fontSize={12} color="text.secondary">
          {item.assignee} · {item.project}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Chip
          label={item.priority}
          size="small"
          sx={{
            bgcolor: priority.bg,
            color: priority.color,
            fontSize: 11,
            fontWeight: 600,
            height: 24,
            fontFamily: '"Poppins", sans-serif',
          }}
        />
        <Typography fontSize={12} color="text.secondary" whiteSpace="nowrap">
          {item.date}
        </Typography>
      </Stack>
    </Box>
  );
};

const deadlinesData = [
  { id: 1, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High", date: "Mar 9" },
  { id: 2, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "Medium", date: "Mar 9" },
  { id: 3, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High", date: "Mar 9" },
  { id: 4, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High", date: "Mar 9" },
  { id: 5, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High", date: "Mar 9" },
  { id: 6, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "Medium", date: "Mar 9" },
  { id: 7, title: "Mobile Responsive Design", assignee: "Omar Farooq", project: "CMS Website Redesign", priority: "High", date: "Mar 9" },
];

const UpcomingDeadlines = () => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      padding: { xs: "16px", md: "24px" },
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          Upcoming Deadlines
        </Typography>
        <Typography
          fontSize={13} fontWeight={600}
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

      <ScrollContainer>
        <Stack spacing={1.5}>
          {deadlinesData.map((item) => (
            <DeadlineRow key={item.id} item={item} />
          ))}
        </Stack>
      </ScrollContainer>
    </Box>
  );
};

export default UpcomingDeadlines;