import React, { useState, useEffect } from "react";
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
} from "../../../components";
import CustomInputLabel from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle from "../../../style/style";
import ConfirmationDialog from "../../../components/popups/confirmationDialog";

const MANAGER_OPTIONS = [
  { value: "sara_ahmed",  label: "Sara Ahmed"  },
  { value: "john_doe",    label: "John Doe"    },
  { value: "peter_jones", label: "Peter Jones" },
];

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "development",   label: "Development"   },
  { value: "seo", label: "SEO" },
  { value: "retainer",      label: "Retainer"      },
  { value: "internal",      label: "Internal"      },
];

const DEPARTMENT_OPTIONS = [
  { id: "engineering",  name: "Engineering"  },
  { id: "design",       name: "Design"       },
  { id: "qa",    name: "QA"    },
  { id: "finance",      name: "Finance"      },
  { id: "hr",           name: "HR"           },
  
];

const TEAM_MEMBERS = [
  { id: 1, name: "Alice Johnson", avatar: "" },
  { id: 2, name: "Bob Smith",     avatar: "" },
  { id: 3, name: "Carol Davis",   avatar: "" },
  { id: 4, name: "Dan Wilson",    avatar: "" },
  { id: 5, name: "Eve Martinez",  avatar: "" },
  { id: 6, name: "David Kim",     avatar: "" },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const INITIAL_FORM = {
  projectName:    "",
  clientName:     "",
  description:    "",
  projectManager: "",
  projectType:    "",
  departmentIds:  [],
  assigneeIds:    [],
  startDate:      null,
  endDate:        null,
  status:         "",
  budget:         "",
};

// ── Shared white input bg style for DatePicker ────────────────────────────
const datePickerSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "14px",
    fontSize: "14px",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },
  "& .MuiInputBase-input": {
    padding: "13.5px 10px",
    fontSize: "14px",
    color: "#000",
    "&::placeholder": { color: "#808080", opacity: 1 },
  },
};

// ── Shared MenuProps for multi-selects ────────────────────────────────────
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

const AddProject = ({ open, onClose, onSave, editingProject = null, loading = false, projectTypeOptions = PROJECT_TYPE_OPTIONS }) => {
  const [formData, setFormData]         = useState(INITIAL_FORM);
  const [errors, setErrors]             = useState({});
  const [confirmOpen, setConfirmOpen]   = useState(false);

  useEffect(() => {
    if (editingProject) {
      const managerMatch =
        MANAGER_OPTIONS.find((m) => m.value === editingProject.projectManager) ||
        MANAGER_OPTIONS.find((m) => m.label === editingProject.projectManager);

      const statusMatch =
        STATUS_OPTIONS.find((s) => s.value === editingProject.status) ||
        STATUS_OPTIONS.find((s) => s.label.toLowerCase() === editingProject.status?.toLowerCase());

      const projectTypeMatch =
        PROJECT_TYPE_OPTIONS.find((t) => t.value === editingProject.projectType);

      setFormData({
        projectName:    editingProject.projectName    || "",
        clientName:     editingProject.client         || "",
        description:    editingProject.description    || "",
        projectManager: managerMatch?.value           || "",
        projectType:    projectTypeMatch?.value       || "",
        departmentIds:  editingProject.departmentIds  || [],
        assigneeIds:    editingProject.assigneeIds    || [],
        startDate:      editingProject.startDate ? new Date(editingProject.startDate) : null,
        endDate:        editingProject.endDate   ? new Date(editingProject.endDate)   : null,
        status:         statusMatch?.value            || "",
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

  const validate = () => {
    const e = {};
    if (!formData.projectName.trim()) e.projectName    = "Project name is required";
    if (!formData.clientName.trim())  e.clientName     = "Client name is required";
    if (!formData.projectManager)     e.projectManager = "Project manager is required";
    if (!formData.startDate)          e.startDate      = "Start date is required";
    if (!formData.endDate)            e.endDate        = "End date is required";
    if (!formData.status)             e.status         = "Status is required";
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
    setConfirmOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

      {/* ── Main Add/Edit Dialog ──────────────────────────────────────────── */}
      <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
        <DialogHeader
          title={editingProject ? "Edit Project" : "Add Project"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "16px",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* Project Name */}
            <Box>
              <CustomInputLabel label="Project Name" />
              <TextInput
                placeholder="Enter Project Name"
                value={formData.projectName}
                onChange={handleChange("projectName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.projectName}
                helperText={errors.projectName}
              />
            </Box>

            {/* Client Name */}
            <Box>
              <CustomInputLabel label="Client Name" />
              <TextInput
                placeholder="Enter Client Name"
                value={formData.clientName}
                onChange={handleChange("clientName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.clientName}
                helperText={errors.clientName}
              />
            </Box>

            {/* Project Description */}
            <Box>
              <CustomInputLabel label="Project Description" />
              <TextInput
                placeholder="Enter Description"
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* Project Manager */}
            <Box>
              <CustomInputLabel label="Project Manager" />
              <CustomSelect
                value={formData.projectManager}
                onChange={handleChange("projectManager")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
              >
               
                {MANAGER_OPTIONS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.projectManager && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.projectManager}
                </Typography>
              )}
            </Box>

            {/* ── Project Type ─────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Project Type" />
              <CustomSelect
                value={formData.projectType}
                onChange={handleChange("projectType")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
              >
                
                {projectTypeOptions.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* ── Departments (multi-select) ────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Departments" />
              <CustomSelect
                multiple
                value={formData.departmentIds}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, departmentIds: e.target.value }))
                }
                fullWidth
                height="45px"
                inputBgColor="#fff"
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) {
                    return (
                      <Typography fontSize={13} color="text.secondary">
                        Select departments
                      </Typography>
                    );
                  }
                  const names = DEPARTMENT_OPTIONS.filter((d) =>
                    selected.includes(d.id)
                  ).map((d) => d.name);
                  return (
                    <Typography fontSize={13} color="text.primary" noWrap>
                      {names.length === 1
                        ? names[0]
                        : `${names[0]} +${names.length - 1} more`}
                    </Typography>
                  );
                }}
                MenuProps={multiMenuProps}
              >
                {DEPARTMENT_OPTIONS.map((dept) => {
                  const isSelected = formData.departmentIds.includes(dept.id);
                  return (
                    <MenuItem
                      key={dept.id}
                      value={dept.id}
                      disableRipple
                      sx={{
                        px: 1.5,
                        py: 1,
                        gap: 1.5,
                        backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                        "&:hover": { backgroundColor: "#F5F5F5" },
                        "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                        "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                      }}
                    >
                      <Typography
                        fontSize="13px"
                        fontWeight={500}
                        color="text.primary"
                        sx={{ flex: 1 }}
                      >
                        {dept.name}
                      </Typography>
                      <Checkbox
                        checked={isSelected}
                        disableRipple
                        sx={{
                          p: 0,
                          color: "#D1D5DB",
                          "&.Mui-checked": { color: "#AA2493" },
                          "& .MuiSvgIcon-root": { fontSize: 20 },
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </CustomSelect>
            </Box>

            {/* ── Assignees (multi-select) ──────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Assign Team Members" />
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
                        Select team members
                      </Typography>
                    );
                  }
                  const names = TEAM_MEMBERS.filter((m) =>
                    selected.includes(m.id)
                  ).map((m) => m.name);
                  return (
                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="nowrap" overflow="hidden">
                      {/* Stacked avatars */}
                      <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
                        {TEAM_MEMBERS.filter((m) => selected.includes(m.id))
                          .slice(0, 4)
                          .map((m) => (
                            <Avatar
                              key={m.id}
                              src={m.avatar}
                              sx={{
                                width: 22,
                                height: 22,
                                fontSize: "9px",
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #AA2493, #022179)",
                                color: "#fff",
                                border: "1.5px solid #fff",
                              }}
                            >
                              {getInitials(m.name)}
                            </Avatar>
                          ))}
                      </Box>
                      <Typography fontSize={13} color="text.primary" noWrap>
                        {names.length === 1
                          ? names[0]
                          : `${names[0]} +${names.length - 1} more`}
                      </Typography>
                    </Box>
                  );
                }}
                MenuProps={multiMenuProps}
              >
                {TEAM_MEMBERS.map((member) => {
                  const isSelected = formData.assigneeIds.includes(member.id);
                  return (
                    <MenuItem
                      key={member.id}
                      value={member.id}
                      disableRipple
                      sx={{
                        px: 1.5,
                        py: 1,
                        gap: 1.5,
                        backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                        "&:hover": { backgroundColor: "#F5F5F5" },
                        "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                        "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                      }}
                    >
                      <Avatar
                        src={member.avatar}
                        alt={member.name}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #AA2493, #022179)",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(member.name)}
                      </Avatar>
                      <Typography
                        fontSize="13px"
                        fontWeight={500}
                        color="text.primary"
                        sx={{ flex: 1 }}
                      >
                        {member.name}
                      </Typography>
                      <Checkbox
                        checked={isSelected}
                        disableRipple
                        sx={{
                          p: 0,
                          color: "#D1D5DB",
                          "&.Mui-checked": { color: "#AA2493" },
                          "& .MuiSvgIcon-root": { fontSize: 20 },
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </CustomSelect>
            </Box>

            {/* ── Start Date + End Date ───────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date" />
                <DatePicker
                  value={formData.startDate}
                  onChange={handleDateChange("startDate")}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.startDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.startDate}
                  </Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="End Date" />
                <DatePicker
                  value={formData.endDate}
                  onChange={handleDateChange("endDate")}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.endDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.endDate}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Status + Budget ─────────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Status" />
                <CustomSelect
                  value={formData.status}
                  onChange={handleChange("status")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                >
                 
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

              <Box>
                <CustomInputLabel label="Budget" />
                <TextInput
                  placeholder="20"
                  value={formData.budget}
                  onChange={handleChange("budget")}
                  inputBgColor="#fff"
                  fullWidth
                  type="number"
                  InputStartIcon={
                    <span style={{ fontSize: "14px", color: "#808080", fontWeight: 500 }}>$</span>
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
          confirmText={editingProject ? "Save & Update" : "Save Project"}
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      {/* ── Confirmation Dialog — auto-closes after 2s ────────────────────── */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message="Save Successfully"
        autoClose={true}
        autoCloseDelay={2000}
      />

    </LocalizationProvider>
  );
};

export default AddProject;