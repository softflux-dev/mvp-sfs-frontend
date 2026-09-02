// app/projectManager/teamPerformance/delayedTasks.jsx — 
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { Clock } from "lucide-react";

const DelayedTasks = ({ tasks = [], loading = false }) => {
  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={3}>
        Overdue Tasks
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} minHeight="240px">
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Box display="flex" alignItems="center" justifyContent="center" flex={1} minHeight="240px">
          <Typography fontSize="14px" color="text.secondary">No delayed tasks 🎉</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ overflowY: "auto", maxHeight: "280px" }}>
          {tasks.map((task) => (
            <Box
              key={task.id}
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 14px", borderRadius: "12px", backgroundColor: "#FFF5F5", border: "1px solid #FECACA" }}
            >
              <Box>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">{task.taskName}
                  {task.taskId && (
                    <Typography
                      component="span"
                      fontSize="11px"
                      fontWeight={600}
                      color="#AA2493"
                      sx={{ ml: 0.75, fontFamily: "monospace" }}
                    >
                      ({task.taskId})
                    </Typography>
                  )}
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