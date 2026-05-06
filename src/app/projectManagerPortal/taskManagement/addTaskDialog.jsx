import { useState, useEffect } from "react";
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
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

const PROJECT_OPTIONS = [
  { value: "ecommerce",  label: "E-Commerce Platform"      },
  { value: "healthcare", label: "Healthcare Portal"         },
  { value: "crm",        label: "CRM Dashboard"            },
  { value: "mobile",     label: "Mobile Banking App"       },
  { value: "lms",        label: "Learning Management System"},
  { value: "logistics",  label: "Logistics Tracker"        },
];

const MODULE_OPTIONS = [
  { value: "frontend",  label: "Frontend"  },
  { value: "backend",   label: "Backend"   },
  { value: "design",    label: "Design"    },
];

const ASSIGNEE_OPTIONS = [
  { value: "sarah",   label: "Sarah Chen"    },
  { value: "marcus",  label: "Marcus Webb"   },
  { value: "priya",   label: "Priya Patel"   },
  { value: "jake",    label: "Jake Morrison" },
  { value: "emily",   label: "Emily Ross"    },
  { value: "david",   label: "David Kim"     },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
];

const INITIAL_FORM = {
  title:       "",
  description: "",
  project:     "",
  module:      "",
  assignTo:    "",
  priority:    "",
  deadline:    null,
  attachments: null,
};

const AddTaskDialog = ({ open, onClose, onSave, editingTask = null, loading = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setFormData({
        title:       editingTask.title       || "",
        description: editingTask.description || "",
        project:     editingTask.project     || "",
        module:      editingTask.module      || "",
        assignTo:    editingTask.assigneeName|| "",
        priority:    editingTask.priority?.toLowerCase() || "",
        deadline:    editingTask.deadline ? new Date(editingTask.deadline) : null,
        attachments: null,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingTask, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title    = "Task title is required";
    if (!formData.project)      e.project  = "Project is required";
    if (!formData.deadline)     e.deadline = "Deadline is required";
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="560px" fullWidth>
        <DialogHeader
          title={editingTask ? "Edit Task" : "Add New Task"}
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

            {/* Task Title */}
            <Box>
              <CustomInputLabel label="Task Title *" />
              <TextInput
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange("title")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.title}
                helperText={errors.title}
              />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput
                placeholder="Task description..."
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* Project + Module */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Project *" />
                <CustomSelect
                  value={formData.project}
                  onChange={handleChange("project")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select project</MenuItem>
                  {PROJECT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.project && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.project}
                  </Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="Module" />
                <CustomSelect
                  value={formData.module}
                  onChange={handleChange("module")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select module</MenuItem>
                  {MODULE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Box>

            {/* Assign To + Priority */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Assign To" />
                <CustomSelect
                  value={formData.assignTo}
                  onChange={handleChange("assignTo")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select member</MenuItem>
                  {ASSIGNEE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>

              <Box>
                <CustomInputLabel label="Priority" />
                <CustomSelect
                  value={formData.priority}
                  onChange={handleChange("priority")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Priority</MenuItem>
                  {PRIORITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Box>

            {/* Deadline */}
            <Box>
              <CustomInputLabel label="Deadline *" />
              <DatePicker
                value={formData.deadline}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, deadline: v }));
                  if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: "" }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "dd/mm/yyyy",
                    error: !!errors.deadline,
                  },
                }}
                sx={GlobalStyle.datePickerStyle}
              />
              {errors.deadline && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.deadline}
                </Typography>
              )}
            </Box>

            {/* Attachments */}
            <Box>
              <CustomInputLabel label="Attachments" />
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  px: 2, py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  component="label"
                  sx={{
                    px: "14px", py: "6px",
                    borderRadius: "8px",
                    backgroundColor: "#F5F5F5",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#374151",
                    cursor: "pointer",
                    border: "1px solid #E0E0E0",
                    whiteSpace: "nowrap",
                    fontFamily: '"Poppins", sans-serif',
                    "&:hover": { backgroundColor: "#EBEBEB" },
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, attachments: e.target.files?.[0] || null }))
                    }
                  />
                </Box>
                <Typography fontSize="13px" color="text.secondary">
                  {formData.attachments ? formData.attachments.name : "No file chosen"}
                </Typography>
              </Box>
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Save Task"
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddTaskDialog;