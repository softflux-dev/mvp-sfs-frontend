import { useState, useEffect } from "react";
import { Box, Typography, Avatar, AvatarGroup, Chip } from "@mui/material";
import { useNavigate }   from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import PipelineCard      from "../../../../components/cards/pipelineCard";
import { useTask }       from "../../../../hooks/task";         // ← same hook as TasksTab

const COLUMNS = [
  { id: "planning",    label: "Planning"    },
  { id: "development", label: "Development" },
  { id: "testing",     label: "Testing"     },
  { id: "review",      label: "Review"      },
  { id: "completed",   label: "Completed"   },
];

const PipelineTab = ({ project = {} }) => {
  const navigate = useNavigate();

  const { tasks, loading, updateTask } = useTask(project.id);

  // ── Build columns from real tasks ─────────────────────────────────────────
  const [columns, setColumns] = useState(
    COLUMNS.map((col) => ({ ...col, tasks: [] }))
  );

  const [editingColId, setEditingColId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  // sync columns whenever tasks change
  useEffect(() => {
    setColumns(
      COLUMNS.map((col) => ({
        ...col,
        tasks: tasks
          .filter((t) => t.status === col.id)
          .map((t) => ({
            id:           t._id,
            title:        t.title,
            priority:     t.priority
              ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
              : "Medium",
            deadline:     t.endDate
              ? new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "",
            assignees:    t.assignees || [],
            assigneeName: t.assignees?.[0]?.fullName || "",
            assigneeAvatar: t.assignees?.[0]?.avatar || "",
            module:       t.module?.title || "",
            description:  t.description  || "",
            project:      project.projectName || "",
            status:       t.status,
            comments:    t.commentCount        || 0,
            attachments: t.attachments?.length || 0,
          })),
      }))
    );
  }, [tasks, project.projectName]);

  // ── Drag end — update task status via API ─────────────────────────────────
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index       === destination.index
    ) return;

    const sourceCol = columns.find((c) => c.id === source.droppableId);
    const destCol   = columns.find((c) => c.id === destination.droppableId);

    const sourceTasks = [...sourceCol.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // ── Optimistic update ───────────────────────────────────────────────
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns((prev) =>
        prev.map((c) =>
          c.id === source.droppableId ? { ...c, tasks: sourceTasks } : c
        )
      );
    } else {
      const destTasks = [...destCol.tasks];
      const updatedTask = { ...movedTask, status: destination.droppableId };
      destTasks.splice(destination.index, 0, updatedTask);
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id === source.droppableId)      return { ...c, tasks: sourceTasks };
          if (c.id === destination.droppableId) return { ...c, tasks: destTasks   };
          return c;
        })
      );

      // ── Persist new status to backend ───────────────────────────────
      await updateTask(draggableId, { status: destination.droppableId });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minWidth: "220px",
                  flex: "1 0 220px",
                  backgroundColor: snapshot.isDraggingOver ? "#EDE9F6" : "#F5F5F5",
                  borderRadius: "16px",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "background-color 0.2s ease",
                  alignSelf: "stretch",
                }}
              >
                {/* Column header */}
                {editingColId === col.id ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onBlur={() => {
                        setColumns((prev) =>
                          prev.map((c) =>
                            c.id === col.id
                              ? { ...c, label: editingLabel || c.label }
                              : c
                          )
                        );
                        setEditingColId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")  e.target.blur();
                        if (e.key === "Escape") setEditingColId(null);
                      }}
                      style={{
                        fontSize: "13px", fontWeight: 600,
                        border: "none", borderBottom: "1.5px solid #7C3AED",
                        outline: "none", background: "transparent",
                        width: "100%", padding: "1px 2px", color: "#000",
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {col.label}{" "}
                      <Typography component="span" fontSize="12px" fontWeight={500} color="text.secondary">
                        ({col.tasks.length})
                      </Typography>
                    </Typography>
                    <Box
                      onClick={() => { setEditingColId(col.id); setEditingLabel(col.label); }}
                      sx={{ ml: 0.5, cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: "14px" }} />
                    </Box>
                  </Box>
                )}

                {/* Loading state */}
                {loading && col.tasks.length === 0 && (
                  <Typography fontSize="12px" color="text.secondary" textAlign="center" py={2}>
                    Loading...
                  </Typography>
                )}

                {/* Task cards */}
                {col.tasks.map((task, index) => (
                  <Draggable draggableId={task.id} index={index} key={task.id}>
                    {(dragProvided, dragSnapshot) => (
                      <Box
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        sx={{
                          opacity:    dragSnapshot.isDragging ? 0.85 : 1,
                          transform:  dragSnapshot.isDragging ? "rotate(2deg)" : "none",
                          transition: "transform 0.1s ease",
                        }}
                      >
                        <PipelineCard
                          title={task.title}
                          priority={task.priority}
                          deadline={task.deadline}
                          assigneeName={task.assigneeName}
                          assignee={task.assigneeAvatar}
                          project={task.project}
                          comments={task.comments}
                          attachments={task.attachments}
                          // extra: show all assignees stacked
                          assignees={task.assignees}
                          onClick={() =>
                            navigate(`/projects/tasks/${task.id}`, {
                              state: { task, canEdit: true },
                            })
                          }
                        />
                      </Box>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}

                {/* Empty state */}
                {!loading && col.tasks.length === 0 && (
                  <Typography
                    fontSize="12px" color="text.secondary"
                    textAlign="center" py={2}
                    sx={{ opacity: 0.6 }}
                  >
                    No tasks
                  </Typography>
                )}
              </Box>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default PipelineTab;