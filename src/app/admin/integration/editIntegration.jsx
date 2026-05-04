import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  TextInput,
} from "../../../components";
import CustomInputLabel      from "../../../components/customInputLabel";
import DialogActionButtons   from "../../../components/dialog/dialogAction";

const INITIAL_FORM = {
  projectId:     "",
  provider:      "",
  projectName:   "",
  repositoryUrl: "",
};

const EditIntegration = ({ open, onClose, onSave, editingRow = null, loading = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (editingRow) {
      setFormData({
        projectId:     editingRow.projectId     || "",
        provider:      editingRow.provider      || "",
        projectName:   editingRow.projectName   || "",
        repositoryUrl: editingRow.repositoryUrl || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingRow, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.repositoryUrl.trim()) e.repositoryUrl = "Repository URL is required";
    return e;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave?.(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
      <DialogHeader title="Edit Integration" onClose={handleClose} />

      <Box
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 3,
          mx: 3,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Project ID — readonly */}
        <Box>
          <CustomInputLabel label="Project ID" />
          <TextInput
            placeholder="PRJ-1001"
            value={formData.projectId}
            inputBgColor="#fff"
            fullWidth
            readonly
          />
        </Box>

        {/* Provider — readonly */}
        <Box>
          <CustomInputLabel label="Provider" />
          <TextInput
            placeholder="GitHub"
            value={formData.provider}
            inputBgColor="#fff"
            fullWidth
            readonly
          />
        </Box>

        {/* Project Name — readonly */}
        <Box>
          <CustomInputLabel label="Project Name" />
          <TextInput
            placeholder="Frontend Web App"
            value={formData.projectName}
            inputBgColor="#fff"
            fullWidth
            readonly
          />
        </Box>

        {/* Repository URL — editable */}
        <Box>
          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
            <CustomInputLabel label="Repository URL" />
            <Typography fontSize="11px" color="text.secondary" mt={-0.25}>
              (Edit able)
            </Typography>
          </Box>
          <TextInput
            placeholder="https://github.com/acmecorp/frontend-web"
            value={formData.repositoryUrl}
            onChange={handleChange("repositoryUrl")}
            inputBgColor="#fff"
            fullWidth
            error={!!errors.repositoryUrl}
            helperText={errors.repositoryUrl}
          />
        </Box>
      </Box>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Save"
        variant="gradient"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default EditIntegration;