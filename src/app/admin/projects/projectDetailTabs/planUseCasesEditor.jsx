// projectDetailTabs/planUseCasesEditor.jsx
// Controlled: parent owns `useCases` ([{ id, title, description }]).
import { Box, TextField, IconButton, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const PlanUseCasesEditor = ({ useCases = [], onChange, editable = true }) => {
  const setCases = (next) => onChange?.(next);

  const handleField = (id, field, value) =>
    setCases(useCases.map((u) => (u.id === id ? { ...u, [field]: value } : u)));

  const handleDelete = (id) => setCases(useCases.filter((u) => u.id !== id));

  const handleAdd = () =>
    setCases([...useCases, { id: uid(), title: "", description: "" }]);

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: "flex", px: 1, pb: 0.5 }}>
        <Typography sx={{ width: "34%", fontSize: 12, color: "text.secondary" }}>Title</Typography>
        <Typography sx={{ flex: 1, fontSize: 12, color: "text.secondary" }}>Description</Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {useCases.length === 0 ? (
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "10px", p: 2, textAlign: "center" }}>
          <Typography fontSize={13} color="text.secondary">No use cases yet.</Typography>
        </Box>
      ) : (
        useCases.map((u) => (
          <Box key={u.id}
            sx={{ display: "flex", alignItems: "flex-start", gap: 1, borderTop: "1px solid #F0F0F0", py: 1 }}>
            <TextField
              value={u.title}
              onChange={(e) => handleField(u.id, "title", e.target.value)}
              placeholder="Use case title"
              variant="standard"
              disabled={!editable}
              InputProps={{ disableUnderline: true }}
              sx={{ width: "34%", "& input": { fontSize: 13, fontWeight: 500 } }}
            />
            <TextField
              value={u.description}
              onChange={(e) => handleField(u.id, "description", e.target.value)}
              placeholder="Short description"
              variant="standard"
              disabled={!editable}
              multiline
              InputProps={{ disableUnderline: true }}
              sx={{ flex: 1, "& textarea": { fontSize: 13, color: "#374151" } }}
            />
            {editable && (
              <IconButton size="small" onClick={() => handleDelete(u.id)}
                sx={{ p: 0.3, color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        ))
      )}

      {editable && (
        <Box
          onClick={handleAdd}
          sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                color: "#AA2493", fontSize: 13, fontWeight: 600 }}
        >
          <AddIcon sx={{ fontSize: 16 }} /> Add use case
        </Box>
      )}
    </Box>
  );
};

export default PlanUseCasesEditor;