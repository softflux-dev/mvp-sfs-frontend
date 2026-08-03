// projectDetailTabs/planUseCasesChecklist.jsx
// Draggable + checkable + editable use cases, each expandable with an
// AI-generated implementation detail. Before generating, the user can
// optionally type instructions to steer/refine what AI writes.
// Item: { id, title, description, checked, details }.
// Requires:  npm i react-markdown
import { useState } from "react";
import { Box, TextField, IconButton, Checkbox, Typography, CircularProgress } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ReactMarkdown from "react-markdown";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const isChecked = (u) => u.checked !== false;

// ── Markdown → styled elements, matched to the app's type scale ──────────────
const markdownComponents = {
  h1: ({ children }) => <Typography fontSize={15} fontWeight={700} mt={1.5} mb={0.75}>{children}</Typography>,
  h2: ({ children }) => <Typography fontSize={14} fontWeight={700} mt={1.5} mb={0.75}>{children}</Typography>,
  h3: ({ children }) => <Typography fontSize={13} fontWeight={700} mt={1.25} mb={0.5}>{children}</Typography>,
  p:  ({ children }) => <Typography fontSize={12.5} color="#374151" lineHeight={1.7} mb={1}>{children}</Typography>,
  ul: ({ children }) => <Box component="ul" sx={{ pl: 2.5, mb: 1 }}>{children}</Box>,
  ol: ({ children }) => <Box component="ol" sx={{ pl: 2.5, mb: 1 }}>{children}</Box>,
  li: ({ children }) => (
    <Typography component="li" fontSize={12.5} color="#374151" lineHeight={1.7} mb={0.4}>
      {children}
    </Typography>
  ),
  strong: ({ children }) => <Typography component="strong" fontWeight={700} fontSize="inherit">{children}</Typography>,
  code: ({ inline, children }) =>
    inline ? (
      <Typography component="code" sx={{
        fontFamily: "monospace", fontSize: 12, backgroundColor: "#F0F0F0",
        px: 0.6, py: 0.1, borderRadius: "4px", color: "#AA2493",
      }}>{children}</Typography>
    ) : (
      <Box component="pre" sx={{
        fontFamily: "monospace", fontSize: 12, backgroundColor: "#111827", color: "#F3F4F6",
        p: 1.5, borderRadius: "8px", overflowX: "auto", mb: 1,
      }}>
        <code>{children}</code>
      </Box>
    ),
  hr: () => <Box sx={{ borderTop: "1px solid #E5E7EB", my: 1.5 }} />,
};

const PlanUseCasesChecklist = ({ useCases = [], onChange, editable = true, onDetail }) => {
  const [openId, setOpenId]   = useState(null);          // which detail panel is expanded
  const [busyId, setBusyId]   = useState(null);           // which use case is generating
  const [composer, setComposer] = useState(null);         // { id, text } — inline prompt box

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

  // Open (or close) the inline "optional prompt" composer for a use case.
  const openComposer = (u) => {
    setComposer((prev) => (prev?.id === u.id ? null : { id: u.id, text: "" }));
  };

  const runDetail = async (u) => {
    if (!onDetail || !u.title?.trim()) return;
    const instructions = composer?.id === u.id ? composer.text : "";
    setBusyId(u.id);
    const res = await onDetail(u, instructions);
    setBusyId(null);
    if (res?.success) {
      setOpenId(u.id);      // auto-expand to show the new detail
      setComposer(null);    // close the composer
    }
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
                  const composerOpen = composer?.id === u.id;
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

                            {/* Detail with AI — opens the optional prompt composer */}
                            <Box onClick={() => !busy && openComposer(u)}
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

                            {(u.details) && !composerOpen && (
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

                          {/* Optional prompt composer — appears before generating/redoing */}
                          {composerOpen && (
                            <Box sx={{ mt: 1, mx: 1, p: 1.25, backgroundColor: "#FAF5FC",
                                       border: "1px solid #E9D5FF", borderRadius: "8px" }}>
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
                                <Typography fontSize={11.5} fontWeight={600} color="#7C3AED">
                                  Optional — tell AI how to detail this use case
                                </Typography>
                                <IconButton size="small" onClick={() => setComposer(null)} sx={{ p: 0.2 }}>
                                  <CloseIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                                </IconButton>
                              </Box>
                              <TextField
                                value={composer.text}
                                onChange={(e) => setComposer({ ...composer, text: e.target.value })}
                                placeholder='e.g. "Focus only on the API contract", "assume Postgres + Express", "keep it beginner friendly"'
                                fullWidth multiline minRows={2}
                                sx={{ backgroundColor: "#fff", borderRadius: "6px",
                                      "& .MuiOutlinedInput-root": { fontSize: 12.5 } }}
                              />
                              <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                                <Box onClick={() => setComposer(null)}
                                  sx={{ px: 1.25, py: 0.5, borderRadius: "8px", cursor: "pointer",
                                        fontSize: 12, fontWeight: 500, color: "#6B7280" }}>
                                  Cancel
                                </Box>
                                <Box onClick={() => runDetail(u)}
                                  sx={{ display: "flex", alignItems: "center", gap: 0.5,
                                        px: 1.5, py: 0.5, borderRadius: "8px", cursor: "pointer",
                                        fontSize: 12, fontWeight: 600, color: "#fff",
                                        background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)" }}>
                                  <AutoAwesomeIcon sx={{ fontSize: 13 }} />
                                  Generate detail
                                </Box>
                              </Box>
                            </Box>
                          )}

                          {/* AI detail panel — rendered as real Markdown, not raw text */}
                          {open && u.details && !composerOpen && (
                            <Box sx={{ mt: 1, mx: 1, p: 1.75, backgroundColor: "#F9FAFB",
                                       borderRadius: "8px", border: "1px solid #F0F0F0" }}>
                              <ReactMarkdown components={markdownComponents}>
                                {u.details}
                              </ReactMarkdown>
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