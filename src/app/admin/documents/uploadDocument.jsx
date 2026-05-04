import React, { useState } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import UploadBox from "../../../components/uploadBox";
import UploadIcon from "../../../assets/icons/upload.svg";

const DOC_TYPE_OPTIONS = [
  { value: "employment_contract",   label: "Employment Contract"   },
  { value: "nda",                   label: "NDA"                   },
  { value: "project_documentation", label: "Project Documentation" },
  { value: "client_agreement",      label: "Client Agreement"      },
  { value: "other",                 label: "Other"                 },
];

const INITIAL_FORM = {
  title:    "",
  type:     "",
  files:    [],
};

const UploadDocument = ({ open, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...selected] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...dropped] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Document title is required";
    if (!formData.type)         e.type  = "Document type is required";
    if (!formData.files.length) e.files = "Please select at least one file";
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
    <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
      <DialogHeader title="Upload Document" onClose={handleClose} />

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
        {/* Document Title */}
        <Box>
          <CustomInputLabel label="Document Title" />
          <TextInput
            placeholder="Enter document title"
            value={formData.title}
            onChange={handleChange("title")}
            inputBgColor="#fff"
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
          />
        </Box>

        {/* Document Type */}
        <Box>
          <CustomInputLabel label="Document Type" />
          <CustomSelect
            value={formData.type}
            onChange={handleChange("type")}
            fullWidth
            height="45px"
            inputBgColor="#fff"
            placeholder="Select type"
          >
            <MenuItem value="">Select type</MenuItem>
            {DOC_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
          {errors.type && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
              {errors.type}
            </Typography>
          )}
        </Box>

        {/* File Upload */}
        <Box>
          <CustomInputLabel label="File" />
          <UploadBox
            uploadIcon={UploadIcon}
            dragActive={dragActive}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            selectedFiles={formData.files}
            onRemoveFile={handleRemoveFile}
            showCategory={false}
            showFileList={true}
          />
          {errors.files && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
              {errors.files}
            </Typography>
          )}
        </Box>
      </Box>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Upload"
        variant="gradient"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default UploadDocument;