// projectDetailTabs/planFlowchartSteps.jsx
// Controlled: parent owns `steps` ([{ id, label }]) and gets updates via onChange.
import { Box, TextField, IconButton, Typography } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const PlanFlowchartSteps = ({ steps = [], onChange, editable = true }) => {
  const setSteps = (next) => onChange?.(next);

  const handleLabel = (id, label) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, label } : s)));

  const handleDelete = (id) => setSteps(steps.filter((s) => s.id !== id));

  const handleAdd = () => setSteps([...steps, { id: uid(), label: "" }]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;
    const next = [...steps];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setSteps(next);
  };

  if (!steps.length) {
    return (
      <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 3, textAlign: "center" }}>
        <Typography fontSize={13} color="text.secondary">
          No workflow steps yet.
        </Typography>
        {editable && (
          <Box
            onClick={handleAdd}
            sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                  color: "#AA2493", fontSize: 13, fontWeight: 600 }}
          >
            <AddIcon sx={{ fontSize: 16 }} /> Add step
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="flow" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ display: "flex", alignItems: "center", gap: 1, overflowX: "auto", pb: 1,
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#E0E0E0", borderRadius: 3 } }}
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index} isDragDisabled={!editable}>
                  {(dp, snap) => (
                    <Box ref={dp.innerRef} {...dp.draggableProps}
                      sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <Box
                        sx={{
                          display: "flex", alignItems: "center", gap: 0.5,
                          backgroundColor: "#fff", border: "1px solid #E5E7EB",
                          borderRadius: "10px", px: 1, py: 0.75, minWidth: 150,
                          opacity: snap.isDragging ? 0.9 : 1,
                          boxShadow: snap.isDragging ? "0 4px 14px rgba(0,0,0,0.08)" : "none",
                        }}
                      >
                        {editable && (
                          <Box {...dp.dragHandleProps} sx={{ display: "flex", color: "#9CA3AF", cursor: "grab" }}>
                            <DragIndicatorIcon sx={{ fontSize: 16 }} />
                          </Box>
                        )}
                        <TextField
                          value={step.label}
                          onChange={(e) => handleLabel(step.id, e.target.value)}
                          placeholder="Step"
                          variant="standard"
                          disabled={!editable}
                          InputProps={{ disableUnderline: true }}
                          sx={{ flex: 1, "& input": { fontSize: 13, fontWeight: 500, p: 0 } }}
                        />
                        {editable && (
                          <IconButton size="small" onClick={() => handleDelete(step.id)}
                            sx={{ p: 0.2, color: "#D1D5DB", "&:hover": { color: "#DC2626" } }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                      </Box>
                      {index < steps.length - 1 && (
                        <ArrowForwardIcon sx={{ fontSize: 18, color: "#9CA3AF", mx: 0.5 }} />
                      )}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {editable && (
        <Box
          onClick={handleAdd}
          sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                color: "#AA2493", fontSize: 13, fontWeight: 600 }}
        >
          <AddIcon sx={{ fontSize: 16 }} /> Add step
        </Box>
      )}
    </Box>
  );
};

export default PlanFlowchartSteps;