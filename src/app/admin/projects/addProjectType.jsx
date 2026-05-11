import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

const AddProjectType = ({ open, onClose, onSave, editingType = null }) => {
  const [typeName,    setTypeName]    = useState("");
  const [error,       setError]       = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (editingType) {
      setTypeName(editingType.label || "");
    } else {
      setTypeName("");
    }
    setError("");
  }, [editingType, open]);

  const handleSave = () => {
    if (!typeName.trim()) {
      setError("Project type name is required");
      return;
    }
    onSave?.({
      value: typeName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: typeName.trim(),
    });
    setTypeName("");
    setError("");
    onClose?.();
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setTypeName("");
    setError("");
    onClose?.();
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
        <DialogHeader
          title={editingType ? "Edit Project Type" : "Add Project Type"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "16px",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box>
              <CustomInputLabel label="Project Type Name" />
              <TextInput
                placeholder="e.g. Fixed Price, Retainer…"
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  if (error) setError("");
                }}
                inputBgColor="#fff"
                fullWidth
                error={!!error}
                helperText={error}
              />
            </Box>
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
    </>
  );
};

export default AddProjectType;