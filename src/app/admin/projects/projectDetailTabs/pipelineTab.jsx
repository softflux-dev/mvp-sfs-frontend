import { useState } from "react";
import { Box, Typography } from "@mui/material";
import PipelineCard from "../../../../components/cards/pipelineCard";

// ── Mock tasks grouped by status ─────────────────────────────────────────
const INITIAL_COLUMNS = [
  {
    id: "planning",
    label: "Planning",
    tasks: [
      { id: 1, title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5, assigneeName: "Sara" },
      { id: 2, title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5, assigneeName: "Jon"  },
    ],
  },
  {
    id: "development",
    label: "Development",
    tasks: [
      { id: 3, title: "Create Ui Dashboard", priority: "Medium", deadline: "march 16", comments: 5, assigneeName: "Sara" },
      { id: 4, title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5, assigneeName: "Peter"},
    ],
  },
  {
    id: "testing",
    label: "Testing",
    tasks: [
      { id: 5, title: "Create Ui Dashboard", priority: "High",   deadline: "march 16", comments: 5, assigneeName: "Sara" },
    ],
  },
  {
    id: "review",
    label: "Review",
    tasks: [
      { id: 6, title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5, assigneeName: "Jon"  },
    ],
  },
  {
    id: "completed",
    label: "Completed",
    tasks: [
      { id: 7, title: "Create Ui Dashboard", priority: "Medium", deadline: "march 16", comments: 5, assigneeName: "Sara" },
    ],
  },
];

const PipelineTab = ({ project = {} }) => {
  const [columns] = useState(INITIAL_COLUMNS);

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        gap: 2,
        overflowX: "auto",
        pb: 2,
        // Hide scrollbar but keep scroll
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#E0E0E0", borderRadius: "3px" },
      }}
    >
      {columns.map((col) => (
        <Box
          key={col.id}
          sx={{
            minWidth: "200px",
            flex: "1 0 200px",
            backgroundColor: "#F5F5F5",
            borderRadius: "16px",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minHeight: "400px",
          }}
        >
          {/* ── Column header ─────────────────────────────────────────────── */}
          <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={0.5}>
            {col.label}{" "}
            <Typography
              component="span"
              fontSize="12px"
              fontWeight={500}
              color="text.secondary"
            >
              ({col.tasks.length})
            </Typography>
          </Typography>

          {/* ── Cards ────────────────────────────────────────────────────── */}
          {col.tasks.map((task) => (
            <PipelineCard
              key={task.id}
              title={task.title}
              priority={task.priority}
              deadline={task.deadline}
              comments={task.comments}
              assigneeName={task.assigneeName}
              assignee={task.assigneeAvatar || ""}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PipelineTab;