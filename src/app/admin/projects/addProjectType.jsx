import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  DialogContainer, DialogHeader, DialogBody, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import ConfirmationDialog  from "../../../components/popups/confirmation";
import { useProjectType }  from "../../../hooks/projectType"; 

const AddProjectType = ({ open, onClose, onSave }) => {
  const {
    projectTypes,
    loading,
    actionLoading,
    error,
    createProjectType,
    updateProjectType,
    deleteProjectType,
  } = useProjectType();

  const [typeName,      setTypeName]      = useState("");
  const [inputError,    setInputError]    = useState("");
  const [successOpen,   setSuccessOpen]   = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [inlineEditId,  setInlineEditId]  = useState(null);
  const [inlineEditVal, setInlineEditVal] = useState("");

  const confirmRef = useRef();

  useEffect(() => {
    if (!open) {
      setTypeName("");
      setInputError("");
      setInlineEditId(null);
      setInlineEditVal("");
    }
  }, [open]);

 // ── Add new type ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!typeName.trim()) {
      setInputError("Project type name is required");
      return;
    }
    const result = await createProjectType(typeName.trim());
    if (result.success) {
      onSave?.(result.projectType);  
      setTypeName("");
      setInputError("");
      setSuccessMsg("Project type added successfully.");
      setSuccessOpen(true);
      handleClose();
    } else {
      setInputError(result.message);
    }
  };

  // ── Inline edit confirm ────────────────────────────────────────────────────
  const confirmEdit = async (type) => {
    if (!inlineEditVal.trim()) return;
    const result = await updateProjectType(type._id, inlineEditVal.trim());
    if (result.success) {
      setInlineEditId(null);
      setSuccessMsg("Project type updated.");
      setSuccessOpen(true);
      handleClose();
    } else {
      setInputError(result.message);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (type) => {
    if (type.isSystem) {
      setInputError("System project types cannot be deleted.");
      return;
    }
    confirmRef.current?.open({
      title:       "Delete Project Type?",
      description: `"${type.label}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteProjectType(type._id);
        if (result.success) {
          setSuccessMsg("Project type deleted.");
          setSuccessOpen(true);
          handleClose();
        } else {
          setInputError(result.message);
        }
      },
    });
  };

  const handleClose = () => {
    setTypeName("");
    setInputError("");
    setInlineEditId(null);
    setInlineEditVal("");
    onClose?.();
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
        <DialogHeader title="Manage Project Types" onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2,
          }}>

            {/* API / input error */}
            {(error || inputError) && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{error || inputError}</Typography>
              </Box>
            )}

            {/* Input */}
            <Box>
              <CustomInputLabel label="Project Type Name" />
              <TextInput
                placeholder="e.g. Fixed Price, Retainer…"
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  if (inputError) setInputError("");
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* Existing types list */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} sx={{ color: "#AA2493" }} />
              </Box>
            ) : projectTypes.length > 0 && (
              <Box>
                <CustomInputLabel label="Existing Project Types" />
                <Box display="flex" flexDirection="column" gap={1}>
                  {projectTypes.map((type) => (
                    <Box key={type._id} sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      px: 2, py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}>
                      {inlineEditId === type._id ? (
                        <>
                          <TextInput
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            inputBgColor="#F5F5F5"
                            fullWidth
                            onKeyDown={(e) => {
                              if (e.key === "Enter")  confirmEdit(type);
                              if (e.key === "Escape") setInlineEditId(null);
                            }}
                            autoFocus
                          />
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" onClick={() => confirmEdit(type)}
                              disabled={actionLoading}
                              sx={{ color: "#04C373", "&:hover": { backgroundColor: "#04C3731A" } }}>
                              {actionLoading
                                ? <CircularProgress size={14} />
                                : <Check size={15} />
                              }
                            </IconButton>
                            <IconButton size="small" onClick={() => setInlineEditId(null)}
                              sx={{ color: "#FF0000", "&:hover": { backgroundColor: "#FF00001A" } }}>
                              <X size={15} />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize="13px" fontWeight={500} color="text.primary">
                              {type.label}
                            </Typography>
                            {type.isSystem && (
                              <Typography fontSize="10px" color="text.secondary"
                                sx={{ backgroundColor: "#F0F0F0", px: 0.8, py: 0.2, borderRadius: "4px" }}>
                                system
                              </Typography>
                            )}
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small"
                              onClick={() => {
                                if (type.isSystem) return;
                                setInlineEditId(type._id);
                                setInlineEditVal(type.label);
                              }}
                              disabled={type.isSystem}
                              sx={{ color: "#67768B", "&:hover": { color: "#AA2493", backgroundColor: "#AA24931A" } }}>
                              <Pencil size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(type)}
                              disabled={type.isSystem || actionLoading}
                              sx={{ color: "#67768B", "&:hover": { color: "#FF0000", backgroundColor: "#FF00001A" } }}>
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
          confirmText={
            actionLoading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : "Add Type"
          }
          isConfirmBtnDisable={actionLoading}
          variant="gradient"
        />
      </DialogContainer>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />

      <ConfirmationDialog ref={confirmRef} />
    </>
  );
};

export default AddProjectType;