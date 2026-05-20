import { useState, useEffect } from "react";
import {
  Box, MenuItem, Typography, Avatar, Checkbox,
  CircularProgress, IconButton,
} from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";
import { X, Paperclip } from "lucide-react";
import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../../style/style";

const PRIORITY_OPTIONS = [
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
];

const PIPELINE_STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const TASK_STATUS_OPTIONS = [
  { value: "new",          label: "New"          },
  { value: "in_progress",  label: "In Progress"  },
  { value: "under_review", label: "Under Review" },
  { value: "completed",    label: "Completed"    },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: { borderRadius: "14px", mt: 0.5, boxShadow: "0px 8px 24px rgba(0,0,0,0.10)", maxHeight: 300 },
  },
};

const INITIAL_FORM = {
  title:          "",
  module:         "",
  department:     "",
  assigneeIds:    [],
  description:    "",
  priority:       "",
  pipelineStatus: "",
  taskStatus:     "",
  startDate:      null,
  endDate:        null,
  attachments:    [],
};

const AddTask = ({
  open,
  onClose,
  onSave,
  editingTask       = null,
  loading           = false,
  apiError          = "",
  moduleOptions     = [],
  departmentOptions = [],
  deptEmployees     = [],
  deptEmpLoading    = false,
  onDepartmentChange,
  allEmployees = [],
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setFormData({
        title:          editingTask.task           || editingTask.title || "",
        module:         editingTask.moduleId       || "",
        department:     editingTask.departmentId   || "",
        assigneeIds:    editingTask.assigneeIds    || [],
        description:    editingTask.description    || "",
        priority:       editingTask.priority?.toLowerCase()       || "",
        pipelineStatus: (editingTask.pipelineStatus || editingTask.status || "").toLowerCase(),
        taskStatus:     editingTask.taskStatus?.toLowerCase()     || "",
        startDate: editingTask.startDateRaw ? new Date(editingTask.startDateRaw) : null,
        endDate:   editingTask.endDateRaw   ? new Date(editingTask.endDateRaw)   : null,
        attachments:    [],
      });
      if (editingTask.departmentId) onDepartmentChange?.(editingTask.departmentId);
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingTask, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "department") {
      setFormData((prev) => ({ ...prev, department: val, assigneeIds: [] }));
      onDepartmentChange?.(val);
    }
  };

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    e.target.value = "";
  };

  const handleFileRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title          = "Title is required";
    if (!formData.assigneeIds.length) e.assigneeIds    = "At least one assignee is required";
    if (!formData.priority)           e.priority       = "Priority is required";
    if (!formData.pipelineStatus)     e.pipelineStatus = "Pipeline status is required";
    if (!formData.taskStatus)         e.taskStatus     = "Task status is required";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave?.(formData);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
        <DialogHeader title={editingTask ? "Edit Task" : "Add Task"} onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
          }}>

            {apiError && (
              <Box px={1.5} py={1} sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}>
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* 1. Module */}
            <Box>
              <CustomInputLabel label="Module" />
              <CustomSelect value={formData.module} onChange={handleChange("module")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  moduleOptions.find((m) => m._id === v)?.title || (
                    <Typography fontSize={13} color="text.secondary">Select Module</Typography>
                  )
                }
              >
                <MenuItem value="">None</MenuItem>
                {moduleOptions.map((m) => (
                  <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* 2. Department */}
            <Box>
              <CustomInputLabel label="Department" />
              <CustomSelect value={formData.department} onChange={handleChange("department")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  departmentOptions.find((d) => d._id === v)?.name || (
                    <Typography fontSize={13} color="text.secondary">Select Department</Typography>
                  )
                }
              >
                <MenuItem value="">None</MenuItem>
                {departmentOptions.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* 3. Assignees */}
            <Box>
              <CustomInputLabel label="Assignees *" />
              {deptEmpLoading ? (
                <Box display="flex" alignItems="center" gap={1} py={1}>
                  <CircularProgress size={16} sx={{ color: "#AA2493" }} />
                  <Typography fontSize={13} color="text.secondary">Loading employees...</Typography>
                </Box>
              ) : (
                <CustomSelect multiple value={formData.assigneeIds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assigneeIds: e.target.value }))}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(selected) => {
                    if (!selected?.length) return <Typography fontSize={13} color="text.secondary">Select assignees</Typography>;
                    const employeeList = formData.department ? deptEmployees : allEmployees;
                    const matched = employeeList.filter((e) => selected.includes(e._id));
                    if (!matched.length) return <Typography fontSize={13} color="text.secondary">{selected.length} selected</Typography>;
                    return (
                      <Box display="flex" alignItems="center" gap={0.75} overflow="hidden">
                        <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
                          {matched.slice(0, 4).map((m) => (
                            <Avatar key={m._id} src={m.avatar}
                              sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700,
                                background: "linear-gradient(135deg, #AA2493, #022179)",
                                color: "#fff", border: "1.5px solid #fff" }}
                            >{getInitials(m.fullName)}</Avatar>
                          ))}
                        </Box>
                        <Typography fontSize={13} noWrap>
                          {matched.length === 1 ? matched[0].fullName : `${matched[0].fullName} +${matched.length - 1} more`}
                        </Typography>
                      </Box>
                    );
                  }}
                  MenuProps={multiMenuProps}
                >
                  {(() => {
                    const employeeList = formData.department ? deptEmployees : allEmployees;
                    if (employeeList.length === 0) {
                      return (
                        <MenuItem disabled>
                          <Typography fontSize={13} color="text.secondary">No employees found</Typography>
                        </MenuItem>
                      );
                    }
                    return employeeList.map((emp) => {
                      const isSelected = formData.assigneeIds.includes(emp._id);
                      return (
                        <MenuItem key={emp._id} value={emp._id} disableRipple
                          sx={{ px: 1.5, py: 1, gap: 1.5,
                            backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                            "&:hover": { backgroundColor: "#F5F5F5" },
                            "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                          }}
                        >
                          <Avatar src={emp.avatar}
                            sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                              background: "linear-gradient(135deg, #AA2493, #022179)",
                              color: "#fff", flexShrink: 0 }}
                          >{getInitials(emp.fullName)}</Avatar>
                          <Typography fontSize="13px" fontWeight={500} sx={{ flex: 1 }}>{emp.fullName}</Typography>
                          <Checkbox checked={isSelected} disableRipple
                            sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                          />
                        </MenuItem>
                      );
                    });
                  })()}
                </CustomSelect>
              )}
              {errors.assigneeIds && <Typography fontSize="12px" color="error" mt={0.5}>{errors.assigneeIds}</Typography>}
            </Box>

            {/* 4. Title */}
            <Box>
              <CustomInputLabel label="Title *" />
              <TextInput placeholder="Enter Title" value={formData.title}
                onChange={handleChange("title")} inputBgColor="#fff" fullWidth
                error={!!errors.title} helperText={errors.title} />
            </Box>

            {/* 5. Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput placeholder="Enter description" value={formData.description}
                onChange={handleChange("description")} inputBgColor="#fff"
                fullWidth multiline rows={3} />
            </Box>

            {/* 6. Priority */}
            <Box>
              <CustomInputLabel label="Priority *" />
              <CustomSelect value={formData.priority} onChange={handleChange("priority")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  PRIORITY_OPTIONS.find((p) => p.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Priority</Typography>
                  )
                }
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.priority && <Typography fontSize="12px" color="error" mt={0.5}>{errors.priority}</Typography>}
            </Box>

            {/* 7. Pipeline Status */}
            <Box>
              <CustomInputLabel label="Pipeline Status *" />
              <CustomSelect value={formData.pipelineStatus} onChange={handleChange("pipelineStatus")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  PIPELINE_STATUS_OPTIONS.find((s) => s.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Pipeline Status</Typography>
                  )
                }
              >
                {PIPELINE_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.pipelineStatus && <Typography fontSize="12px" color="error" mt={0.5}>{errors.pipelineStatus}</Typography>}
            </Box>

            {/* 8. Task Status */}
            <Box>
              <CustomInputLabel label="Task Status *" />
              <CustomSelect value={formData.taskStatus} onChange={handleChange("taskStatus")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  TASK_STATUS_OPTIONS.find((s) => s.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Task Status</Typography>
                  )
                }
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.taskStatus && <Typography fontSize="12px" color="error" mt={0.5}>{errors.taskStatus}</Typography>}
            </Box>

            {/* 9. Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date" />
                <DatePicker value={formData.startDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, startDate: v }))}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  sx={GlobalStyle.datePickerStyle}
                />
              </Box>
              <Box>
                <CustomInputLabel label="End Date" />
                <DatePicker value={formData.endDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, endDate: v }))}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  sx={GlobalStyle.datePickerStyle}
                />
              </Box>
            </Box>

            {/* 10. Attachments */}
            <Box>
              <CustomInputLabel label="Attachments" />
              <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {formData.attachments.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {formData.attachments.map((file, i) => (
                      <Box key={i} display="flex" alignItems="center" justifyContent="space-between"
                        sx={{ backgroundColor: "#F5F5F5", borderRadius: "10px", px: 1.5, py: 1 }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Paperclip size={13} color="#808080" />
                          <Typography fontSize="12px" color="text.primary" noWrap sx={{ maxWidth: 220 }}>
                            {file.name}
                          </Typography>
                          <Typography fontSize="11px" color="text.secondary">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleFileRemove(i)} sx={{ p: 0.3 }}>
                          <X size={14} color="#FF3B30" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                <Box component="label" sx={{
                  display: "inline-flex", alignItems: "center", gap: 1,
                  px: "14px", py: "7px", borderRadius: "8px",
                  backgroundColor: "#F5F5F5", fontSize: "13px", fontWeight: 500,
                  color: "#374151", cursor: "pointer", border: "1px solid #E0E0E0",
                  alignSelf: "flex-start", fontFamily: '"Poppins", sans-serif',
                  "&:hover": { backgroundColor: "#EBEBEB" },
                }}>
                  <Paperclip size={13} />
                  {formData.attachments.length > 0 ? "Add More Files" : "Choose Files"}
                  <input type="file" hidden multiple onChange={handleFileAdd} />
                </Box>
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
              : editingTask ? "Update Task" : "Save Task"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddTask;