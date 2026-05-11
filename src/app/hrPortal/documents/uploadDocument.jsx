import React, { useState } from "react";
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

const PROJECT_TYPE_OPTIONS = [
  { value: "development", label: "Development" },
  { value: "seo",         label: "SEO"         },
  { value: "retainer",    label: "Retainer"    },
  { value: "internal",    label: "Internal"    },
];

const PROJECTS_BY_TYPE = {
  development: [
    { value: "ecommerce",  label: "E-Commerce Platform"  },
    { value: "mobile_app", label: "Mobile Banking App"   },
    { value: "cms",        label: "CMS Website Redesign" },
  ],
  seo: [
    { value: "seo_retail",  label: "RetailCorp SEO"  },
    { value: "seo_finance", label: "FinanceFirst SEO" },
  ],
  retainer: [
    { value: "ret_hr",       label: "HR Management System" },
    { value: "ret_logitech", label: "LogiTech Retainer"    },
  ],
  internal: [
    { value: "inventory", label: "Inventory Tracker"    },
    { value: "hr_system", label: "HR Management System" },
  ],
};

const TASKS_BY_PROJECT = {
  ecommerce:    [
    { value: "t1", label: "Design product card component"      },
    { value: "t2", label: "Implement product search & filters" },
    { value: "t3", label: "Payment gateway integration"        },
  ],
  mobile_app:   [
    { value: "t4", label: "Product image gallery" },
    { value: "t5", label: "Cart state management" },
  ],
  cms:          [
    { value: "t6", label: "Order management CRUD"   },
    { value: "t7", label: "Product reviews section" },
  ],
  seo_retail:   [{ value: "t8",  label: "Keyword research"     }],
  seo_finance:  [{ value: "t9",  label: "On-page optimisation" }],
  ret_hr:       [{ value: "t10", label: "Payroll module"       }],
  ret_logitech: [{ value: "t11", label: "Monthly reporting"    }],
  inventory:    [{ value: "t12", label: "Stock sync feature"   }],
  hr_system:    [{ value: "t13", label: "Leave management"     }],
};

const TEAM_MEMBERS = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith"     },
  { id: 3, name: "Carol Davis"   },
  { id: 4, name: "Dan Wilson"    },
  { id: 5, name: "Eve Martinez"  },
  { id: 6, name: "David Kim"     },
];

// ── Field visibility rules per doc type ───────────────────────────────────
//
//  projectType  → Project Type + Project selects (cascading)
//  assignees    → Assign To / Employee select
//  singleAssignee → forces single-select mode (employment_contract only)
//  task         → Related Task select (optional, project_documentation only)
//  description  → Description textarea
//
//  employment_contract   : single employee picker — no project
//  nda                   : multi assignees — no project
//  project_documentation : full cascade — project type → project → assignees → task
//  client_agreement      : project type → project only — no assignees
//  other                 : description only
//
const FIELD_RULES = {
  employment_contract:   {                     assignees: true,  singleAssignee: true,               description: true },
  nda:                   {                                                         description: true },
  project_documentation: { projectType: true,  assignees: true,                      task: true,    description: true },
  client_agreement:      { projectType: true,                                                        description: true },
  other:                 {                                                                            description: true },
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
  projectType: "",
  projectId:   "",
  assigneeIds: [],   // multi: array of ids
  assigneeId:  "",   // single (employment_contract): one id
  taskId:      "",
  description: "",
  files:       [],
};

const UploadDocument = ({ open, onClose, onSave, loading = false }) => {
  const [formData,   setFormData]   = useState(INITIAL_FORM);
  const [errors,     setErrors]     = useState({});
  const [dragActive, setDragActive] = useState(false);

  const rules       = FIELD_RULES[formData.type] || {};
  const projectList = PROJECTS_BY_TYPE[formData.projectType] || [];
  const taskList    = TASKS_BY_PROJECT[formData.projectId]   || [];

  // assignees field is visible when:
  //   - doc type has assignees rule AND
  //   - if it also requires a project, a project must be selected first
  const showAssignees = rules.assignees && (!rules.projectType || !!formData.projectId);

  const set = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type") {
        next.projectType = "";
        next.projectId   = "";
        next.assigneeIds = [];
        next.assigneeId  = "";
        next.taskId      = "";
        next.description = "";
      }
      if (field === "projectType") {
        next.projectId   = "";
        next.assigneeIds = [];
        next.assigneeId  = "";
        next.taskId      = "";
      }
      if (field === "projectId") {
        next.taskId = "";
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
      if (!formData.projectType) e.projectType = "Project type is required";
      if (!formData.projectId)   e.projectId   = "Project is required";
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

  // ── Render value for MULTI assignee select (nda, project_documentation) ──
  const renderMultiAssigneeValue = (selected) => {
    if (!selected || selected.length === 0)
      return <Typography fontSize={13} color="text.secondary">Select assignees</Typography>;
    const matched = TEAM_MEMBERS.filter((m) => selected.includes(m.id));
    return (
      <Box display="flex" alignItems="center" gap={0.75} flexWrap="nowrap" overflow="hidden">
        <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
          {matched.slice(0, 4).map((m) => (
            <Avatar key={m.id} sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700, background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", border: "1.5px solid #fff" }}>
              {getInitials(m.name)}
            </Avatar>
          ))}
        </Box>
        <Typography fontSize={13} color="text.primary" noWrap>
          {matched.length === 1 ? matched[0].name : `${matched[0].name} +${matched.length - 1} more`}
        </Typography>
      </Box>
    );
  };

  // ── Render value for SINGLE assignee select (employment_contract) ─────────
  const renderSingleAssigneeValue = (selected) => {
    if (!selected)
      return <Typography fontSize={13} color="text.secondary">Select employee</Typography>;
    const member = TEAM_MEMBERS.find((m) => m.id === selected);
    if (!member) return <Typography fontSize={13} color="text.secondary">Select employee</Typography>;
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700, background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff" }}>
          {getInitials(member.name)}
        </Avatar>
        <Typography fontSize={13} color="text.primary">{member.name}</Typography>
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
          {errors.type && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.type}</Typography>}
        </Box>

        {/* Project Type — project_documentation, client_agreement */}
        {rules.projectType && (
          <Box>
            <CustomInputLabel label="Project Type" />
            <CustomSelect
              value={formData.projectType}
              onChange={handleChange("projectType")}
              fullWidth height="45px" inputBgColor="#fff"
            >
              <MenuItem value="">Select project type</MenuItem>
              {PROJECT_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </CustomSelect>
            {errors.projectType && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.projectType}</Typography>}
          </Box>
        )}

        {/* Project — appears after project type is selected */}
        {rules.projectType && formData.projectType && (
          <Box>
            <CustomInputLabel label="Project" />
            <CustomSelect
              value={formData.projectId}
              onChange={handleChange("projectId")}
              fullWidth height="45px" inputBgColor="#fff"
            >
              <MenuItem value="">Select project</MenuItem>
              {projectList.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </CustomSelect>
            {errors.projectId && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.projectId}</Typography>}
          </Box>
        )}

        {/* ── SINGLE assignee — employment_contract only ───────────────── */}
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
              {TEAM_MEMBERS.map((member) => (
                <MenuItem
                  key={member.id} value={member.id} disableRipple
                  sx={{
                    px: 1.5, py: 1, gap: 1.5,
                    "&:hover": { backgroundColor: "#F5F5F5" },
                    "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                    "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600, background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", flexShrink: 0 }}>
                    {getInitials(member.name)}
                  </Avatar>
                  <Typography fontSize="13px" fontWeight={500} color="text.primary">
                    {member.name}
                  </Typography>
                </MenuItem>
              ))}
            </CustomSelect>
            {errors.assigneeId && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.assigneeId}</Typography>}
          </Box>
        )}

        {/* ── MULTI assignee — nda, project_documentation ──────────────── */}
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
              {TEAM_MEMBERS.map((member) => {
                const isSelected = formData.assigneeIds.includes(member.id);
                return (
                  <MenuItem
                    key={member.id} value={member.id} disableRipple
                    sx={{
                      px: 1.5, py: 1, gap: 1.5,
                      backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                      "&:hover": { backgroundColor: "#F5F5F5" },
                      "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                      "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600, background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", flexShrink: 0 }}>
                      {getInitials(member.name)}
                    </Avatar>
                    <Typography fontSize="13px" fontWeight={500} color="text.primary" sx={{ flex: 1 }}>
                      {member.name}
                    </Typography>
                    <Checkbox
                      checked={isSelected} disableRipple
                      sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                    />
                  </MenuItem>
                );
              })}
            </CustomSelect>
            {errors.assigneeIds && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.assigneeIds}</Typography>}
          </Box>
        )}

        {/* Related Task — project_documentation only, optional */}
        {rules.task && formData.projectId && taskList.length > 0 && (
          <Box>
            <CustomInputLabel label="Related Task (Optional)" />
            <CustomSelect
              value={formData.taskId}
              onChange={handleChange("taskId")}
              fullWidth height="45px" inputBgColor="#fff"
            >
              <MenuItem value="">Select task</MenuItem>
              {taskList.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </CustomSelect>
          </Box>
        )}

        {/* Description — all types except Other show this */}
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

        {/* File Upload — always last */}
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
          {errors.files && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.files}</Typography>}
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