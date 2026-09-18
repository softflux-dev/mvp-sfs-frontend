import { Box, Typography, Stack, Chip, Avatar, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";

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

const DeadlineRow = ({ item, onClick }) => {
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.Medium;
  const clickable = typeof onClick === "function";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: "14px 16px",
        borderRadius: "14px",
        bgcolor: "#F6F6F6",
        cursor: clickable ? "pointer" : "default",
        transition: "background-color 0.15s",
        "&:hover": clickable ? { bgcolor: "#EFEFEF" } : undefined,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0} flex={1}>
        {item.assignee && item.assignee !== "—" && (
          <Avatar
            src={item.avatar}
            sx={{
              width: 36, height: 36, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg, #AA2493, #022179)",
              flexShrink: 0,
            }}
          >
            {!item.avatar && item.assignee.charAt(0)}
          </Avatar>
        )}
        <Box minWidth={0}>
          <Typography fontSize={14} fontWeight={600} color="text.primary" sx={{ wordBreak: "break-word" }}>
            {item.title}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" mt={0.25}>
            <Typography fontSize={12} color="text.secondary">
              {item.assignee}
            </Typography>
            {item.assigneeRole && (
              <Typography
                component="span"
                fontSize="10px"
                fontWeight={600}
                sx={{ backgroundColor: "#F0E8FA", color: "#AA2493", px: 0.75, py: 0.15, borderRadius: "6px", lineHeight: 1.5 }}
              >
                {item.assigneeRole}
              </Typography>
            )}
            {item.client && item.client !== "—" && (
              <Typography fontSize={12} color="text.secondary">
                · Client: {item.client}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" flexShrink={0}>
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
        <Box textAlign="right">
          <Typography fontSize={12} color="text.secondary" whiteSpace="nowrap">
            {item.date}
          </Typography>
          {item.timeLeftLabel && (
            <Typography fontSize={11} color={item.daysLeft <= 0 ? "#FF0000" : "text.secondary"} whiteSpace="nowrap">
              {item.timeLeftLabel}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

const UpcomingDeadlines = ({
  deadlines = [],
  title = "Upcoming Deadlines",
  onViewAll,
}) => {
  const navigate = useNavigate();

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

      {deadlines.length === 0 ? (
        <Typography fontSize={13} color="text.secondary" textAlign="center" py={3}>
          No upcoming deadlines.
        </Typography>
      ) : (
        <ScrollContainer>
          <Stack spacing={1.5}>
            {deadlines.map((item) => (
              <DeadlineRow
                key={item.id}
                item={item}
                onClick={item.id ? () => navigate(`/projects/${item.id}`) : undefined}
              />
            ))}
          </Stack>
        </ScrollContainer>
      )}
    </Box>
  );
};

export default UpcomingDeadlines;