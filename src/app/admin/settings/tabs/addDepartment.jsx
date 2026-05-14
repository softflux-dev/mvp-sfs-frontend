import { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import CustomInputLabel    from "../../../../components/customInputLabel";
import TextInput           from "../../../../components/textInput";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../../components";
import DialogActionButtons from "../../../../components/dialog/dialogAction";

const EMPTY_FORM = { name: "", description: "" };

const AddDepartment = ({
  open,
  onClose,
  onSave,
  editingDept,
  loading  = false,
  apiError = "",
}) => {
  const [controlled, setControlled] = useState({ ...EMPTY_FORM });
  const lastEditRef  = useRef(null);

  if (open && editingDept !== lastEditRef.current) {
    lastEditRef.current = editingDept;
    const next = editingDept
      ? { name: editingDept.name || "", description: editingDept.description || "" }
      : { ...EMPTY_FORM };
    Promise.resolve().then(() => setControlled(next));
  }

  const set = (field) => (e) =>
    setControlled((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = controlled.name.trim() !== "";

  const handleClose = () => {
    setControlled({ ...EMPTY_FORM });
    lastEditRef.current = null;
    onClose();
  };

  const handleSave = () => {
    if (!isValid || loading) return;
    onSave?.(controlled);
    // NOTE: don't reset here — parent closes dialog on success
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="480px" fullWidth>
      <DialogHeader
        title={editingDept ? "Edit Department" : "Add Department"}
        onClose={handleClose}
      />
      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>

          {/* API error inside dialog */}
          {apiError && (
            <Box px={1.5} py={1}
              sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
            >
              <Typography fontSize={13} color="error">{apiError}</Typography>
            </Box>
          )}

          <Box>
            <CustomInputLabel label="Department Name *" />
            <TextInput
              placeholder="Enter Department Name"
              value={controlled.name}
              onChange={set("name")}
              inputBgColor="#fff"
              fullWidth
            />
          </Box>

          <Box>
            <CustomInputLabel label="Description" />
            <TextInput
              placeholder="Enter Description"
              value={controlled.description}
              onChange={set("description")}
              inputBgColor="#fff"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : editingDept ? "Update" : "Add Department"
        }
        isConfirmBtnDisable={!isValid || loading}
        variant="gradient"
      />
    </DialogContainer>
  );
};

export default AddDepartment;