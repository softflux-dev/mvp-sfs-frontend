import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import ConfirmationDialog  from "../../../components/popups/confirmation";

const DEFAULT_TYPES = [
  { value: "development", label: "Development" },
  { value: "seo",         label: "SEO"         },
  { value: "retainer",    label: "Retainer"    },
  { value: "internal",    label: "Internal"    },
];

const AddProjectType = ({ open, onClose, onSave, editingType = null }) => {
  const [typeName,    setTypeName]    = useState("");
  const [error,       setError]       = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [types,       setTypes]       = useState(DEFAULT_TYPES);
  const [inlineEditId,  setInlineEditId]  = useState(null);
  const [inlineEditVal, setInlineEditVal] = useState("");

  const confirmRef = useRef();

  useEffect(() => {
    if (editingType) setTypeName(editingType.label || "");
    else             setTypeName("");
    setError("");
  }, [editingType, open]);

  const handleSave = () => {
    if (!typeName.trim()) { setError("Project type name is required"); return; }
    const newType = {
      value: typeName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: typeName.trim(),
    };
    setTypes((prev) => {
      const exists = prev.some((t) => t.value === newType.value);
      return exists ? prev : [...prev, newType];
    });
    onSave?.(newType);
    setTypeName("");
    setError("");
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setTypeName(""); setError("");
    setInlineEditId(null); setInlineEditVal("");
    onClose?.();
  };

  // ── Inline edit ──────────────────────────────────────────────────────────
  const startEdit = (type) => {
    setInlineEditId(type.value);
    setInlineEditVal(type.label);
  };

  const confirmEdit = (type) => {
    if (!inlineEditVal.trim()) return;
    const updated = {
      value: inlineEditVal.trim().toLowerCase().replace(/\s+/g, "_"),
      label: inlineEditVal.trim(),
    };
    setTypes((prev) => prev.map((t) => t.value === type.value ? updated : t));
    setInlineEditId(null);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (type) => {
    confirmRef.current?.open({
      title:       "Delete Project Type?",
      description: `"${type.label}" will be permanently removed.`,
      confirmText: "Yes",
      cancelText:  "Cancel",
      onConfirm:   () => setTypes((prev) => prev.filter((t) => t.value !== type.value)),
    });
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
        <DialogHeader
          title={editingType ? "Edit Project Type" : "Add Project Type"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Input */}
            <Box>
              <CustomInputLabel label="Project Type Name" />
              <TextInput
                placeholder="e.g. Fixed Price, Retainer…"
                value={typeName}
                onChange={(e) => { setTypeName(e.target.value); if (error) setError(""); }}
                inputBgColor="#fff"
                fullWidth
                error={!!error}
                helperText={error}
              />
            </Box>

            {/* Existing types list */}
            {types.length > 0 && (
              <Box>
                <CustomInputLabel label="Existing Project Types" />
                <Box display="flex" flexDirection="column" gap={1}>
                  {types.map((type) => (
                    <Box
                      key={type.value}
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        px: 2, py: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      {inlineEditId === type.value ? (
                        /* ── Inline edit mode ── */
                        <>
                          <TextInput
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            inputBgColor="#F5F5F5"
                            fullWidth
                            sx={{ "& .MuiOutlinedInput-root": { height: "32px" } }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")  confirmEdit(type);
                              if (e.key === "Escape") setInlineEditId(null);
                            }}
                            autoFocus
                          />
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" onClick={() => confirmEdit(type)}
                              sx={{ color: "#04C373", "&:hover": { backgroundColor: "#04C3731A" } }}>
                              <Check size={15} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setInlineEditId(null)}
                              sx={{ color: "#FF0000", "&:hover": { backgroundColor: "#FF00001A" } }}>
                              <X size={15} />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        /* ── View mode ── */
                        <>
                          <Typography fontSize="13px" fontWeight={500} color="text.primary">
                            {type.label}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" onClick={() => startEdit(type)}
                              sx={{ color: "#67768B", "&:hover": { color: "#AA2493", backgroundColor: "#AA24931A" } }}>
                              <Pencil size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(type)}
                              sx={{ color: "#67768B", "&:hover": { color: "#e613f5", backgroundColor: "#FF00001A" } }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText={editingType ? "Update Type" : "Add Type"}
          variant="gradient"
        />
      </DialogContainer>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Project type saved successfully."
        autoClose
        autoCloseDelay={2000}
      />

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default AddProjectType;