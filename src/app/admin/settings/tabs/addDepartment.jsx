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
const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 250;

const AddDepartment = ({
  open,
  onClose,
  onSave,
  editingDept,
  loading  = false,
  apiError = "",
}) => {
    const [controlled, setControlled] = useState({ ...EMPTY_FORM });
  const [nameError,        setNameError]        = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const lastEditRef  = useRef(null);

  if (open && editingDept !== lastEditRef.current) {
    lastEditRef.current = editingDept;
    const next = editingDept
      ? { name: editingDept.name || "", description: editingDept.description || "" }
      : { ...EMPTY_FORM };
    Promise.resolve().then(() => { setControlled(next); setNameError(""); setDescriptionError(""); });
  }

  const set = (field) => (e) => {
    const val = e.target.value;
    setControlled((prev) => ({ ...prev, [field]: val }));
    if (field === "name" && nameError) setNameError("");
    if (field === "description" && descriptionError) setDescriptionError("");
  };

  const isValid =
    controlled.name.trim() !== "" &&
    controlled.name.trim().length <= MAX_NAME_LENGTH &&
    controlled.description.length <= MAX_DESCRIPTION_LENGTH;

  const handleClose = () => {
    setControlled({ ...EMPTY_FORM });
    setNameError("");
    setDescriptionError("");
    lastEditRef.current = null;
    onClose();
  };

  const handleSave = () => {
    const trimmedName = controlled.name.trim();
    if (!trimmedName) {
      setNameError("Department name is required.");
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setNameError(`Department name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      return;
    }
    if (controlled.description.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`);
      return;
    }
    if (loading) return;
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
              error={!!nameError}
              helperText={nameError}
              inputProps={{ maxLength: MAX_NAME_LENGTH }}
            />
            <Typography fontSize="11px" color="text.secondary" mt={0.5} textAlign="right">
              {controlled.name.length}/{MAX_NAME_LENGTH}
            </Typography>
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
              error={!!descriptionError}
              helperText={descriptionError}
              inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
            />
            <Typography fontSize="11px" color="text.secondary" mt={0.5} textAlign="right">
              {controlled.description.length}/{MAX_DESCRIPTION_LENGTH}
            </Typography>
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