// src/app/admin/projects/projectDetailTabs/addTask.jsx — 
// When `showProjectSelector` is true (PM task management page),
// a project dropdown appears first and drives module/team/stage loading.

import { useState, useEffect, useRef }       from "react";
import {
  Box, MenuItem, Typography, Avatar, Checkbox,
  CircularProgress, IconButton, Chip,
} from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";
import { X, Paperclip, Link }   from "lucide-react";

import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../../style/style";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUpload";

import { getProjectTeamApi, getProjectByIdApi } from "../../../../api/modules/project";
import { getModulesApi }    from "../../../../api/modules/module";
import { useDepartment }    from "../../../../hooks/department";

const PRIORITY_OPTIONS = [
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
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
  title:       "",
  module:      "",
  description: "",
  priority:    "",
  status:      "",
  startDate:   null,
  endDate:     null,
  link:        "",
  attachments: [],
};

const AddTask = ({
  open,
  onClose,
  onSave,
  editingTask       = null,
  loading           = false,
  apiError          = "",
  // ── Static props (used when opened from project detail TasksTab) ──────────
  moduleOptions     = [],
  departmentOptions = [],
  teamEmployees     = [],
  stages            = DEFAULT_STAGES,
  projectStartDate  = null,   
  projectEndDate    = null,
  // ── Dynamic props (used when opened from PM task management page) ─────────
  showProjectSelector = false,   // true → show project dropdown + fetch data dynamically
  projects            = [],      // list of PM's projects
}) => {
  const [formData,       setFormData]       = useState(INITIAL_FORM);
  const [errors,         setErrors]         = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const fieldRefs = {
    project:     useRef(null),
    module:      useRef(null),
    assigneeIds: useRef(null),
    title:       useRef(null),
    priority:    useRef(null),
    status:      useRef(null),
    startDate:   useRef(null),
    endDate:     useRef(null),
  };

  // ── Project-driven dynamic data (only used when showProjectSelector=true) ──
  const [selectedProject,   setSelectedProject]   = useState("");
  const [dynModules,        setDynModules]        = useState([]);
  const [dynTeamEmployees,  setDynTeamEmployees]  = useState([]);
  const [dynDeptOptions,    setDynDeptOptions]    = useState([]);
  const [dynStages,         setDynStages]         = useState(DEFAULT_STAGES);
  const [dynProjectDates,   setDynProjectDates]   = useState({ startDate: null, endDate: null }); // ← NEW

  const [projectLoading,    setProjectLoading]    = useState(false);

  const { departments, fetchDepartments } = useDepartment();

  // Resolve which set of data to use
  const activeModules   = showProjectSelector ? dynModules       : moduleOptions;
  const activeTeam      = showProjectSelector ? dynTeamEmployees : teamEmployees;
  const activeDepts     = showProjectSelector ? dynDeptOptions   : departmentOptions;
  const activeStages    = showProjectSelector ? dynStages        : stages;
  const activeProjectStart = showProjectSelector ? dynProjectDates.startDate : projectStartDate;   
  const activeProjectEnd   = showProjectSelector ? dynProjectDates.endDate   : projectEndDate; 

  // ── Fetch project data when project changes ───────────────────────────────
  useEffect(() => {
    if (!showProjectSelector || !selectedProject) {
      setDynModules([]);
      setDynTeamEmployees([]);
      setDynDeptOptions([]);
      setDynStages(DEFAULT_STAGES);
      setDynProjectDates({ startDate: null, endDate: null });
      return;
    }
    setProjectLoading(true);
    Promise.all([
      getProjectByIdApi(selectedProject),
      getProjectTeamApi(selectedProject),
      getModulesApi(selectedProject),
      fetchDepartments({ limit: 100 }),
    ]).then(([projRes, teamRes, modRes]) => {
      if (projRes?.status === 200 || projRes?.status === 201) {
        const saved = projRes.data.data.project?.stages;
        setDynStages(saved?.length ? saved : DEFAULT_STAGES);
      }
      if (teamRes?.status === 200 || teamRes?.status === 201) {
        const team = teamRes.data.data.team || [];
        const teamDeptIds = [...new Set(team.map((m) => m.departmentId).filter(Boolean))];
        setDynTeamEmployees(team.map((m) => ({
          _id:          m._id,
          fullName:     m.fullName || m.name,
          avatar:       m.avatar        || "",
          designation:  m.designation   || m.role || "",
          departmentId: m.departmentId  || "",
        })));
        setDynDeptOptions(departments.filter((d) => teamDeptIds.includes(d._id)));
      }
      if (modRes?.status === 200 || modRes?.status === 201) {
        setDynModules(modRes.data.data.modules || []);
      }
    }).finally(() => setProjectLoading(false));
  }, [selectedProject, showProjectSelector]);

  // Update dynDeptOptions when departments load
  useEffect(() => {
    if (!showProjectSelector || !dynTeamEmployees.length) return;
    const teamDeptIds = [...new Set(dynTeamEmployees.map((m) => m.departmentId).filter(Boolean))];
    setDynDeptOptions(departments.filter((d) => teamDeptIds.includes(d._id)));
  }, [departments]);

  // ── Multi-dept assignee selection ─────────────────────────────────────────
  const [selectedDept,    setSelectedDept]    = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const deptEmployees = selectedDept
    ? activeTeam.filter((e) => e.departmentId === selectedDept)
    : [];

  const selectedIds = selectedMembers.map((m) => m._id);

  const handleToggleEmployee = (emp) => {
    setSelectedMembers((prev) => {
      const already = prev.find((m) => m._id === emp._id);
      if (already) return prev.filter((m) => m._id !== emp._id);
      return [...prev, { _id: emp._id, fullName: emp.fullName, avatar: emp.avatar || "", departmentId: emp.departmentId || "" }];
    });
    if (errors.assigneeIds) setErrors((prev) => ({ ...prev, assigneeIds: "" }));
  };

  const handleRemoveMember = (id) =>
    setSelectedMembers((prev) => prev.filter((m) => m._id !== id));

  // ── Sync form when editingTask or open changes ────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (editingTask) {
      const savedStatus  = editingTask.status || editingTask.pipelineStatus || "";
      const statusValid  = activeStages.some((s) => s.id === savedStatus);
      const resolvedStatus = statusValid ? savedStatus : (activeStages[0]?.id || "");

      setFormData({
        title:       editingTask.task         || editingTask.title       || "",
        module:      editingTask.moduleId     || editingTask.module?._id || editingTask.module || "",
        description: editingTask.description  || "",
        priority:    editingTask.priority?.toLowerCase() || "",
        status:      resolvedStatus,
        startDate:   editingTask.startDateRaw ? new Date(editingTask.startDateRaw) : null,
        endDate:     editingTask.endDateRaw   ? new Date(editingTask.endDateRaw)   : null,
        link:        editingTask.link         || "",
        attachments: (editingTask.attachments || []).map((att) => ({
          url:         att.url      || "",
          publicId:    att.publicId || "",
          fileName:    att.fileName || att.name || "",
          fileSize:    att.fileSize || att.size || "",
          previewName: att.fileName || att.name || "",
          previewSize: att.fileSize || att.size || "",
          isExisting:  true,
        })),
      });

      if (showProjectSelector && editingTask.projectId) {
        setSelectedProject(editingTask.projectId);
      }

      const restored = (editingTask.assigneeIds || []).map((id, i) => {
        const match = activeTeam.find((e) => e._id === id);
        return match
          ? { _id: match._id, fullName: match.fullName, avatar: match.avatar || "", departmentId: match.departmentId || "" }
          : { _id: id, fullName: editingTask.assigneeNames?.[i] || id, avatar: editingTask.assigneeAvatars?.[i] || "", departmentId: "" };
      });
      setSelectedMembers(restored);
      setSelectedDept(restored[0]?.departmentId || editingTask.departmentId || "");

    } else {
      setFormData({ ...INITIAL_FORM, status: activeStages[0]?.id || "" });
      setSelectedMembers([]);
      setSelectedDept("");
      if (showProjectSelector) setSelectedProject("");
    }
    setErrors({});
  }, [editingTask, open]);

  // Update default status when stages load for new task
  useEffect(() => {
    if (!open || editingTask) return;
    setFormData((prev) => ({ ...prev, status: activeStages[0]?.id || "" }));
  }, [activeStages]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files || []).map((file) => ({
      file,
      previewName: file.name,
      previewSize: (file.size / 1024).toFixed(0) + " KB",
    }));
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    e.target.value = "";
  };

  const handleFileRemove = (index) => {
    setFormData((prev) => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())                      e.title       = "Title is required";
    if (!formData.module)                            e.module      = "Module is required";
    if (!selectedIds.length)                         e.assigneeIds = "At least one assignee is required";
    if (!formData.priority)                          e.priority    = "Priority is required";
    if (!formData.status)                            e.status      = "Task status is required";
    if (showProjectSelector && !selectedProject)     e.project     = "Project is required";

    if (!formData.startDate) {
      e.startDate = "Start date is required.";
    } else if (activeProjectStart) {
      const start = new Date(formData.startDate); start.setHours(0, 0, 0, 0);
      const projStart = new Date(activeProjectStart); projStart.setHours(0, 0, 0, 0);
      if (start < projStart) {
        e.startDate = `Task start date cannot be before the project start date (${projStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}).`;
      }
    }

    if (!formData.endDate) {
      e.endDate = "End date is required.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(formData.endDate);
      end.setHours(0, 0, 0, 0);
      if (end < today) e.endDate = "End date cannot be in the past.";
      if (formData.startDate && end <= new Date(formData.startDate)) {
        e.endDate = "End date must be after the start date.";
      }
      if (!e.endDate && activeProjectEnd) {
        const projEnd = new Date(activeProjectEnd); projEnd.setHours(0, 0, 0, 0);
        if (end > projEnd) {
          e.endDate = `Task end date cannot be after the project deadline (${projEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}).`;
        }
      }
    }
    return e;
  };
const FIELD_ORDER = ["project", "module", "assigneeIds", "title", "priority", "status", "startDate", "endDate"];

   const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);

      const firstErrorField = FIELD_ORDER.find((f) => errs[f]);
      if (firstErrorField && fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block:    "center",
        });
      }
      return;
    }

    // Upload new files to Cloudinary
    const existingAtts  = formData.attachments.filter((a) => a.isExisting);
    const filesToUpload = formData.attachments.filter((a) => a.file);
    let uploadedNew = [];

    if (filesToUpload.length > 0) {
      setUploadingFiles(true);
      try {
        uploadedNew = await Promise.all(filesToUpload.map((a) => uploadToCloudinary(a.file, "tasks")));
      } catch (err) {
        console.error("Attachment upload failed:", err.message);
      } finally {
        setUploadingFiles(false);
      }
    }

    const primaryDept = selectedMembers[0]?.departmentId || null;

    onSave?.({
      ...formData,
      project:      showProjectSelector ? selectedProject : undefined,
      assigneeIds:  selectedIds,
      department:   primaryDept,
      attachments:  [...existingAtts, ...uploadedNew],
    });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setSelectedMembers([]);
    setSelectedDept("");
    if (showProjectSelector) setSelectedProject("");
    setErrors({});
    onClose?.();
  };

  const isSaving = loading || uploadingFiles;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
        <DialogHeader title={editingTask ? "Edit Task" : "Add Task"} onClose={handleClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

            {apiError && (
              <Box px={1.5} py={1} sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}>
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* 0. Project selector — only shown in PM task management page */}
            {showProjectSelector && (
              <Box ref={fieldRefs.project}>
                <CustomInputLabel label="Project *" />
                <CustomSelect
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    // Reset dependent fields
                    setFormData((prev) => ({ ...prev, module: "", status: "" }));
                    setSelectedMembers([]);
                    setSelectedDept("");
                    if (errors.project) setErrors((prev) => ({ ...prev, project: "" }));
                  }}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(v) =>
                    projects.find((p) => (p._id || p.id) === v)?.projectName || (
                      <Typography fontSize={13} color="text.secondary">Select Project</Typography>
                    )
                  }
                >
                  {projects.map((p) => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.projectName}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.project && <Typography fontSize="12px" color="error" mt={0.5}>{errors.project}</Typography>}

                {projectLoading && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={14} sx={{ color: "#AA2493" }} />
                    <Typography fontSize="12px" color="text.secondary">Loading project data...</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* 1. Module */}
            <Box ref={fieldRefs.module}>
              <CustomInputLabel label="Module *" />
              <CustomSelect
                value={formData.module} onChange={handleChange("module")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={showProjectSelector && !selectedProject}
                renderValue={(v) =>
                  activeModules.find((m) => m._id === v)?.title || (
                    <Typography fontSize={13} color="text.secondary">
                      {showProjectSelector && !selectedProject ? "Select project first" : "Select Module"}
                    </Typography>
                  )
                }
              >
                {activeModules.length === 0
                  ? <MenuItem disabled><Typography fontSize={13} color="text.secondary">No modules available</Typography></MenuItem>
                  : activeModules.map((m) => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)
                }
              </CustomSelect>
              {errors.module && <Typography fontSize="12px" color="error" mt={0.5}>{errors.module}</Typography>}
            </Box>

            {/* 2. Selected assignees chips */}
            {selectedMembers.length > 0 && (
              <Box>
                <CustomInputLabel label={`Assignees (${selectedMembers.length})`} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB", p: 1.5, minHeight: 48 }}>
                  {selectedMembers.map((m) => (
                    <Chip
                      key={m._id}
                      avatar={
                        <Avatar src={m.avatar} sx={{ background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                          {getInitials(m.fullName)}
                        </Avatar>
                      }
                      label={m.fullName}
                      onDelete={() => handleRemoveMember(m._id)}
                      size="small"
                      sx={{ backgroundColor: "#F3E8FB", color: "#AA2493", fontWeight: 500, fontSize: "12px", "& .MuiChip-deleteIcon": { color: "#AA2493", "&:hover": { color: "#7a1a6b" } } }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 3. Department selector */}
            <Box ref={fieldRefs.assigneeIds}>
              <CustomInputLabel label="Select Department *" />
              <CustomSelect
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); if (errors.assigneeIds) setErrors((prev) => ({ ...prev, assigneeIds: "" })); }}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={showProjectSelector && !selectedProject}
                renderValue={(v) =>
                  activeDepts.find((d) => d._id === v)?.name || (
                    <Typography fontSize={13} color="text.secondary">
                      {showProjectSelector && !selectedProject ? "Select project first" : "Select Department"}
                    </Typography>
                  )
                }
              >
                {activeDepts.length === 0
                  ? <MenuItem disabled><Typography fontSize={13} color="text.secondary">No departments in team</Typography></MenuItem>
                  : activeDepts.map((d) => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)
                }
              </CustomSelect>
            </Box>

            {/* 4. Employee list */}
            {selectedDept && (
              <Box>
                <CustomInputLabel label="Team Members" />
                {deptEmployees.length === 0
                  ? <Box px={1.5} py={1.5} sx={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB" }}><Typography fontSize={13} color="text.secondary">No team members in this department.</Typography></Box>
                  : (
                    <Box sx={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                      {deptEmployees.map((emp, index) => {
                        const isSelected = selectedIds.includes(emp._id);
                        return (
                          <Box key={emp._id} onClick={() => handleToggleEmployee(emp)}
                            sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, cursor: "pointer", backgroundColor: isSelected ? "#F9FAFB" : "transparent", borderBottom: index < deptEmployees.length - 1 ? "1px solid #F3F4F6" : "none", "&:hover": { backgroundColor: "#F5F5F5" }, transition: "background-color 0.15s" }}
                          >
                            <Avatar src={emp.avatar} sx={{ width: 34, height: 34, fontSize: "11px", fontWeight: 600, background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", flexShrink: 0 }}>
                              {getInitials(emp.fullName)}
                            </Avatar>
                            <Box flex={1} minWidth={0}>
                              <Typography fontSize="13px" fontWeight={500} noWrap>{emp.fullName}</Typography>
                              <Typography fontSize="11px" color="text.secondary" noWrap>{emp.designation || ""}</Typography>
                            </Box>
                            <Checkbox checked={isSelected} disableRipple onClick={(e) => e.stopPropagation()} onChange={() => handleToggleEmployee(emp)}
                              sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )
                }
              </Box>
            )}

            {errors.assigneeIds && <Typography fontSize="12px" color="error" mt={-1.5}>{errors.assigneeIds}</Typography>}

            {/* 5. Title */}
            <Box ref={fieldRefs.title}>
              <CustomInputLabel label="Title *" />
              <TextInput placeholder="Enter Title" value={formData.title} onChange={handleChange("title")} inputBgColor="#fff" fullWidth error={!!errors.title} helperText={errors.title} />
            </Box>

            {/* 6. Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput placeholder="Enter description" value={formData.description} onChange={handleChange("description")} inputBgColor="#fff" fullWidth multiline rows={3} />
            </Box>

            {/* 7. Priority */}
            <Box ref={fieldRefs.priority}>
              <CustomInputLabel label="Priority *" />
              <CustomSelect value={formData.priority} onChange={handleChange("priority")} fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) => PRIORITY_OPTIONS.find((p) => p.value === v)?.label || <Typography fontSize={13} color="text.secondary">Select Priority</Typography>}
              >
                {PRIORITY_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </CustomSelect>
              {errors.priority && <Typography fontSize="12px" color="error" mt={0.5}>{errors.priority}</Typography>}
            </Box>

            {/* 8. Task Status */}
            <Box ref={fieldRefs.status}>
              <CustomInputLabel label="Task Status *" />
              <CustomSelect value={formData.status} onChange={handleChange("status")} fullWidth height="45px" inputBgColor="#fff" displayEmpty
                disabled={showProjectSelector && !selectedProject}
                renderValue={(v) =>
                  activeStages.find((s) => s.id === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">
                      {showProjectSelector && !selectedProject ? "Select project first" : "Select Task Status"}
                    </Typography>
                  )
                }
              >
                {activeStages.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
              </CustomSelect>
              {errors.status && <Typography fontSize="12px" color="error" mt={0.5}>{errors.status}</Typography>}
            </Box>

            {/* 9. Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
             <Box ref={fieldRefs.startDate}>
                <CustomInputLabel label="Start Date *" />
                <DatePicker
                  value={formData.startDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, startDate: v }))}
                  minDate={activeProjectStart ? new Date(activeProjectStart) : undefined}
                  maxDate={activeProjectEnd ? new Date(activeProjectEnd) : undefined}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.startDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.startDate}</Typography>}
              </Box>
              <Box ref={fieldRefs.endDate}>
                <CustomInputLabel label="End Date *" />
                <DatePicker
                  value={formData.endDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, endDate: v }))}
                  minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                  maxDate={activeProjectEnd ? new Date(activeProjectEnd) : undefined}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.endDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.endDate}</Typography>}
              </Box>
            </Box>

            {/* 10. Link */}
            <Box>
              <CustomInputLabel label="Link" />
              <TextInput placeholder="https://..." value={formData.link} onChange={handleChange("link")} inputBgColor="#fff" fullWidth InputStartIcon={<Link size={14} color="#808080" />} />
            </Box>

            {/* 11. Attachments */}
            <Box>
              <CustomInputLabel label="Attachments" />
              <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {formData.attachments.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {formData.attachments.map((item, i) => (
                      <Box key={i} display="flex" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: "#F5F5F5", borderRadius: "10px", px: 1.5, py: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Paperclip size={13} color="#808080" />
                          <Typography fontSize="12px" noWrap sx={{ maxWidth: 220 }}>{item.previewName || item.fileName || item.name}</Typography>
                          <Typography fontSize="11px" color="text.secondary">({item.previewSize || item.fileSize || ""})</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleFileRemove(i)} sx={{ p: 0.3 }}>
                          <X size={14} color="#FF3B30" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: "14px", py: "7px", borderRadius: "8px", backgroundColor: "#F5F5F5", fontSize: "13px", fontWeight: 500, color: "#374151", cursor: "pointer", border: "1px solid #E0E0E0", alignSelf: "flex-start", fontFamily: '"Poppins", sans-serif', "&:hover": { backgroundColor: "#EBEBEB" } }}>
                  <Paperclip size={13} />
                  {uploadingFiles ? "Uploading..." : formData.attachments.length > 0 ? "Add More Files" : "Choose Files"}
                  <input type="file" hidden multiple onChange={handleFileAdd} disabled={uploadingFiles} />
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
            uploadingFiles ? <><CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />Uploading files...</>
              : loading ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : editingTask ? "Update Task" : "Save Task"
          }
          isConfirmBtnDisable={isSaving}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddTask;