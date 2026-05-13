import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PipelineCard    from "../../../components/cards/pipelineCard";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const INITIAL_COLUMNS = [
  {
    id: "planning",
    label: "Planning",
    tasks: [
      { id: "t1", title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5, attachments: 2, assigneeName: "Sara"  },
      { id: "t2", title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5,                 assigneeName: "Jon"   },
    ],
  },
  {
    id: "development",
    label: "Development",
    tasks: [
      { id: "t3", title: "Create Ui Dashboard", priority: "Medium", deadline: "march 16", comments: 5,                 assigneeName: "Sara"  },
      { id: "t4", title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5,                 assigneeName: "Peter" },
    ],
  },
  {
    id: "testing",
    label: "Testing",
    tasks: [
      { id: "t5", title: "Create Ui Dashboard", priority: "High",   deadline: "march 16", comments: 5,                 assigneeName: "Sara"  },
    ],
  },
  {
    id: "review",
    label: "Review",
    tasks: [
      { id: "t6", title: "Create Ui Dashboard", priority: "Low",    deadline: "march 16", comments: 5,                 assigneeName: "Jon"   },
    ],
  },
  {
    id: "completed",
    label: "Completed",
    tasks: [
      { id: "t7", title: "Create Ui Dashboard", priority: "Medium", deadline: "march 16", comments: 5,                 assigneeName: "Sara"  },
    ],
  },
];

const KanbanView = ({ project = {} }) => {
   const navigate = useNavigate();
  const [columns,     setColumns]     = useState(INITIAL_COLUMNS);
  const [selectedCard,setSelectedCard]= useState(null);
  const [selectedCol, setSelectedCol] = useState("");
  const [editingColId,  setEditingColId]  = useState(null);
  const [editingLabel,  setEditingLabel]  = useState("");

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns.find((c) => c.id === source.droppableId);
    const destCol   = columns.find((c) => c.id === destination.droppableId);

    const sourceTasks = [...sourceCol.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns((prev) =>
        prev.map((c) => c.id === source.droppableId ? { ...c, tasks: sourceTasks } : c)
      );
    } else {
      const destTasks = [...destCol.tasks];
      destTasks.splice(destination.index, 0, movedTask);
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id === source.droppableId)      return { ...c, tasks: sourceTasks };
          if (c.id === destination.droppableId) return { ...c, tasks: destTasks   };
          return c;
        })
      );
    }
  };

  return (
    <>
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
                 {editingColId === col.id ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onBlur={() => {
                        setColumns((prev) =>
                          prev.map((c) => c.id === col.id ? { ...c, label: editingLabel || c.label } : c)
                        );
                        setEditingColId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.target.blur();
                        if (e.key === "Escape") setEditingColId(null);
                      }}
                      style={{
                        fontSize: "13px", fontWeight: 600, border: "none",
                        borderBottom: "1.5px solid #7C3AED", outline: "none",
                        background: "transparent", width: "100%", padding: "1px 2px",
                        color: "#000",
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
                      sx={{
                        ml: 0.5, cursor: "pointer", display: "flex", alignItems: "center",
                         
                      }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: "14px" }} />
                    </Box>
                  </Box>
                )}

                  {col.tasks.map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(dragProvided, dragSnapshot) => (
                        <Box
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          sx={{
                            opacity:   dragSnapshot.isDragging ? 0.85 : 1,
                            transform: dragSnapshot.isDragging ? "rotate(2deg)" : "none",
                            transition: "transform 0.1s ease",
                          }}
                        >
                          <PipelineCard
                            title={task.title}
                            priority={task.priority}
                            deadline={task.deadline}
                            comments={task.comments}
                            attachments={task.attachments}
                            assigneeName={task.assigneeName}
                            assignee={task.assigneeAvatar || ""}
                            project={task.project || ""}
                            onClick={() => navigate(`/pm-tasks/${task.id}`, { state: { task, canEdit: true } })}

                            

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

  
    </>
  );
};

export default KanbanView;