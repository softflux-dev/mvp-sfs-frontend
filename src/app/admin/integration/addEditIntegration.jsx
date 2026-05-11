import React, { useState, useEffect } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";

// ── Option lists ──────────────────────────────────────────────────────────
const PROJECT_TYPE_OPTIONS = [
  { value: "development", label: "Development" },
  { value: "seo",         label: "SEO"         },
  { value: "retainer",    label: "Retainer"    },
  { value: "internal",    label: "Internal"    },
];

const PROJECTS_BY_TYPE = {
  development: [
    { value: "PRJ-1001", label: "Frontend Web App"        },
    { value: "PRJ-1002", label: "Backend API Services"    },
    { value: "PRJ-1003", label: "iOS Mobile App"          },
    { value: "PRJ-1004", label: "Android Mobile App"      },
  ],
  seo: [
    { value: "PRJ-1005", label: "Data Pipeline"           },
  ],
  retainer: [
    { value: "PRJ-1006", label: "Internal Admin Dashboard"},
  ],
  internal: [
    { value: "PRJ-1007", label: "Machine Learning Models" },
  ],
};

const INITIAL_FORM = {
  projectType:   "",
  projectId:     "",
  projectName:   "",
  provider:      "",
  repositoryUrl: "",
};

const AddEditIntegration = ({ open, onClose, onSave, editingRow = null, loading = false }) => {
  const isEditMode = !!editingRow;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  const projectList = PROJECTS_BY_TYPE[formData.projectType] || [];

  // Populate form when editing, reset when adding
  useEffect(() => {
    if (editingRow) {
      setFormData({
        projectType:   editingRow.projectType   || "",
        projectId:     editingRow.projectId     || "",
        projectName:   editingRow.projectName   || "",
        provider:      editingRow.provider      || "",
        repositoryUrl: editingRow.repositoryUrl || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingRow, open]);

  // Project Type change — reset project downstream
  const handleProjectTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, projectType: value, projectId: "", projectName: "" }));
    if (errors.projectType) setErrors((prev) => ({ ...prev, projectType: "" }));
  };

  // Project change — auto-fill project name
  const handleProjectChange = (e) => {
    const selectedId = e.target.value;
    const matched    = projectList.find((p) => p.value === selectedId);
    setFormData((prev) => ({ ...prev, projectId: selectedId, projectName: matched?.label || "" }));
    if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: "" }));
  };

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isEditMode) {
      if (!formData.projectType) e.projectType = "Project type is required";
      if (!formData.projectId)   e.projectId   = "Project is required";
      if (!formData.provider.trim()) e.provider = "Provider is required";
    }
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
      <DialogHeader
        title={isEditMode ? "Edit Integration" : "Add Integration"}
        onClose={handleClose}
      />

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
        {/* ── ADD MODE ─────────────────────────────────────────────────── */}
        {!isEditMode && (
          <>
            {/* Project Type */}
            <Box>
              <CustomInputLabel label="Project Type" />
              <CustomSelect
                value={formData.projectType}
                onChange={handleProjectTypeChange}
                fullWidth
                height="45px"
                inputBgColor="#fff"
              >
                <MenuItem value="">Select project type</MenuItem>
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.projectType && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.projectType}
                </Typography>
              )}
            </Box>

            {/* Project — appears after project type is selected */}
            {formData.projectType && (
              <Box>
                <CustomInputLabel label="Project" />
                <CustomSelect
                  value={formData.projectId}
                  onChange={handleProjectChange}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select project</MenuItem>
                  {projectList.map((p) => (
                    <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.projectId && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.projectId}
                  </Typography>
                )}
              </Box>
            )}

            {/* Provider — text input */}
            <Box>
              <CustomInputLabel label="Provider" />
              <TextInput
                placeholder="e.g. GitHub, GitLab, Bitbucket"
                value={formData.provider}
                onChange={handleChange("provider")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.provider}
                helperText={errors.provider}
              />
            </Box>
          </>
        )}

        {/* ── EDIT MODE — readonly summary fields ──────────────────────── */}
        {isEditMode && (
          <>
            <Box>
              <CustomInputLabel label="Project ID" />
              <TextInput value={formData.projectId} inputBgColor="#fff" fullWidth readonly />
            </Box>

            <Box>
              <CustomInputLabel label="Project Name" />
              <TextInput value={formData.projectName} inputBgColor="#fff" fullWidth readonly />
            </Box>

            <Box>
              <CustomInputLabel label="Provider" />
              <TextInput value={formData.provider} inputBgColor="#fff" fullWidth readonly />
            </Box>
          </>
        )}

        {/* Repository URL — always editable */}
        <Box>
          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
            <CustomInputLabel label="Repository URL" />
            {isEditMode && (
              <Typography fontSize="11px" color="text.secondary" mt={-0.25}>
                (Editable)
              </Typography>
            )}
          </Box>
          <TextInput
            placeholder="https://github.com/acmecorp/your-repo"
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
        confirmText={isEditMode ? "Save" : "Add"}
        variant="gradient"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default AddEditIntegration;