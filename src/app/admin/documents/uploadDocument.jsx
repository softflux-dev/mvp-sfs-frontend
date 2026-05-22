import React, { useState, useMemo } from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import UploadBox           from "../../../components/uploadBox";
import UploadIcon          from "../../../assets/icons/upload.svg";

// ── Option lists ──────────────────────────────────────────────────────────
const DOC_TYPE_OPTIONS = [
  { value: "employment_contract",   label: "Employment Contract"   },
  { value: "nda",                   label: "NDA"                   },
  { value: "project_documentation", label: "Project Documentation" },
  { value: "client_agreement",      label: "Client Agreement"      },
  { value: "other",                 label: "Other"                 },
];

// ── Field visibility rules per doc type ───────────────────────────────────
const FIELD_RULES = {
  employment_contract:   { assignees: true,  singleAssignee: true,  description: true },
  nda:                   { assignees: true,                          description: true },
  project_documentation: { projectType: true, assignees: true, task: true, description: true },
  client_agreement:      { projectType: true,                        description: true },
  other:                 {                                            description: true },
};

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: "14px",
      mt: 0.5,
      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
      maxHeight: 280,
    },
  },
};

const INITIAL_FORM = {
  title:       "",
  type:        "",
  projectTypeId: "",
  projectId:   "",
  assigneeIds: [],
  assigneeId:  "",
  description: "",
  files:       [],
};

const UploadDocument = ({
  open,
  onClose,
  onSave,
  loading           = false,
  projectTypeOptions = [],  // [{ _id, label, value }]
  allProjects        = [],  // [{ _id, projectName, projectType: { _id } }]
  employeeOptions    = [],  // [{ _id, fullName, avatar }]
  departmentOptions  = [],  // not used in form currently, available if needed
}) => {
  const [formData,   setFormData]   = useState(INITIAL_FORM);
  const [errors,     setErrors]     = useState({});
  const [dragActive, setDragActive] = useState(false);

  const rules = FIELD_RULES[formData.type] || {};

  // ── Derive filtered project list from selected project type ──────────
  const projectList = useMemo(() => {
    if (!formData.projectTypeId) return [];
    return allProjects.filter(
      (p) =>
        (p.projectType?._id || p.projectType) === formData.projectTypeId
    );
  }, [formData.projectTypeId, allProjects]);

  // assignees visible only after a project is selected (when projectType rule applies)
  const showAssignees = rules.assignees && (!rules.projectType || !!formData.projectId);

  const set = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type") {
        next.projectTypeId = "";
        next.projectId     = "";
        next.assigneeIds   = [];
        next.assigneeId    = "";
        next.description   = "";
      }
      if (field === "projectTypeId") {
        next.projectId   = "";
        next.assigneeIds = [];
        next.assigneeId  = "";
      }
      if (field === "projectId") {
        next.assigneeIds = [];
        next.assigneeId  = "";
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleChange = (field) => (e) => set(field, e?.target ? e.target.value : e);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...selected] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...dropped] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleRemoveFile = (index) =>
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Document title is required";
    if (!formData.type)         e.type  = "Document type is required";
    if (rules.projectType) {
      if (!formData.projectTypeId) e.projectTypeId = "Project type is required";
      if (!formData.projectId)     e.projectId     = "Project is required";
    }
    if (rules.assignees) {
      if (rules.singleAssignee && !formData.assigneeId)
        e.assigneeId = "Please select an employee";
      if (!rules.singleAssignee && !formData.assigneeIds.length)
        e.assigneeIds = "Please assign at least one person";
    }
    if (!formData.files.length) e.files = "Please select at least one file";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave?.(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  // ── Render helpers ────────────────────────────────────────────────────
  const renderMultiAssigneeValue = (selected) => {
    if (!selected?.length)
      return <Typography fontSize={13} color="text.secondary">Select assignees</Typography>;
    const matched = employeeOptions.filter((m) => selected.includes(m._id));
    return (
      <Box display="flex" alignItems="center" gap={0.75} flexWrap="nowrap" overflow="hidden">
        <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
          {matched.slice(0, 4).map((m) => (
            <Avatar key={m._id} src={m.avatar}
              sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700,
                background: "linear-gradient(135deg, #AA2493, #022179)",
                color: "#fff", border: "1.5px solid #fff" }}
            >{getInitials(m.fullName)}</Avatar>
          ))}
        </Box>
        <Typography fontSize={13} color="text.primary" noWrap>
          {matched.length === 1 ? matched[0].fullName : `${matched[0].fullName} +${matched.length - 1} more`}
        </Typography>
      </Box>
    );
  };

  const renderSingleAssigneeValue = (selected) => {
    if (!selected)
      return <Typography fontSize={13} color="text.secondary">Select employee</Typography>;
    const member = employeeOptions.find((m) => m._id === selected);
    if (!member)
      return <Typography fontSize={13} color="text.secondary">Select employee</Typography>;
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar src={member.avatar}
          sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700,
            background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff" }}
        >{getInitials(member.fullName)}</Avatar>
        <Typography fontSize={13} color="text.primary">{member.fullName}</Typography>
      </Box>
    );
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
      <DialogHeader title="Upload Document" onClose={handleClose} />

      <Box
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 3, mx: 3, mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          maxHeight: "62vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
        }}
      >
        {/* Document Title */}
        <Box>
          <CustomInputLabel label="Document Title" />
          <TextInput
            placeholder="Enter document title"
            value={formData.title}
            onChange={handleChange("title")}
            inputBgColor="#fff"
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
          />
        </Box>

        {/* Document Type */}
        <Box>
          <CustomInputLabel label="Document Type" />
          <CustomSelect
            value={formData.type}
            onChange={handleChange("type")}
            fullWidth height="45px" inputBgColor="#fff"
          >
            <MenuItem value="">Select type</MenuItem>
            {DOC_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </CustomSelect>
          {errors.type && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.type}</Typography>
          )}
        </Box>

        {/* Project Type — project_documentation, client_agreement */}
        {rules.projectType && (
          <Box>
            <CustomInputLabel label="Project Type" />
            <CustomSelect
              value={formData.projectTypeId}
              onChange={handleChange("projectTypeId")}
              fullWidth height="45px" inputBgColor="#fff" displayEmpty
              renderValue={(v) =>
                projectTypeOptions.find((t) => t._id === v)?.label || (
                  <Typography fontSize={13} color="text.secondary">Select project type</Typography>
                )
              }
            >
              {projectTypeOptions.map((t) => (
                <MenuItem key={t._id} value={t._id}>{t.label}</MenuItem>
              ))}
            </CustomSelect>
            {errors.projectTypeId && (
              <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.projectTypeId}</Typography>
            )}
          </Box>
        )}

        {/* Project — appears after project type is selected */}
        {rules.projectType && formData.projectTypeId && (
          <Box>
            <CustomInputLabel label="Project" />
            <CustomSelect
              value={formData.projectId}
              onChange={handleChange("projectId")}
              fullWidth height="45px" inputBgColor="#fff" displayEmpty
              renderValue={(v) =>
                projectList.find((p) => p._id === v)?.projectName || (
                  <Typography fontSize={13} color="text.secondary">Select project</Typography>
                )
              }
            >
              {projectList.length === 0
                ? <MenuItem disabled value=""><em>No projects for this type</em></MenuItem>
                : projectList.map((p) => (
                    <MenuItem key={p._id} value={p._id}>{p.projectName}</MenuItem>
                  ))
              }
            </CustomSelect>
            {errors.projectId && (
              <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.projectId}</Typography>
            )}
          </Box>
        )}

        {/* SINGLE assignee — employment_contract */}
        {showAssignees && rules.singleAssignee && (
          <Box>
            <CustomInputLabel label="Employee" />
            <CustomSelect
              value={formData.assigneeId}
              onChange={handleChange("assigneeId")}
              fullWidth height="45px" inputBgColor="#fff"
              displayEmpty
              renderValue={renderSingleAssigneeValue}
              MenuProps={multiMenuProps}
            >
              {employeeOptions.map((member) => (
                <MenuItem
                  key={member._id} value={member._id} disableRipple
                  sx={{
                    px: 1.5, py: 1, gap: 1.5,
                    "&:hover": { backgroundColor: "#F5F5F5" },
                    "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                    "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                  }}
                >
                  <Avatar src={member.avatar}
                    sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                      background: "linear-gradient(135deg, #AA2493, #022179)",
                      color: "#fff", flexShrink: 0 }}
                  >{getInitials(member.fullName)}</Avatar>
                  <Typography fontSize="13px" fontWeight={500} color="text.primary">
                    {member.fullName}
                  </Typography>
                </MenuItem>
              ))}
            </CustomSelect>
            {errors.assigneeId && (
              <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.assigneeId}</Typography>
            )}
          </Box>
        )}

        {/* MULTI assignee — nda, project_documentation */}
        {showAssignees && !rules.singleAssignee && (
          <Box>
            <CustomInputLabel label="Assign To" />
            <CustomSelect
              multiple
              value={formData.assigneeIds}
              onChange={(e) => setFormData((prev) => ({ ...prev, assigneeIds: e.target.value }))}
              fullWidth height="45px" inputBgColor="#fff"
              displayEmpty
              renderValue={renderMultiAssigneeValue}
              MenuProps={multiMenuProps}
            >
              {employeeOptions.map((member) => {
                const isSelected = formData.assigneeIds.includes(member._id);
                return (
                  <MenuItem
                    key={member._id} value={member._id} disableRipple
                    sx={{
                      px: 1.5, py: 1, gap: 1.5,
                      backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                      "&:hover": { backgroundColor: "#F5F5F5" },
                      "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                      "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                    }}
                  >
                    <Avatar src={member.avatar}
                      sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        color: "#fff", flexShrink: 0 }}
                    >{getInitials(member.fullName)}</Avatar>
                    <Typography fontSize="13px" fontWeight={500} color="text.primary" sx={{ flex: 1 }}>
                      {member.fullName}
                    </Typography>
                    <Checkbox
                      checked={isSelected} disableRipple
                      sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                    />
                  </MenuItem>
                );
              })}
            </CustomSelect>
            {errors.assigneeIds && (
              <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.assigneeIds}</Typography>
            )}
          </Box>
        )}

        {/* Description */}
        {rules.description && (
          <Box>
            <CustomInputLabel label="Description (Optional)" />
            <TextInput
              placeholder="Enter a brief description…"
              value={formData.description}
              onChange={handleChange("description")}
              inputBgColor="#fff"
              fullWidth multiline rows={3}
            />
          </Box>
        )}

        {/* File Upload */}
        <Box>
          <CustomInputLabel label="File" />
          <UploadBox
            uploadIcon={UploadIcon}
            dragActive={dragActive}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            selectedFiles={formData.files}
            onRemoveFile={handleRemoveFile}
            showCategory={false}
            showFileList={true}
          />
          {errors.files && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.files}</Typography>
          )}
        </Box>
      </Box>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Upload"
        variant="gradient"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default UploadDocument;