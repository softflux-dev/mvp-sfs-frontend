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

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const INITIAL_FORM = {
  title:    "",
  module:   "",
  assignee: "",
  priority: "",
  status:   "",
  deadline: null,
};

// ── Helper: map display name → option value ────────────────────────────────
const nameToValue = (name = "") => {
  const found = ASSIGNEE_OPTIONS.find(
    (a) => a.label.toLowerCase() === name.toLowerCase()
  );
  return found ? found.value : name.toLowerCase().replace(" ", "_");
};

const AddTask = ({ open, onClose, onSave, editingTask = null, loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title:    editingTask.task          || editingTask.title    || "",
        module:   editingTask.module        || "",
        // ✅ map assigneeName (display) → value for CustomSelect
        assignee: editingTask.assignee
          ? editingTask.assignee
          : nameToValue(editingTask.assigneeName || ""),
        priority: editingTask.priority?.toLowerCase() || "",
        status:   editingTask.status?.toLowerCase()   || "",
        deadline: editingTask.deadline
          ? new Date(editingTask.deadline)
          : null,
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
    if (!formData.title.trim()) e.title    = "Title is required";
    if (!formData.assignee)     e.assignee = "Assignee is required";
    if (!formData.priority)     e.priority = "Priority is required";
    if (!formData.status)       e.status   = "Status is required";
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

              {/* Assignee */}
              <Box>
                <CustomInputLabel label="Assignee" />
                <CustomSelect
                  value={formData.assignee}
                  onChange={handleChange("assignee")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                  <MenuItem value="">Select Assignee</MenuItem>
                  {ASSIGNEE_OPTIONS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.assignee && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.assignee}
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

              {/* Deadline */}
              <Box>
                <CustomInputLabel label="Deadline" />
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