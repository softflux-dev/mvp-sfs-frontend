import { useState, useEffect } from "react";
import {
  Box, MenuItem, Typography, Avatar, Checkbox,
  CircularProgress, IconButton, Chip,
} from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";
import { X, Paperclip } from "lucide-react";

import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import { getPMProjectsApi, getProjectByIdApi, getProjectTeamApi } from "../../../api/modules/project";
import { getModulesApi }    from "../../../api/modules/module";
import { getDepartmentsApi } from "../../../api/modules/department";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
];

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const INITIAL_FORM = {
  project:     "",
  module:      "",
  title:       "",
  description: "",
  priority:    "",
  taskStatus:  "",
  startDate:   null,
  endDate:     null,
  attachments: [],
};

const AddTaskDialog = ({
  open,
  onClose,
  onSave,
  editingTask  = null,
  loading      = false,
  projects: projectsProp = [],
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  const [projects,        setProjects]        = useState(projectsProp);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [modules,         setModules]         = useState([]);
  const [modulesLoading,  setModulesLoading]  = useState(false);
  const [stages,          setStages]          = useState(DEFAULT_STAGES);
  const [stagesLoading,   setStagesLoading]   = useState(false);

  // ── Team + dept state ─────────────────────────────────────────────────────
  const [allDepartments,  setAllDepartments]  = useState([]);  // all from API
  const [teamMembers,     setTeamMembers]     = useState([]);  // project team
  const [teamLoading,     setTeamLoading]     = useState(false);
  const [selectedDept,    setSelectedDept]    = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // ── Derived: only depts that appear in the team ───────────────────────────
  const teamDeptIds = [...new Set(teamMembers.map((m) => m.departmentId).filter(Boolean))];
  const teamDepts   = allDepartments.filter((d) => teamDeptIds.includes(d._id));

  // ── Employees of selected dept, from team only ────────────────────────────
  const deptEmployees = selectedDept
    ? teamMembers.filter((e) => e.departmentId === selectedDept)
    : [];

  const selectedIds = selectedMembers.map((m) => m._id);

  // ── Load projects if not passed in ───────────────────────────────────────
  useEffect(() => {
    if (projectsProp.length > 0) { setProjects(projectsProp); return; }
    setProjectsLoading(true);
    getPMProjectsApi({ limit: 100 })
      .then((res) => {
        if (res?.status === 200 || res?.status === 201)
          setProjects(res.data.data.projects || []);
      })
      .finally(() => setProjectsLoading(false));
  }, []);

  // ── Load ALL departments once on mount (same as TasksTab → useDepartment) ─
  useEffect(() => {
    getDepartmentsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201)
        setAllDepartments(res.data.data.departments || []);
    });
  }, []);

  // ── When project changes: load modules, stages, and team ─────────────────
  useEffect(() => {
    if (!formData.project) {
      setModules([]);
      setStages(DEFAULT_STAGES);
      setTeamMembers([]);
      setSelectedDept("");
      setSelectedMembers([]);
      return;
    }

    // modules
    setModulesLoading(true);
    getModulesApi(formData.project)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201)
          setModules(res.data.data.modules || []);
        else setModules([]);
      })
      .catch(() => setModules([]))
      .finally(() => setModulesLoading(false));

    // stages — from getProjectByIdApi
    setStagesLoading(true);
    getProjectByIdApi(formData.project)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          const s = res.data.data.project?.stages;
          setStages(s?.length ? s : DEFAULT_STAGES);
        }
      })
      .finally(() => setStagesLoading(false));

    // team — getProjectTeamApi, normalize to same shape as TasksTab teamEmployees
    setTeamLoading(true);
    getProjectTeamApi(formData.project)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          const team = res.data.data.team || [];
          setTeamMembers(
            team.map((m) => ({
              _id:          m._id,
              fullName:     m.name || m.fullName || "",
              avatar:       m.avatar        || "",
              departmentId: m.departmentId  || "",
              designation:  m.role          || m.designation || "",
            }))
          );
        }
      })
      .finally(() => setTeamLoading(false));

  }, [formData.project]);

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      const projectId = editingTask.projectId || editingTask.project?._id || editingTask.project || "";
      const moduleId  = editingTask.moduleId  || editingTask.module?._id  || editingTask.module  || "";
      const taskStatus = (editingTask.taskStatus || editingTask.status || "").toLowerCase().replace(/ /g, "_");
      const startDate  = editingTask.startDateRaw ? new Date(editingTask.startDateRaw)
        : editingTask.startDate ? new Date(editingTask.startDate) : null;
      const endDate    = editingTask.endDateRaw   ? new Date(editingTask.endDateRaw)
        : editingTask.endDate   ? new Date(editingTask.endDate)   : null;

      setFormData({
        project:     projectId,
        module:      moduleId,
        title:       editingTask.title || editingTask.task || "",
        description: editingTask.description || "",
        priority:    (editingTask.priority || "").toLowerCase(),
        taskStatus,
        startDate,
        endDate,
        attachments: [],
      });
    } else {
      setFormData(INITIAL_FORM);
      setSelectedMembers([]);
      setSelectedDept("");
    }
    setErrors({});
  }, [editingTask, open]);

  // ── Restore assignees once teamMembers loads (for edit mode) ─────────────
  useEffect(() => {
    if (!editingTask || !teamMembers.length) return;
    const restored = (editingTask.assigneeIds || []).map((id, i) => {
      const match = teamMembers.find((e) => e._id === id);
      return match
        ? { _id: match._id, fullName: match.fullName, avatar: match.avatar || "", departmentId: match.departmentId || "" }
        : { _id: id, fullName: editingTask.assigneeNames?.[i] || id, avatar: "", departmentId: "" };
    });
    if (restored.length) setSelectedMembers(restored);
  }, [teamMembers]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "project") {
        next.module     = "";
        next.taskStatus = "";
        setSelectedDept("");
        setSelectedMembers([]);
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleToggleEmployee = (emp) => {
    setSelectedMembers((prev) => {
      const already = prev.find((m) => m._id === emp._id);
      if (already) return prev.filter((m) => m._id !== emp._id);
      return [...prev, {
        _id: emp._id, fullName: emp.fullName,
        avatar: emp.avatar || "", departmentId: emp.departmentId || "",
      }];
    });
    if (errors.assigneeIds) setErrors((prev) => ({ ...prev, assigneeIds: "" }));
  };

  const handleRemoveMember = (id) =>
    setSelectedMembers((prev) => prev.filter((m) => m._id !== id));

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    e.target.value = "";
  };

  const handleFileRemove = (index) =>
    setFormData((prev) => ({
      ...prev, attachments: prev.attachments.filter((_, i) => i !== index),
    }));

  const validate = () => {
    const e = {};
    if (!formData.project)      e.project     = "Project is required";
    if (!formData.title.trim()) e.title       = "Task title is required";
    if (!selectedIds.length)    e.assigneeIds = "At least one assignee is required";
    if (!formData.priority)     e.priority    = "Priority is required";
    if (!formData.taskStatus)   e.taskStatus  = "Task status is required";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const primaryDept = selectedMembers[0]?.departmentId || null;
    onSave?.({ ...formData, assigneeIds: selectedIds, department: primaryDept });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setSelectedMembers([]);
    setSelectedDept("");
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="560px" fullWidth>
        <DialogHeader title={editingTask ? "Edit Task" : "Add New Task"} onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5,
            display: "flex", flexDirection: "column", gap: 2,
          }}>

            {/* 1. Project */}
            <Box>
              <CustomInputLabel label="Project *" />
              <CustomSelect value={formData.project} onChange={handleChange("project")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={projectsLoading}
                renderValue={(v) => {
                  if (projectsLoading) return <Typography fontSize={13} color="text.secondary">Loading projects...</Typography>;
                  if (!v) return <Typography fontSize={13} color="text.secondary">Select project</Typography>;
                  return projects.find((p) => p._id === v)?.projectName || v;
                }}
              >
                {projects.length === 0
                  ? <MenuItem disabled>No projects available</MenuItem>
                  : projects.map((p) => <MenuItem key={p._id} value={p._id}>{p.projectName}</MenuItem>)
                }
              </CustomSelect>
              {errors.project && <Typography fontSize="12px" color="error" mt={0.5}>{errors.project}</Typography>}
            </Box>

            {/* 2. Module */}
            <Box>
              <CustomInputLabel label="Module" />
              <CustomSelect value={formData.module} onChange={handleChange("module")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={!formData.project || modulesLoading}
                renderValue={(v) => {
                  if (modulesLoading) return <Typography fontSize={13} color="text.secondary">Loading modules...</Typography>;
                  if (!v) return <Typography fontSize={13} color="text.secondary">{formData.project ? "Select module" : "Select a project first"}</Typography>;
                  return modules.find((m) => m._id === v)?.title || v;
                }}
              >
                <MenuItem value="">None</MenuItem>
                {modules.map((m) => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)}
              </CustomSelect>
            </Box>

            {/* 3. Assignee chips */}
            {selectedMembers.length > 0 && (
              <Box>
                <CustomInputLabel label={`Assignees (${selectedMembers.length})`} />
                <Box sx={{
                  display: "flex", flexWrap: "wrap", gap: 1,
                  backgroundColor: "#fff", borderRadius: "10px",
                  border: "1px solid #E5E7EB", p: 1.5, minHeight: 48,
                }}>
                  {selectedMembers.map((m) => (
                    <Chip key={m._id}
                      avatar={
                        <Avatar src={m.avatar}
                          sx={{ background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "9px", fontWeight: 700, color: "#fff" }}
                        >{getInitials(m.fullName)}</Avatar>
                      }
                      label={m.fullName}
                      onDelete={() => handleRemoveMember(m._id)}
                      size="small"
                      sx={{
                        backgroundColor: "#F3E8FB", color: "#AA2493", fontWeight: 500, fontSize: "12px",
                        "& .MuiChip-deleteIcon": { color: "#AA2493", "&:hover": { color: "#7a1a6b" } },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 4. Department — filtered to team depts only */}
            <Box>
              <CustomInputLabel label="Select Department *" />
              <CustomSelect
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  if (errors.assigneeIds) setErrors((prev) => ({ ...prev, assigneeIds: "" }));
                }}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={!formData.project || teamLoading}
                renderValue={(v) => {
                  if (!formData.project) return <Typography fontSize={13} color="text.secondary">Select a project first</Typography>;
                  if (teamLoading)       return <Typography fontSize={13} color="text.secondary">Loading team...</Typography>;
                  return teamDepts.find((d) => d._id === v)?.name || (
                    <Typography fontSize={13} color="text.secondary">Select Department</Typography>
                  );
                }}
              >
                {teamDepts.length === 0 ? (
                  <MenuItem disabled>
                    <Typography fontSize={13} color="text.secondary">
                      {formData.project ? "No team assigned to this project yet" : "Select a project first"}
                    </Typography>
                  </MenuItem>
                ) : teamDepts.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* 5. Team members list */}
            {selectedDept && (
              <Box>
                <CustomInputLabel label="Team Members" />
                {deptEmployees.length === 0 ? (
                  <Box px={1.5} py={1.5} sx={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                    <Typography fontSize={13} color="text.secondary">No team members in this department.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                    {deptEmployees.map((emp, index) => {
                      const isSelected = selectedIds.includes(emp._id);
                      return (
                        <Box key={emp._id} onClick={() => handleToggleEmployee(emp)}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1.5,
                            px: 1.5, py: 1, cursor: "pointer",
                            backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                            borderBottom: index < deptEmployees.length - 1 ? "1px solid #F3F4F6" : "none",
                            "&:hover": { backgroundColor: "#F5F5F5" },
                            transition: "background-color 0.15s",
                          }}
                        >
                          <Avatar src={emp.avatar}
                            sx={{ width: 34, height: 34, fontSize: "11px", fontWeight: 600,
                              background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", flexShrink: 0 }}
                          >{getInitials(emp.fullName)}</Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography fontSize="13px" fontWeight={500} noWrap>{emp.fullName}</Typography>
                            <Typography fontSize="11px" color="text.secondary" noWrap>{emp.designation || ""}</Typography>
                          </Box>
                          <Checkbox checked={isSelected} disableRipple
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleEmployee(emp)}
                            sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {errors.assigneeIds && (
              <Typography fontSize="12px" color="error" mt={-1}>{errors.assigneeIds}</Typography>
            )}

            {/* 6. Title */}
            <Box>
              <CustomInputLabel label="Task Title *" />
              <TextInput placeholder="Enter task title" value={formData.title}
                onChange={handleChange("title")} inputBgColor="#fff" fullWidth
                error={!!errors.title} helperText={errors.title} />
            </Box>

            {/* 7. Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput placeholder="Task description..." value={formData.description}
                onChange={handleChange("description")} inputBgColor="#fff" fullWidth multiline rows={3} />
            </Box>

            {/* 8. Priority */}
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
                {PRIORITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </CustomSelect>
              {errors.priority && <Typography fontSize="12px" color="error" mt={0.5}>{errors.priority}</Typography>}
            </Box>

            {/* 9. Task Status — dynamic from project stages */}
            <Box>
              <CustomInputLabel label="Task Status *" />
              <CustomSelect value={formData.taskStatus} onChange={handleChange("taskStatus")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={!formData.project || stagesLoading}
                renderValue={(v) => {
                  if (!formData.project) return <Typography fontSize={13} color="text.secondary">Select a project first</Typography>;
                  if (stagesLoading)     return <Typography fontSize={13} color="text.secondary">Loading statuses...</Typography>;
                  return stages.find((s) => s.id === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Task Status</Typography>
                  );
                }}
              >
                {stages.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
              </CustomSelect>
              {errors.taskStatus && <Typography fontSize="12px" color="error" mt={0.5}>{errors.taskStatus}</Typography>}
            </Box>

            {/* 10. Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date" />
                <DatePicker value={formData.startDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, startDate: v }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "dd/mm/yyyy" } }}
                  sx={{ ...GlobalStyle.datePickerStyle, width: "100%",
                    "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } },
                  }}
                />
              </Box>
              <Box>
                <CustomInputLabel label="End Date" />
                <DatePicker value={formData.endDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, endDate: v }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "dd/mm/yyyy" } }}
                  sx={{ ...GlobalStyle.datePickerStyle, width: "100%",
                    "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } },
                  }}
                />
              </Box>
            </Box>

            {/* 11. Attachments */}
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
                          <Typography fontSize="12px" noWrap sx={{ maxWidth: 260 }}>{file.name}</Typography>
                          <Typography fontSize="11px" color="text.secondary">({(file.size / 1024).toFixed(0)} KB)</Typography>
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

export default AddTaskDialog;