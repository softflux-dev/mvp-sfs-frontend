import { Box, Typography, Stack, Chip, styled } from "@mui/material";

const ScrollContainer = styled(Box)({
  maxHeight: "400px",
  overflowY: "auto",
  paddingRight: "4px",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const PRIORITY_CONFIG = {
  High:   { bg: "#FF00001A", color: "#FF0000" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low:    { bg: "#04C3731A", color: "#04C373" },
};

const DeadlineRow = ({ item }) => {
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.Medium;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: "14px 16px",
        borderRadius: "14px",
        bgcolor: "#F6F6F6",
      }}
    >
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

const UpcomingDeadlines = ({
  deadlines = [],
  title = "Upcoming Deadlines",
  onViewAll,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "25px",
        padding: { xs: "16px", md: "24px" },
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        
      </Box>

      <ScrollContainer>
        <Stack spacing={1.5}>
          {deadlines.map((item) => (
            <DeadlineRow key={item.id} item={item} />
          ))}
        </Stack>
      </ScrollContainer>
    </Box>
  );
};

export default UpcomingDeadlines;