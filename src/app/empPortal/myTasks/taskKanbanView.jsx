// src/app/empPortal/myTasks/taskKanbanView.jsx — FULL REPLACEMENT
// Same pattern as PM kanbanView — uses stages prop as column definitions

import { useState, useEffect, useRef }           from "react";
import { Box, Typography }                       from "@mui/material";
import { useNavigate }                           from "react-router-dom";
import { DragDropContext, Droppable, Draggable }  from "@hello-pangea/dnd";

import PipelineCard       from "../../../components/cards/pipelineCard";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SubmitWorkDialog   from "./submitWorkDialog";
import { updateTaskStatusApi, submitWorkApi } from "../../../api/modules/task";


const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const TaskKanbanView = ({ tasks = [], loading, stages = DEFAULT_STAGES, onTaskStatusUpdated }) => {
  const navigate   = useNavigate();
  const confirmRef = useRef();

  const [columns,       setColumns]      = useState([]);
  const [pendingDrag,   setPendingDrag]  = useState(null);
  const [submitOpen,    setSubmitOpen]   = useState(false);
  const [submitLoading, setSubmitLoading]= useState(false);

  // ── Build columns from stages prop — same as PM KanbanView ───────────────
  useEffect(() => {
    if (!stages.length) return;
    setColumns(
      stages.map((stage) => ({
        ...stage,
        tasks: tasks.filter((t) => t.status === stage.id),
      }))
    );
  }, [tasks, stages]);

  const stageLabel = (id) => stages.find((s) => s.id === id)?.label || id;

  const applyMove = async (drag) => {
    try {
       await updateTaskStatusApi(drag.taskId, drag.destId); 
      onTaskStatusUpdated?.();
    } catch (err) {
      console.error("Status update failed:", err.message);
      // Revert optimistic update
      setColumns(
        stages.map((stage) => ({
          ...stage,
          tasks: tasks.filter((t) => t.status === stage.id),
        }))
      );
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Same column reorder
    if (source.droppableId === destination.droppableId) {
      const col      = columns.find((c) => c.id === source.droppableId);
      const colTasks = [...col.tasks];
      const [moved]  = colTasks.splice(source.index, 1);
      colTasks.splice(destination.index, 0, moved);
      setColumns((prev) => prev.map((c) => c.id === source.droppableId ? { ...c, tasks: colTasks } : c));
      return;
    }

    // Cross-column — optimistic UI
    const srcCol    = columns.find((c) => c.id === source.droppableId);
    const destCol   = columns.find((c) => c.id === destination.droppableId);
    const movedTask = srcCol.tasks[source.index];

    const srcTasks  = [...srcCol.tasks];
    srcTasks.splice(source.index, 1);
    const destTasks = [...destCol.tasks];
    destTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId });
    setColumns((prev) => prev.map((c) => {
      if (c.id === source.droppableId)      return { ...c, tasks: srcTasks };
      if (c.id === destination.droppableId) return { ...c, tasks: destTasks };
      return c;
    }));

    const drag = {
      taskId:    String(draggableId || movedTask._id || movedTask.id),
      taskTitle: movedTask.title || movedTask.task || "",
      projectId: movedTask.projectId || movedTask.project?._id || movedTask.project || "",
      srcId:     source.droppableId,
      destId:    destination.droppableId,
    };
    setPendingDrag(drag);

    confirmRef.current?.open({
      title:       "Submit Work?",
      description: `Moving "${drag.taskTitle}" from "${stageLabel(drag.srcId)}" → "${stageLabel(drag.destId)}". Do you want to submit work first?`,
      confirmText: "Yes, Submit Work",
      cancelText:  "No, Just Move",
      onConfirm:   () => setSubmitOpen(true),
      onCancel:    async () => {
        await applyMove(drag);
        setPendingDrag(null);
      },
    });
  };

  const handleWorkSubmit = async (formData) => {
    if (!pendingDrag) return;
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append("title",       formData.title       || "");
      fd.append("description", formData.description || "");
      fd.append("link",        formData.link        || "");
      if (formData.attachments) fd.append("file", formData.attachments);
      await submitWorkApi(pendingDrag.taskId, fd);
    } catch (err) {
      console.error("Submit work failed:", err.message);
    } finally {
      setSubmitLoading(false);
      setSubmitOpen(false);
      await applyMove(pendingDrag);
      setPendingDrag(null);
    }
  };

  const handleSubmitClose = async () => {
    setSubmitOpen(false);
    if (pendingDrag) {
      await applyMove(pendingDrag);
      setPendingDrag(null);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{
          mt: 2, display: "flex", alignItems: "stretch",
          gap: 2, overflowX: "auto", pb: 2,
          "&::-webkit-scrollbar": { height: "6px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#E0E0E0", borderRadius: "3px" },
        }}>
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
                  {/* Column header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {col.label}{" "}
                      <Typography component="span" fontSize="12px" fontWeight={500} color="text.secondary">
                        ({col.tasks.length})
                      </Typography>
                    </Typography>
                  </Box>

                  {loading && col.tasks.length === 0 && (
                    <Typography fontSize="12px" color="text.secondary" textAlign="center" py={2}>
                      Loading...
                    </Typography>
                  )}

                  {col.tasks.map((task, index) => (
                    <Draggable
                      draggableId={String(task._id || task.id)}
                      index={index}
                      key={String(task._id || task.id)}
                    >
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
                            title={task.title || task.task}
                            priority={task.priority}
                            deadline={task.deadline || task.endDate}
                            comments={task.comments}
                            attachments={task.attachments}
                            assigneeName={task.assigneeName || task.assignees?.[0]?.fullName || ""}
                            assignee={task.assigneeAvatar || task.assignees?.[0]?.avatar || ""}
                            assignees={task.assignees}
                            project={task.projectName || task.project || ""}
                            onClick={() =>
                              navigate(`/emp/tasks/${task._id || task.id}`, {
                                state: { task, role: "employee" },
                              })
                            }
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}

                  {!loading && col.tasks.length === 0 && (
                    <Typography fontSize="12px" color="text.secondary" textAlign="center" py={2} sx={{ opacity: 0.6 }}>
                      No tasks
                    </Typography>
                  )}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      <ConfirmationDialog ref={confirmRef} />

      <SubmitWorkDialog
        open={submitOpen}
        onClose={handleSubmitClose}
        onSave={handleWorkSubmit}
        loading={submitLoading}
        taskTitle={pendingDrag?.taskTitle || ""}
      />
    </>
  );
};

export default TaskKanbanView;