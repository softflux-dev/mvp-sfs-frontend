// projects/createProjectDialog.jsx
import React, { useState, useRef, useEffect } from "react";
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
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import ConfirmationDialog  from "../../../components/popups/confirmationDialog";
import CustomButton        from "../../../components/customButton";

// ── Options ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"     },
  { value: "in_progress", label: "In Progress"  },
  { value: "on_hold",     label: "On Hold"      },
  { value: "completed",   label: "Completed"    },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
];

// ── Mock team members — replace with your API data ───────────────────────────
const TEAM_MEMBERS = [
  { id: 1, name: "Alice Johnson", avatar: "" },
  { id: 2, name: "Bob Smith",     avatar: "" },
  { id: 3, name: "Carol Davis",   avatar: "" },
  { id: 4, name: "Dan Wilson",    avatar: "" },
  { id: 5, name: "Eve Martinez",  avatar: "" },
  { id: 6, name: "David Kim",     avatar: "" },
];

const INITIAL_FORM = {
  projectName:     "",
  clientName:      "",
  description:     "",
  status:          "",
  priority:        "medium",
  startDate:       null,
  dueDate:         null,
  teamMemberIds:   [],
  modules:         "",
  attachmentFile:  null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const CreateProjectDialog = ({
  open,
  onClose,
  onSave,
  editingProject = null,
  loading = false,
}) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef();

  // ── Populate when editing ─────────────────────────────────────────────────
  useEffect(() => {
    if (editingProject) {
      setFormData({
        projectName:    editingProject.projectName  || "",
        clientName:     editingProject.client       || "",
        description:    editingProject.description  || "",
        status:         editingProject.status?.toLowerCase().replace(/ /g, "_") || "",
        priority:       editingProject.priority?.toLowerCase() || "medium",
        startDate:      editingProject.startDate  ? new Date(editingProject.startDate)  : null,
        dueDate:        editingProject.dueDate    ? new Date(editingProject.dueDate)    : null,
        teamMemberIds:  editingProject.memberIds  || [],
        modules:        editingProject.modules    || "",
        attachmentFile: null,
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, attachmentFile: file }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.projectName.trim()) e.projectName = "Project name is required";
    if (!formData.clientName.trim())  e.clientName  = "Client name is required";
    if (!formData.startDate)          e.startDate   = "Start date is required";
    if (!formData.dueDate)            e.dueDate     = "Due date is required";
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

      <DialogContainer open={open} onClose={handleClose} maxWidth="500px" fullWidth>
        <DialogHeader
          title={editingProject ? "Edit Project" : "Create New Project"}
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
            {/* ── Project Name + Client Name ─────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Project Name *" />
                <TextInput
                  placeholder="e.g. Website Redesign"
                  value={formData.projectName}
                  onChange={handleChange("projectName")}
                  inputBgColor="#fff"
                  fullWidth
                  error={!!errors.projectName}
                  helperText={errors.projectName}
                />
              </Box>
              <Box>
                <CustomInputLabel label="Client Name *" />
                <TextInput
                  placeholder="e.g. Acme Corp"
                  value={formData.clientName}
                  onChange={handleChange("clientName")}
                  inputBgColor="#fff"
                  fullWidth
                  error={!!errors.clientName}
                  helperText={errors.clientName}
                />
              </Box>
            </Box>

            {/* ── Description ───────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput
                placeholder="Briefly describe the project scope and goals..."
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* ── Status + Priority ─────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Status" />
                <CustomSelect
                  value={formData.status}
                  onChange={handleChange("status")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                  displayEmpty
                  renderValue={(v) =>
                    STATUS_OPTIONS.find((o) => o.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Status</Typography>
                    )
                  }
                >
                  {STATUS_OPTIONS.map((o) => (
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
                  displayEmpty
                  renderValue={(v) =>
                    PRIORITY_OPTIONS.find((o) => o.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Priority</Typography>
                    )
                  }
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Box>

            {/* ── Start Date + Due Date ─────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date *" />
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
                <CustomInputLabel label="Due Date *" />
                <DatePicker
                  value={formData.dueDate}
                  onChange={handleDateChange("dueDate")}
                  minDate={formData.startDate || undefined}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.dueDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.dueDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.dueDate}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Assign Team Members ───────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Assign Team Members" />
              <CustomSelect
                multiple
                value={formData.teamMemberIds}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teamMemberIds: e.target.value }))
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
                      {/* Show stacked avatars for selected */}
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
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: "14px",
                      mt: 0.5,
                      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {TEAM_MEMBERS.map((member) => {
                  const isSelected = formData.teamMemberIds.includes(member.id);
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

            {/* ── Project Modules ───────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Project Modules" />
              <TextInput
                placeholder="e.g. UI Design, Backend, Testing"
                value={formData.modules}
                onChange={handleChange("modules")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* ── Attachments ───────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Attachments" />
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  px: 1.5,
                  py: 1,
                  minHeight: "45px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <CustomButton
                  btnLabel="Choose File"
                  variant="chooseFile"
                  handlePressBtn={() => fileInputRef.current?.click()}
                />
                <Typography
                  fontSize="13px"
                  color={formData.attachmentFile ? "text.primary" : "text.secondary"}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {formData.attachmentFile ? formData.attachmentFile.name : "No file chosen"}
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
          confirmText={editingProject ? "Update Project" : "Create Project"}
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      {/* ── Success popup ─────────────────────────────────────────────────── */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message="Project saved successfully"
        autoClose
        autoCloseDelay={2000}
      />

    </LocalizationProvider>
  );
};

export default CreateProjectDialog;