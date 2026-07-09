// src/app/projectManagerPortal/taskManagement/kanbanView.jsx 
import { useState, useEffect, useRef }            from "react";
import { Box, Typography }                        from "@mui/material";
import { useNavigate }                            from "react-router-dom";
import { DragDropContext, Droppable, Draggable }  from "@hello-pangea/dnd";

import PipelineCard       from "../../../components/cards/pipelineCard";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SubmitWorkDialog   from "../../empPortal/myTasks/submitWorkDialog";
import { updateTaskApi, submitWorkApi } from "../../../api/modules/task";

const KanbanView = ({ tasks = [], stages = [], onTaskStatusUpdated }) => {
  const navigate = useNavigate();

  const [columns,      setColumns]      = useState([]);
  const [pendingDrag,  setPendingDrag]  = useState(null);
  const [submitOpen,   setSubmitOpen]   = useState(false);
  const [submitLoading,setSubmitLoading]= useState(false);
  const confirmRef = useRef();

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
    // drag.projectId needs to be set when creating pendingDrag
    await updateTaskApi(drag.projectId, drag.taskId, { status: drag.destId });
    onTaskStatusUpdated?.();
  } catch (err) {
    console.error("Status update failed:", err.message);
    setColumns(KANBAN_COLUMNS.map((col) => ({ ...col, tasks: tasks.filter((t) => t.status === col.id) })));
  }
};

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === destination.droppableId) {
      const col      = columns.find((c) => c.id === source.droppableId);
      const colTasks = [...col.tasks];
      const [moved]  = colTasks.splice(source.index, 1);
      colTasks.splice(destination.index, 0, moved);
      setColumns((prev) => prev.map((c) => c.id === source.droppableId ? { ...c, tasks: colTasks } : c));
      return;
    }

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
      description: `Moving "${drag.taskTitle}" from ${stageLabel(drag.srcId)} → ${stageLabel(drag.destId)}. Do you want to submit work first?`,
      confirmText: "Yes, Submit Work",
      cancelText:  "No, Just Move",
      onConfirm: () => setSubmitOpen(true),
      onCancel:  async () => {
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {col.label}{" "}
                      <Typography component="span" fontSize="12px" fontWeight={500} color="text.secondary">
                        ({col.tasks.length})
                      </Typography>
                    </Typography>
                  </Box>

                  {col.tasks.map((task, index) => (
                    <Draggable draggableId={String(task.id || task._id)} index={index} key={String(task.id || task._id)}>
                      {(dragProvided, dragSnapshot) => (
                        <Box
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          sx={{ opacity: dragSnapshot.isDragging ? 0.85 : 1, transform: dragSnapshot.isDragging ? "rotate(2deg)" : "none", transition: "transform 0.1s ease" }}
                        >
                          <PipelineCard
                            title={task.task || task.title} priority={task.priority}
                            deadline={task.endDate} comments={task.comments}
                            attachments={task.attachments} assignees={task.assignees}
                            project={task.projectName || task.project?.projectName || task.project || ""}
                            onClick={() => navigate(`/pm-tasks/${task.id || task._id}`, {
                              state: { task, canEdit: true, role: "pm" },
                            })}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
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

export default KanbanView;