import React, { useState, useEffect } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle from "../../../style/style";
import ConfirmationDialog from "../../../components/popups/confirmationDialog";

const MANAGER_OPTIONS = [
  { value: "sara_ahmed",  label: "Sara Ahmed"  },
  { value: "john_doe",    label: "John Doe"    },
  { value: "peter_jones", label: "Peter Jones" },
];

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const INITIAL_FORM = {
  projectName:    "",
  clientName:     "",
  description:    "",
  projectManager: "",
  startDate:      null,
  endDate:        null,
  status:         "",
  budget:         "",
};

// ── Shared white input bg style for DatePicker ────────────────────────────
const datePickerSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "14px",
    fontSize: "14px",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },
  "& .MuiInputBase-input": {
    padding: "13.5px 10px",
    fontSize: "14px",
    color: "#000",
    "&::placeholder": { color: "#808080", opacity: 1 },
  },
};

const AddProject = ({ open, onClose, onSave, editingProject = null, loading = false }) => {
  const [formData, setFormData]         = useState(INITIAL_FORM);
  const [errors, setErrors]             = useState({});
  const [confirmOpen, setConfirmOpen]   = useState(false);

 useEffect(() => {
  if (editingProject) {

    // ── Normalize projectManager: match by label if value slug not found ──
    const managerMatch =
      MANAGER_OPTIONS.find((m) => m.value === editingProject.projectManager) ||
      MANAGER_OPTIONS.find((m) => m.label === editingProject.projectManager);

    // ── Normalize status: match by label if value slug not found ──
    const statusMatch =
      STATUS_OPTIONS.find((s) => s.value === editingProject.status) ||
      STATUS_OPTIONS.find((s) => s.label.toLowerCase() === editingProject.status?.toLowerCase());

    setFormData({
      projectName:    editingProject.projectName    || "",
      clientName:     editingProject.client         || "",
      description:    editingProject.description    || "",
      projectManager: managerMatch?.value           || "",
      startDate:      editingProject.startDate ? new Date(editingProject.startDate) : null,
      endDate:        editingProject.endDate   ? new Date(editingProject.endDate)   : null,
      status:         statusMatch?.value            || "",
     budget: editingProject.budget != null ? String(editingProject.budget) : "",
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
    // Close the form dialog and show confirmation
    handleClose();
    setConfirmOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

      {/* ── Main Add/Edit Dialog ──────────────────────────────────────────── */}
      <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
        <DialogHeader
          title={editingProject ? "Edit Project" : "Add Project"}
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
              gap: 2.5,
            }}
          >
            {/* Project Name */}
            <Box>
              <CustomInputLabel label="Project Name" />
              <TextInput
                placeholder="Enter Project Name"
                value={formData.projectName}
                onChange={handleChange("projectName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.projectName}
                helperText={errors.projectName}
              />
            </Box>

            {/* Client Name */}
            <Box>
              <CustomInputLabel label="Client Name" />
              <TextInput
                placeholder="Enter Client Name"
                value={formData.clientName}
                onChange={handleChange("clientName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.clientName}
                helperText={errors.clientName}
              />
            </Box>

            {/* Project Description */}
            <Box>
              <CustomInputLabel label="Project Description" />
              <TextInput
                placeholder="Enter Description"
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* Project Manager */}
            <Box>
              <CustomInputLabel label="Project Manager" />
              <CustomSelect
                value={formData.projectManager}
                onChange={handleChange("projectManager")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
              >
                <MenuItem value="">Select Project Manager</MenuItem>
                {MANAGER_OPTIONS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.projectManager && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.projectManager}
                </Typography>
              )}
            </Box>

            {/* ── Start Date + End Date ───────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date" />
                <DatePicker
                  value={formData.startDate}
                  onChange={handleDateChange("startDate")}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.startDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.startDate}
                  </Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="End Date" />
                <DatePicker
                  value={formData.endDate}
                  onChange={handleDateChange("endDate")}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.endDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.endDate}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Status + Budget ─────────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Status" />
                <CustomSelect
                  value={formData.status}
                  onChange={handleChange("status")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select Status</MenuItem>
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.status && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.status}
                  </Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="Budget" />
                <TextInput
                  placeholder="20"
                  value={formData.budget}
                  onChange={handleChange("budget")}
                  inputBgColor="#fff"
                  fullWidth
                  type="number"
                  InputStartIcon={
                    <span style={{ fontSize: "14px", color: "#808080", fontWeight: 500 }}>$</span>
                  }
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
          confirmText={editingProject ? "Save & Update" : "Save Project"}
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      {/* ── Confirmation Dialog — auto-closes after 2s ────────────────────── */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message="Save Successfully"
        autoClose={true}
        autoCloseDelay={2000}
      />

    </LocalizationProvider>
  );
};

export default AddProject;