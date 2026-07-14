import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  DialogContainer, DialogHeader, DialogBody, TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../../components/popups/confirmationDialog";
import ConfirmationDialog  from "../../../../components/popups/confirmation";
import { useModuleCategory } from "../../../../hooks/moduleCategory";

const AddModuleCategory = ({ open, onClose, onSave }) => {
  const {
    moduleCategories,
    loading,
    actionLoading,
    error,
    createModuleCategory,
    updateModuleCategory,
    deleteModuleCategory,
  } = useModuleCategory();

  const [catName,       setCatName]       = useState("");
  const [inputError,    setInputError]    = useState("");
  const [successOpen,   setSuccessOpen]   = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [inlineEditId,  setInlineEditId]  = useState(null);
  const [inlineEditVal, setInlineEditVal] = useState("");

  const confirmRef = useRef();

  useEffect(() => {
    if (!open) {
      setCatName("");
      setInputError("");
      setInlineEditId(null);
      setInlineEditVal("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!catName.trim()) {
      setInputError("Category name is required");
      return;
    }
    const result = await createModuleCategory(catName.trim());
    if (result.success) {
      onSave?.(result.moduleCategory);
      setCatName("");
      setInputError("");
      setSuccessMsg("Category added successfully.");
      setSuccessOpen(true);
      handleClose();
    } else {
      setInputError(result.message);
    }
  };

  const confirmEdit = async (cat) => {
    if (!inlineEditVal.trim()) return;
    const result = await updateModuleCategory(cat._id, inlineEditVal.trim());
    if (result.success) {
      setInlineEditId(null);
      setSuccessMsg("Category updated.");
      setSuccessOpen(true);
      handleClose();
    } else {
      setInputError(result.message);
    }
  };

  const handleDelete = (cat) => {
    if (cat.isSystem) {
      setInputError("System categories cannot be deleted.");
      return;
    }
    confirmRef.current?.open({
      title:       "Delete Category?",
      description: `"${cat.label}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteModuleCategory(cat._id);
        if (result.success) {
          setSuccessMsg("Category deleted.");
          setSuccessOpen(true);
          handleClose();
        } else {
          setInputError(result.message);
        }
      },
    });
  };

  const handleClose = () => {
    setCatName("");
    setInputError("");
    setInlineEditId(null);
    setInlineEditVal("");
    onClose?.();
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
        <DialogHeader title="Manage Module Categories" onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2,
          }}>

            {(error || inputError) && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{error || inputError}</Typography>
              </Box>
            )}

            <Box>
              <CustomInputLabel label="Category Name" />
              <TextInput
                placeholder="e.g. Authentication, Payments…"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (inputError) setInputError("");
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} sx={{ color: "#AA2493" }} />
              </Box>
            ) : moduleCategories.length > 0 && (
              <Box>
                <CustomInputLabel label="Existing Categories" />
                <Box display="flex" flexDirection="column" gap={1}>
                  {moduleCategories.map((cat) => (
                    <Box key={cat._id} sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      px: 2, py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}>
                      {inlineEditId === cat._id ? (
                        <>
                          <TextInput
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            inputBgColor="#F5F5F5"
                            fullWidth
                            onKeyDown={(e) => {
                              if (e.key === "Enter")  confirmEdit(cat);
                              if (e.key === "Escape") setInlineEditId(null);
                            }}
                            autoFocus
                          />
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" onClick={() => confirmEdit(cat)}
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
                              {cat.label}
                            </Typography>
                            {cat.isSystem && (
                              <Typography fontSize="10px" color="text.secondary"
                                sx={{ backgroundColor: "#F0F0F0", px: 0.8, py: 0.2, borderRadius: "4px" }}>
                                system
                              </Typography>
                            )}
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small"
                              onClick={() => {
                                if (cat.isSystem) return;
                                setInlineEditId(cat._id);
                                setInlineEditVal(cat.label);
                              }}
                              disabled={cat.isSystem}
                              sx={{ color: "#67768B", "&:hover": { color: "#AA2493", backgroundColor: "#AA24931A" } }}>
                              <Pencil size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(cat)}
                              disabled={cat.isSystem || actionLoading}
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
              : "Add Category"
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

export default AddModuleCategory;