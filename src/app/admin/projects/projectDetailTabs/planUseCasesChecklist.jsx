// projectDetailTabs/planUseCasesChecklist.jsx
// Draggable + checkable + editable use cases, each expandable with an
// AI-generated implementation detail. Controlled by the parent.
// Item: { id, title, description, checked, details }.
import { useState } from "react";
import { Box, TextField, IconButton, Checkbox, Typography, CircularProgress } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const isChecked = (u) => u.checked !== false;

const PlanUseCasesChecklist = ({ useCases = [], onChange, editable = true, onDetail }) => {
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const setCases = (next) => onChange?.(next);
  const setField = (id, field, value) =>
    setCases(useCases.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  const toggle = (id) =>
    setCases(useCases.map((u) => (u.id === id ? { ...u, checked: !isChecked(u) } : u)));
  const remove = (id) => setCases(useCases.filter((u) => u.id !== id));
  const add = () =>
    setCases([...useCases, { id: uid(), title: "", description: "", checked: true, details: "" }]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;
    const next = [...useCases];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setCases(next);
  };

  const handleDetail = async (u) => {
    if (!onDetail || !u.title?.trim()) return;
    setBusyId(u.id);
    const res = await onDetail(u);      // parent stores details on the use case
    setBusyId(null);
    if (res?.success) setOpenId(u.id);  // auto-expand to show it
  };

  return (
    <Box>
      {useCases.length === 0 ? (
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "10px", p: 2, textAlign: "center" }}>
          <Typography fontSize={13} color="text.secondary">No use cases yet.</Typography>
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="usecases">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {useCases.map((u, index) => {
                  const checked = isChecked(u);
                  const open = openId === u.id;
                  const busy = busyId === u.id;
                  return (
                    <Draggable key={u.id} draggableId={u.id} index={index} isDragDisabled={!editable}>
                      {(dp, snap) => (
                        <Box ref={dp.innerRef} {...dp.draggableProps}
                          sx={{ backgroundColor: "#fff",
                                border: `1px solid ${checked ? "#E9D5FF" : "#E5E7EB"}`,
                                borderRadius: "10px", px: 1, py: 1,
                                opacity: checked ? 1 : 0.6,
                                boxShadow: snap.isDragging ? "0 4px 14px rgba(0,0,0,0.08)" : "none" }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            {editable && (
                              <Box {...dp.dragHandleProps}
                                sx={{ display: "flex", color: "#9CA3AF", cursor: "grab", mt: 0.75 }}>
                                <DragIndicatorIcon sx={{ fontSize: 18 }} />
                              </Box>
                            )}
                            <Checkbox checked={checked} disabled={!editable} onChange={() => toggle(u.id)}
                              sx={{ p: 0.5, mt: 0.25, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" } }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <TextField value={u.title}
                                onChange={(e) => setField(u.id, "title", e.target.value)}
                                placeholder="Use case title" variant="standard" disabled={!editable}
                                InputProps={{ disableUnderline: true }}
                                sx={{ width: "100%", "& input": { fontSize: 13, fontWeight: 500 } }} />
                              <TextField value={u.description}
                                onChange={(e) => setField(u.id, "description", e.target.value)}
                                placeholder="Short description" variant="standard" disabled={!editable} multiline
                                InputProps={{ disableUnderline: true }}
                                sx={{ width: "100%", "& textarea": { fontSize: 12, color: "#6B7280" } }} />
                            </Box>

                            {/* Detail with AI */}
                            <Box onClick={() => !busy && handleDetail(u)}
                              title="Ask AI for a detailed implementation"
                              sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5,
                                    px: 1, py: 0.5, borderRadius: "8px", cursor: busy ? "default" : "pointer",
                                    color: "#AA2493", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                                    "&:hover": { backgroundColor: "#AA24930F" } }}>
                              {busy
                                ? <CircularProgress size={13} sx={{ color: "#AA2493" }} />
                                : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                              {u.details ? "Redo detail" : "Detail with AI"}
                            </Box>

                            {(u.details || busy) && (
                              <IconButton size="small" onClick={() => setOpenId(open ? null : u.id)}
                                sx={{ p: 0.3, mt: 0.4, transform: open ? "rotate(180deg)" : "none",
                                      transition: "transform 0.2s" }}>
                                <ExpandMoreIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                              </IconButton>
                            )}

                            {editable && (
                              <IconButton size="small" onClick={() => remove(u.id)}
                                sx={{ p: 0.3, mt: 0.4, color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                          </Box>

                          {/* AI detail panel */}
                          {open && u.details && (
                            <Box sx={{ mt: 1, mx: 1, p: 1.5, backgroundColor: "#F9FAFB",
                                       borderRadius: "8px", border: "1px solid #F0F0F0" }}>
                              <Typography component="pre"
                                sx={{ m: 0, fontFamily: "inherit", fontSize: 12.5, color: "#374151",
                                      whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
                                {u.details}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editable && (
        <Box onClick={add}
          sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                color: "#AA2493", fontSize: 13, fontWeight: 600 }}>
          <AddIcon sx={{ fontSize: 16 }} /> Add use case
        </Box>
      )}
    </Box>
  );
};

export default PlanUseCasesChecklist;