import React, { useState, useEffect } from "react";
import { Box, MenuItem, Typography, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

const STATUS_OPTIONS = [
  { value: "new",         label: "New"         },
  { value: "in_progress", label: "In Progress" },
  { value: "paused",      label: "Paused"      },
  { value: "completed",   label: "Completed"   },
];

const INITIAL_FORM = {
  projectName:    "",
  clientName:     "",
  description:    "",
  projectManager: "",
  projectType:    "",
  startDate:      null,
  endDate:        null,
  status:         "",
  budget:         "",
};

const AddProject = ({
  open,
  onClose,
  onSave,
  editingProject     = null,
  loading            = false,
  apiError           = "",
  projectTypeOptions = [],
  managerOptions     = [],
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (!open) return;
    if (editingProject) {
      setFormData({
        projectName:    editingProject.projectName    || "",
        clientName:     editingProject.client         || editingProject.clientName || "",
        description:    editingProject.description    || "",
        projectManager: editingProject.projectManagerId || "",
        projectType:    editingProject.projectTypeId    || "",
        startDate:      editingProject.startDate ? new Date(editingProject.startDate) : null,
        endDate:        editingProject.endDate   ? new Date(editingProject.endDate)   : null,
        status:         editingProject.status?.toLowerCase() || "",
        budget:         editingProject.budget != null ? String(editingProject.budget) : "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingProject, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleDateChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.projectName.trim()) e.projectName    = "Project name is required";
    if (!formData.clientName.trim())  e.clientName     = "Client name is required";
    if (!formData.projectManager)     e.projectManager = "Project manager is required";
    if (!formData.startDate)          e.startDate      = "Start date is required";
    if (!formData.endDate)            e.endDate        = "End date is required";
    if (!formData.status)             e.status         = "Status is required";
    return e;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave?.(formData);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
        <DialogHeader
          title={editingProject ? "Edit Project" : "Add Project"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
          }}>

            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Project Name */}
            <Box>
              <CustomInputLabel label="Project Name *" />
              <TextInput placeholder="Enter Project Name" value={formData.projectName}
                onChange={handleChange("projectName")} inputBgColor="#fff" fullWidth
                error={!!errors.projectName} helperText={errors.projectName} />
            </Box>

            {/* Client Name */}
            <Box>
              <CustomInputLabel label="Client Name *" />
              <TextInput placeholder="Enter Client Name" value={formData.clientName}
                onChange={handleChange("clientName")} inputBgColor="#fff" fullWidth
                error={!!errors.clientName} helperText={errors.clientName} />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Project Description" />
              <TextInput placeholder="Enter Description" value={formData.description}
                onChange={handleChange("description")} inputBgColor="#fff"
                fullWidth multiline rows={3} />
            </Box>

            {/* Project Manager */}
            <Box>
              <CustomInputLabel label="Project Manager *" />
              <CustomSelect value={formData.projectManager}
                onChange={handleChange("projectManager")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  managerOptions.find((m) => m._id === v)?.fullName || (
                    <Typography fontSize={13} color="text.secondary">Select Manager</Typography>
                  )
                }
              >
                {managerOptions.map((m) => (
                  <MenuItem key={m._id} value={m._id}>{m.fullName}</MenuItem>
                ))}
              </CustomSelect>
              {errors.projectManager && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.projectManager}</Typography>
              )}
            </Box>

            {/* Project Type */}
            <Box>
              <CustomInputLabel label="Project Type" />
              <CustomSelect value={formData.projectType}
                onChange={handleChange("projectType")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  projectTypeOptions.find((t) => t._id === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Type</Typography>
                  )
                }
              >
                {projectTypeOptions.map((t) => (
                  <MenuItem key={t._id} value={t._id}>{t.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date *" />
                <DatePicker value={formData.startDate} onChange={handleDateChange("startDate")}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.startDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.startDate}</Typography>}
              </Box>
              <Box>
                <CustomInputLabel label="End Date *" />
                <DatePicker value={formData.endDate} onChange={handleDateChange("endDate")}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.endDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.endDate}</Typography>}
              </Box>
            </Box>

            {/* Status + Budget */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Project Status *" />
                <CustomSelect value={formData.status} onChange={handleChange("status")}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(v) =>
                    STATUS_OPTIONS.find((s) => s.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Status</Typography>
                    )
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.status && <Typography fontSize="12px" color="error" mt={0.5}>{errors.status}</Typography>}
              </Box>
              <Box>
                <CustomInputLabel label="Budget" />
                <TextInput placeholder="0" value={formData.budget}
                  onChange={handleChange("budget")} inputBgColor="#fff"
                  fullWidth type="number"
                  InputStartIcon={<span style={{ fontSize: "14px", color: "#808080", fontWeight: 500 }}>$</span>}
                />
              </Box>
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
              : editingProject ? "Save & Update" : "Save Project"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddProject;