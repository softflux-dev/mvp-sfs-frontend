// projectDetailTabs/planTaskReviewDialog.jsx
import { useState, useEffect } from "react";
import { Box, MenuItem, Typography, IconButton, CircularProgress } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../../components";
import DialogActionButtons from "../../../../components/dialog/dialogAction";

const PRIORITY = [
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
];

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const PlanTaskReviewDialog = ({ open, onClose, tasks = [], loading = false, onCommit }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      setRows((tasks || []).map((t) => ({ id: uid(), ...t })));
    }
  }, [open, tasks]);

  const setField = (id, field, value) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const remove = (id) => setRows(rows.filter((r) => r.id !== id));

  const add = () =>
    setRows([...rows, { id: uid(), title: "", description: "", priority: "medium" }]);

  const handleCommit = () => {
    const clean = rows
      .map((r) => ({ title: (r.title || "").trim(), description: (r.description || "").trim(), priority: r.priority || "medium" }))
      .filter((r) => r.title);
    onCommit?.(clean);
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="640px" fullWidth>
      <DialogHeader title="Review generated tasks" onClose={onClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5 }}>
          <Typography fontSize={12} color="text.secondary" mb={1.5}>
            Edit, remove, or add tasks before they are added to the module. Tasks are
            created unassigned — the project manager assigns them afterward.
          </Typography>

          {rows.length === 0 ? (
            <Box sx={{ backgroundColor: "#fff", borderRadius: "10px", p: 2, textAlign: "center" }}>
              <Typography fontSize={13} color="text.secondary">No tasks. Add one below.</Typography>
            </Box>
          ) : (
            rows.map((r) => (
              <Box key={r.id}
                sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px",
                      p: 1.5, mb: 1.25, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextInput placeholder="Task title" value={r.title}
                      onChange={(e) => setField(r.id, "title", e.target.value)}
                      inputBgColor="#fff" fullWidth />
                  </Box>
                  <Box sx={{ width: 130 }}>
                    <CustomSelect value={r.priority} onChange={(e) => setField(r.id, "priority", e.target.value)}
                      fullWidth height="42px" inputBgColor="#fff">
                      {PRIORITY.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                    </CustomSelect>
                  </Box>
                  <IconButton size="small" onClick={() => remove(r.id)}
                    sx={{ color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
                <TextInput placeholder="Description" value={r.description}
                  onChange={(e) => setField(r.id, "description", e.target.value)}
                  inputBgColor="#fff" fullWidth multiline rows={2} />
              </Box>
            ))
          )}

          <Box onClick={add}
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                  color: "#AA2493", fontSize: 13, fontWeight: 600, mt: 0.5 }}>
            <AddIcon sx={{ fontSize: 16 }} /> Add task
          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={onClose}
        onConfirm={handleCommit}
        showCancelBtn
        cancelText="Cancel"
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : `Add ${rows.filter((r) => (r.title || "").trim()).length} tasks to module`
        }
        isConfirmBtnDisable={loading || rows.filter((r) => (r.title || "").trim()).length === 0}
        variant="gradient"
      />
    </DialogContainer>
  );
};

export default PlanTaskReviewDialog;