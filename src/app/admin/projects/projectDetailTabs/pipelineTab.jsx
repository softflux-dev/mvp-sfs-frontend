import { useState, useEffect }                    from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { useNavigate }                            from "react-router-dom";
import { DragDropContext, Droppable, Draggable }  from "@hello-pangea/dnd";
import CheckIcon  from "@mui/icons-material/Check";
import CloseIcon  from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import PipelineCard              from "../../../../components/cards/pipelineCard";
import { useTask }               from "../../../../hooks/task";
import { updateProjectStagesApi } from "../../../../api/modules/project";

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const PipelineTab = ({ project = {}, stages = DEFAULT_STAGES, onStagesChange }) => {
  const navigate = useNavigate();
  const { tasks, loading, updateTask } = useTask(project.id);

  const [columns,      setColumns]      = useState([]);
  const [editingId,    setEditingId]    = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [savingStages, setSavingStages] = useState(false);

  // ── Build columns from stages + tasks ────────────────────────────────────
 useEffect(() => {
  const knownStageIds = new Set(stages.map((s) => s.id));

  setColumns(
    stages.map((stage, index) => ({
      ...stage,
      tasks: tasks
        .filter((t) => {
          if (t.status === stage.id) return true;
          if (index === 0 && !knownStageIds.has(t.status)) return true;
          return false;
        })
        .map((t) => ({
          id:             t._id,
          title:          t.title,
          priority:       t.priority
            ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
            : "Medium",
          deadline:       t.endDate
            ? new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          assignees:      t.assignees      || [],
          assigneeName:   t.assignees?.[0]?.fullName || "",
          assigneeAvatar: t.assignees?.[0]?.avatar   || "",
          module:         t.module?.title  || "",
          description:    t.description   || "",
          project:        project.projectName || "",
          status:         t.status,
          comments:       t.commentCount        || 0,
          attachments:    t.attachments?.length || 0,
        })),
    }))
  );
}, [tasks, stages, project.projectName]);

  // ── Start editing a stage label ───────────────────────────────────────────
  const startEdit = (stage) => {
    setEditingId(stage.id);
    setEditingLabel(stage.label);
  };

  // ── Confirm stage label edit and save to backend ──────────────────────────
  const confirmEdit = async () => {
    if (!editingLabel.trim()) { cancelEdit(); return; }

    const updated = stages.map((s) =>
      s.id === editingId ? { ...s, label: editingLabel.trim() } : s
    );

    setSavingStages(true);
    try {
      const res = await updateProjectStagesApi(project.id, updated);
      if (res?.status === 200 || res?.status === 201) {
        onStagesChange?.(updated);
      }
    } catch {
      // silently keep local update even if save fails
      onStagesChange?.(updated);
    } finally {
      setSavingStages(false);
      setEditingId(null);
    }
  };

  const cancelEdit = () => setEditingId(null);

  // ── Drag end ──────────────────────────────────────────────────────────────
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

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns((prev) =>
        prev.map((c) =>
          c.id === source.droppableId ? { ...c, tasks: sourceTasks } : c
        )
      );
    } else {
      const destTasks   = [...destCol.tasks];
      const updatedTask = { ...movedTask, status: destination.droppableId };
      destTasks.splice(destination.index, 0, updatedTask);
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id === source.droppableId)      return { ...c, tasks: sourceTasks };
          if (c.id === destination.droppableId) return { ...c, tasks: destTasks   };
          return c;
        })
      );
      await updateTask(draggableId, { status: destination.droppableId });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{
          mt: 2, display: "flex", alignItems: "stretch",
          gap: 2, overflowX: "auto", pb: 2,
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
                  minWidth: "220px", flex: "1 0 220px",
                  backgroundColor: snapshot.isDraggingOver ? "#EDE9F6" : "#F5F5F5",
                  borderRadius: "16px", p: 2,
                  display: "flex", flexDirection: "column", gap: 1.5,
                  transition: "background-color 0.2s ease", alignSelf: "stretch",
                }}
              >
                {/* ── Column header ─────────────────────────────────────── */}
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  {editingId === col.id ? (
                    <>
                      <TextField
                        autoFocus
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")  confirmEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        size="small"
                        variant="standard"
                        sx={{
                          flex: 1,
                          "& .MuiInput-root": { fontSize: "13px", fontWeight: 600 },
                          "& .MuiInput-underline:after": { borderBottomColor: "#AA2493" },
                        }}
                      />
                      <IconButton
                        size="small" onClick={confirmEdit} disabled={savingStages}
                        sx={{ p: 0.3, color: "#059669" }}
                      >
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small" onClick={cancelEdit}
                        sx={{ p: 0.3, color: "#DC2626" }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography fontSize="13px" fontWeight={600} color="text.primary">
                        {col.label}{" "}
                        <Typography component="span" fontSize="12px" fontWeight={500} color="text.secondary">
                          ({col.tasks.length})
                        </Typography>
                      </Typography>
                      <Box
                        onClick={() => startEdit(col)}
                        sx={{ ml: 0.5, cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: "14px" }} />
                      </Box>
                    </>
                  )}
                </Box>

                {/* ── Task cards ────────────────────────────────────────── */}
                {loading && col.tasks.length === 0 && (
                  <Typography fontSize="12px" color="text.secondary" textAlign="center" py={2}>
                    Loading...
                  </Typography>
                )}

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

                {!loading && col.tasks.length === 0 && (
                  <Typography
                    fontSize="12px" color="text.secondary"
                    textAlign="center" py={2} sx={{ opacity: 0.6 }}
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