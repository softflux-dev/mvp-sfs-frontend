import React, { useState, useEffect,useRef } from "react";
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
import { useFormatCurrency } from "../../../utils/formatCurrency";

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
  const { symbol, currency } = useFormatCurrency();

  const fieldRefs = {
    projectName:    useRef(null),
    clientName:     useRef(null),
    projectManager: useRef(null),
    projectType:    useRef(null),
    startDate:      useRef(null),
    endDate:        useRef(null),
    status:         useRef(null),
  };

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

const NAME_PATTERN = /^[a-zA-Z0-9 ]+$/;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 1000;

const blockInvalidNumericKeys = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
};

const blockNegativePaste = (e) => {
  const pasted = e.clipboardData.getData("text");
  if (/-/.test(pasted)) e.preventDefault();
};

  const validate = () => {
    const e = {};
 if (!formData.projectName.trim()) {
      e.projectName = "Project name is required";
    } else if (!NAME_PATTERN.test(formData.projectName.trim())) {
      e.projectName = "Project name can only contain letters, numbers, and spaces";
    } else if (formData.projectName.trim().length > NAME_MAX_LENGTH) {
      e.projectName = `Project name cannot exceed ${NAME_MAX_LENGTH} characters`;
    }

    if (!formData.clientName.trim()) {
      e.clientName = "Client name is required";
    } else if (!NAME_PATTERN.test(formData.clientName.trim())) {
      e.clientName = "Client name can only contain letters, numbers, and spaces";
    } else if (formData.clientName.trim().length > NAME_MAX_LENGTH) {
      e.clientName = `Client name cannot exceed ${NAME_MAX_LENGTH} characters`;
    }
    if (!formData.projectManager)     e.projectManager = "Project manager is required";
    if (!formData.projectType)        e.projectType    = "Project type is required";
    if (!formData.status)             e.status         = "Status is required";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.startDate) {
      e.startDate = "Start date is required.";
    } 

   if (!formData.endDate) {
      e.endDate = "End date is required.";
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      e.endDate = "End date must be after the start date.";
    }
    return e;
  };
  const FIELD_ORDER = ["projectName", "clientName", "projectManager", "projectType", "startDate", "endDate", "status"];

const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstErrorField = FIELD_ORDER.find((f) => validationErrors[f]);
      if (firstErrorField && fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block:    "center",
        });
      }
      return;
    }
    onSave?.(formData);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };
  const handleBudgetChange = (e) => {
    let val = e.target.value;

    // Strip minus sign entirely — budget can never be negative
    val = val.replace(/-/g, "");

    setFormData((prev) => ({ ...prev, budget: val }));
    if (errors.budget) setErrors((prev) => ({ ...prev, budget: "" }));
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
            <Box ref={fieldRefs.projectName}>
              <CustomInputLabel label="Project Name *" />
              <TextInput placeholder="Enter Project Name" value={formData.projectName}
                onChange={handleChange("projectName")} inputBgColor="#fff" fullWidth
                error={!!errors.projectName} helperText={errors.projectName}
                inputProps={{ maxLength: NAME_MAX_LENGTH }} />
            </Box>

            {/* Client Name */}
            <Box ref={fieldRefs.clientName}>
              <CustomInputLabel label="Client Name *" />
              <TextInput placeholder="Enter Client Name" value={formData.clientName}
                onChange={handleChange("clientName")} inputBgColor="#fff" fullWidth
                error={!!errors.clientName} helperText={errors.clientName}
                inputProps={{ maxLength: NAME_MAX_LENGTH }} />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Project Description" />
              <TextInput placeholder="Enter Description" value={formData.description}
                onChange={handleChange("description")} inputBgColor="#fff"
                fullWidth multiline rows={3}
                inputProps={{ maxLength: DESCRIPTION_MAX_LENGTH }} />
            </Box>

            {/* Project Manager */}
            <Box  ref={fieldRefs.projectManager}>
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
            <Box ref={fieldRefs.projectType}>
              <CustomInputLabel label="Project Type *" />
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
              {errors.projectType && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.projectType}</Typography>
              )}
            </Box>

            {/* Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box ref={fieldRefs.startDate}>
                <CustomInputLabel label="Start Date *" />
                <DatePicker value={formData.startDate} onChange={handleDateChange("startDate") } 
                  slotProps={{
                    textField: { size: "small", fullWidth: true, error: !!errors.startDate },
                    popper: { sx: GlobalStyle.datePickerPopperSx },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.startDate}</Typography>}
              </Box>
              <Box ref={fieldRefs.endDate}>
                <CustomInputLabel label="End Date *" />
                <DatePicker value={formData.endDate} onChange={handleDateChange("endDate")} 
                minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                  slotProps={{
                    textField: { size: "small", fullWidth: true, error: !!errors.endDate },
                    popper: { sx: GlobalStyle.datePickerPopperSx },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.endDate}</Typography>}
              </Box>
            </Box>

            {/* Status + Budget */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box ref={fieldRefs.status}>
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
                <CustomInputLabel label={`Budget (${currency.code})`} />
                <TextInput placeholder="0" value={formData.budget}
                  onChange={handleBudgetChange} inputBgColor="#fff"
                  fullWidth type="number"
                  onKeyDown={blockInvalidNumericKeys}
                  onPaste={blockNegativePaste}
                  inputProps={{ min: 0 }}
                  InputStartIcon={
                    <span style={{ fontSize: "14px", color: "#808080", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {symbol}
                    </span>
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