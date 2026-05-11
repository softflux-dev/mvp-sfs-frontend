import { useState, useEffect } from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../../style/style";
import SuccessPopup        from "../../../../components/popups/confirmationDialog";

const ASSIGNEE_OPTIONS = [
  { value: "sara_ahmed", label: "Sara Ahmed" },
  { value: "jon",        label: "Jon"        },
  { value: "peter",      label: "Peter"      },
  { value: "sarah",      label: "Sarah"      },
];

const PRIORITY_OPTIONS = [
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
];
const DEPARTMENT_OPTIONS = [
  { value: "development",   label: "Development"   },
  { value: "hr", label: "HR" },
  { value: "qa",    label: "QA"    },
  {value: "design", label: "Design"}
];

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const INITIAL_FORM = {
  title:       "",
  module:      "",
  assigneeIds: [],
  priority:    "",
  status:      "",
  startDate:   null,
  endDate:    null,
};

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

const AddTask = ({ open, onClose, onSave, editingTask = null, loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (editingTask) {
      // Normalize existing single assignee or array into assigneeIds[]
      let assigneeIds = [];
      if (Array.isArray(editingTask.assigneeIds)) {
        assigneeIds = editingTask.assigneeIds;
      } else if (editingTask.assignee) {
        assigneeIds = [editingTask.assignee];
      } else if (editingTask.assigneeName) {
        const match = ASSIGNEE_OPTIONS.find(
          (a) => a.label.toLowerCase() === editingTask.assigneeName.toLowerCase()
        );
        if (match) assigneeIds = [match.value];
      }

      setFormData({
        title:       editingTask.task     || editingTask.title || "",
        module:      editingTask.module   || "",
        assigneeIds,
        priority:    editingTask.priority?.toLowerCase() || "",
        status:      editingTask.status?.toLowerCase()   || "",
        startDate: editingTask.startDate ? new Date(editingTask.startDate) : null,
        endDate:    editingTask.endDate ? new Date(editingTask.endDate) : null,
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
    if (!formData.title.trim())         e.title       = "Title is required";
    if (!formData.assigneeIds.length)   e.assigneeIds = "Assignee is required";
    if (!formData.priority)             e.priority    = "Priority is required";
    if (!formData.status)               e.status      = "Status is required";
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
        <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
          <DialogHeader
            title={editingTask ? "Edit Task" : "Add Task"}
            onClose={handleClose}
          />

          <DialogBody>
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

              {/* Title */}
              <Box>
                <CustomInputLabel label="Title" />
                <TextInput
                  placeholder="Enter Title"
                  value={formData.title}
                  onChange={handleChange("title")}
                  inputBgColor="#fff"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Box>

              {/* Module */}
              <Box>
                <CustomInputLabel label="Module" />
                <TextInput
                  placeholder="Enter Module"
                  value={formData.module}
                  onChange={handleChange("module")}
                  inputBgColor="#fff"
                  fullWidth
                />
              </Box>
               <Box>
                  <CustomInputLabel label="Departments" />
                  <CustomSelect
                    value={formData.priority}
                    onChange={handleChange("priority")}
                    fullWidth
                    height="45px"
                    inputBgColor="#fff"
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {DEPARTMENT_OPTIONS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </CustomSelect>
                  {errors.department && (
                    <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                      {errors.department}
                    </Typography>
                  )}
                </Box>

              {/* Assignees — multi-select */}
              <Box>
                <CustomInputLabel label="Assignee" />
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

              {/* Priority + Status */}
              <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
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
                    {PRIORITY_OPTIONS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </CustomSelect>
                  {errors.priority && (
                    <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                      {errors.priority}
                    </Typography>
                  )}
                </Box>
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
                value={formData.deadline}
                onChange={(v) => setFormData((prev) => ({ ...prev, deadline: v }))}
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
        message="Save Successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AddTask;