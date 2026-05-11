import { useState, useEffect } from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox } from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";

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
import SuccessPopup        from "../../../components/popups/confirmationDialog";

const PROJECT_OPTIONS = [
  { value: "ecommerce",  label: "E-Commerce Platform"       },
  { value: "healthcare", label: "Healthcare Portal"          },
  { value: "crm",        label: "CRM Dashboard"             },
  { value: "mobile",     label: "Mobile Banking App"        },
  { value: "lms",        label: "Learning Management System"},
  { value: "logistics",  label: "Logistics Tracker"         },
];

const MODULE_OPTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend",  label: "Backend"  },
  { value: "design",   label: "Design"   },
];

const ASSIGNEE_OPTIONS = [
  { value: "sarah",  label: "Sarah Chen"    },
  { value: "marcus", label: "Marcus Webb"   },
  { value: "priya",  label: "Priya Patel"   },
  { value: "jake",   label: "Jake Morrison" },
  { value: "emily",  label: "Emily Ross"    },
  { value: "david",  label: "David Kim"     },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: "14px",
      mt: 0.5,
      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
      maxHeight: 300,
    },
  },
};

const INITIAL_FORM = {
  title:       "",
  description: "",
  project:     "",
  module:      "",
  assigneeIds: [],
  priority:    "",
  startDate:   null,
  endDate:     null,
  attachments: null,
};

const AddTaskDialog = ({ open, onClose, onSave, editingTask = null, loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      let assigneeIds = [];
      if (Array.isArray(editingTask.assigneeIds)) {
        assigneeIds = editingTask.assigneeIds;
      } else if (editingTask.assigneeName) {
        const match = ASSIGNEE_OPTIONS.find(
          (a) => a.label.toLowerCase() === editingTask.assigneeName.toLowerCase()
        );
        if (match) assigneeIds = [match.value];
      }

      setFormData({
        title:       editingTask.title       || "",
        description: editingTask.description || "",
        project:     editingTask.project     || "",
        module:      editingTask.module      || "",
        assigneeIds,
        priority:    editingTask.priority?.toLowerCase() || "",
        startDate:   editingTask.startDate ? new Date(editingTask.startDate) : null,
        endDate:     editingTask.endDate   ? new Date(editingTask.endDate)   : null,
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
    if (!formData.title.trim())       e.title   = "Task title is required";
    if (!formData.project)            e.project = "Project is required";
    if (!formData.assigneeIds.length) e.assigneeIds = "Assignee is required";
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
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <>
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

              {/* Assignees — multi-select */}
              <Box>
                <CustomInputLabel label="Assignees *" />
                <CustomSelect
                  multiple
                  value={formData.assigneeIds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, assigneeIds: e.target.value }))
                  }
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return (
                        <Typography fontSize={13} color="text.secondary">
                          Select assignees
                        </Typography>
                      );
                    }
                    const matched = ASSIGNEE_OPTIONS.filter((a) => selected.includes(a.value));
                    return (
                      <Box display="flex" alignItems="center" gap={0.75} flexWrap="nowrap" overflow="hidden">
                        <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
                          {matched.slice(0, 4).map((a) => (
                            <Avatar
                              key={a.value}
                              sx={{
                                width: 22, height: 22,
                                fontSize: "9px", fontWeight: 700,
                                background: "linear-gradient(135deg, #AA2493, #022179)",
                                color: "#fff",
                                border: "1.5px solid #fff",
                              }}
                            >
                              {getInitials(a.label)}
                            </Avatar>
                          ))}
                        </Box>
                        <Typography fontSize={13} color="text.primary" noWrap>
                          {matched.length === 1
                            ? matched[0].label
                            : `${matched[0].label} +${matched.length - 1} more`}
                        </Typography>
                      </Box>
                    );
                  }}
                  MenuProps={multiMenuProps}
                >
                  {ASSIGNEE_OPTIONS.map((a) => {
                    const isSelected = formData.assigneeIds.includes(a.value);
                    return (
                      <MenuItem
                        key={a.value}
                        value={a.value}
                        disableRipple
                        sx={{
                          px: 1.5, py: 1, gap: 1.5,
                          backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                          "&:hover": { backgroundColor: "#F5F5F5" },
                          "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                          "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32, height: 32,
                            fontSize: "11px", fontWeight: 600,
                            background: "linear-gradient(135deg, #AA2493, #022179)",
                            color: "#fff", flexShrink: 0,
                          }}
                        >
                          {getInitials(a.label)}
                        </Avatar>
                        <Typography fontSize="13px" fontWeight={500} color="text.primary" sx={{ flex: 1 }}>
                          {a.label}
                        </Typography>
                        <Checkbox
                          checked={isSelected}
                          disableRipple
                          sx={{
                            p: 0, color: "#D1D5DB",
                            "&.Mui-checked": { color: "#AA2493" },
                            "& .MuiSvgIcon-root": { fontSize: 20 },
                          }}
                        />
                      </MenuItem>
                    );
                  })}
                </CustomSelect>
                {errors.assigneeIds && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.assigneeIds}
                  </Typography>
                )}
              </Box>

              {/* Priority */}
              <Box>
                <CustomInputLabel label="Priority" />
                <CustomSelect
                  value={formData.priority}
                  onChange={handleChange("priority")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select Priority</MenuItem>
                  {PRIORITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>

              {/* Start Date + End Date */}
              <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
                <Box>
                  <CustomInputLabel label="Start Date" />
                  <DatePicker
                    value={formData.startDate}
                    onChange={(v) => setFormData((prev) => ({ ...prev, startDate: v }))}
                    slotProps={{
                      textField: { size: "small", fullWidth: true, placeholder: "dd/mm/yyyy" },
                    }}
                    sx={{
                      ...GlobalStyle.datePickerStyle,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <CustomInputLabel label="End Date" />
                  <DatePicker
                    value={formData.endDate}
                    onChange={(v) => setFormData((prev) => ({ ...prev, endDate: v }))}
                    slotProps={{
                      textField: { size: "small", fullWidth: true, placeholder: "dd/mm/yyyy" },
                    }}
                    sx={{
                      ...GlobalStyle.datePickerStyle,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                </Box>
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

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Task saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AddTaskDialog;