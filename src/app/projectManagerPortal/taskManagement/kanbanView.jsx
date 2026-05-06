import { Box, Typography } from "@mui/material";
import PipelineCard from "../../../components/cards/pipelineCard";
import { mockTasks, KANBAN_COLUMNS } from "./mockTasks";

const KanbanView = ({ tasks = mockTasks }) => {
  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        overflowX: "auto",
        pb: 2,
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#E0E0E0", borderRadius: "3px" },
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <Box
            key={col.id}
            sx={{
              minWidth: "220px",
              flex: "1 0 220px",
              backgroundColor: "#F5F5F5",
              borderRadius: "16px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              minHeight: "800px",
              alignSelf: "stretch",
            }}
          >
            <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={0.5}>
              {col.label}{" "}
              <Typography component="span" fontSize="12px" fontWeight={500} color="text.secondary">
                ({colTasks.length})
              </Typography>
            </Typography>

           {colTasks.map((task) => (
            <PipelineCard
                key={task.id}
                title={task.title}
                priority={task.priority}
                deadline={task.deadline}
                comments={task.comments}
                attachments={task.attachments}
                assigneeName={task.assigneeName}
                assignee={task.assigneeAvatar || ""}
                project={task.project}
            />
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default KanbanView;