import { Box, Typography, Stack } from "@mui/material";
import { Clock } from "lucide-react";

// ── Mock delayed tasks ─────────────────────────────────────────────────────
// Swap this with real data when available.
// Each item: { id, taskName, assignee, project, dueDate, daysOverdue }
const delayedTasksData = [];

const DelayedTasks = ({ tasks = delayedTasksData }) => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={3}>
        Delayed Tasks
      </Typography>

      {tasks.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex={1}
          minHeight="240px"
        >
          <Typography fontSize="14px" color="text.secondary">
            No delayed tasks 🎉
          </Typography>
        </Box>
      ) : (
        /* ── Task list ───────────────────────────────────────────────────── */
        <Stack spacing={1.5} sx={{ overflowY: "auto", maxHeight: "280px" }}>
          {tasks.map((task) => (
            <Box
              key={task.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: "10px 14px",
                borderRadius: "12px",
                backgroundColor: "#FFF5F5",
                border: "1px solid #FECACA",
              }}
            >
              <Box>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">
                  {task.taskName}
                </Typography>
                <Typography fontSize="11px" color="text.secondary" mt={0.3}>
                  {task.assignee} · {task.project}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                <Clock size={13} color="#DC2626" />
                <Typography fontSize="12px" fontWeight={600} color="#DC2626">
                  {task.daysOverdue}d overdue
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default DelayedTasks;