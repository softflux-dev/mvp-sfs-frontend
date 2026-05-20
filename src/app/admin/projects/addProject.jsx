import React, { useState, useEffect } from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: "14px", mt: 0.5,
      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
      maxHeight: 300,
    },
  },
};

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

const AddProject = ({
  open,
  onClose,
  onSave,
  editingProject    = null,
  loading           = false,
  apiError          = "",
  projectTypeOptions = [],
  managerOptions     = [],   // [{ _id, fullName }]
  departmentOptions  = [],   // [{ _id, name }]
  employeeOptions    = [],   // [{ _id, fullName, avatar }]
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (!open) return;
    if (editingProject) {
      setFormData({
        projectName:    editingProject.projectName    || "",
        clientName:     editingProject.client         || editingProject.clientName || "",
        description:    editingProject.description    || "",
        projectManager: editingProject.projectManagerId || "",
        projectType:    editingProject.projectTypeId    || "",
        departmentIds:  editingProject.departmentIds    || [],
        assigneeIds:    editingProject.assigneeIds      || [],
        startDate:      editingProject.startDate ? new Date(editingProject.startDate) : null,
        endDate:        editingProject.endDate   ? new Date(editingProject.endDate)   : null,
        status:         editingProject.status?.toLowerCase() || "",
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
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="580px" fullWidth>
        <DialogHeader
          title={editingProject ? "Edit Project" : "Add Project"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
          }}>

            {/* API error */}
            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Project Name */}
            <Box>
              <CustomInputLabel label="Project Name *" />
              <TextInput placeholder="Enter Project Name" value={formData.projectName}
                onChange={handleChange("projectName")} inputBgColor="#fff" fullWidth
                error={!!errors.projectName} helperText={errors.projectName} />
            </Box>

            {/* Client Name */}
            <Box>
              <CustomInputLabel label="Client Name *" />
              <TextInput placeholder="Enter Client Name" value={formData.clientName}
                onChange={handleChange("clientName")} inputBgColor="#fff" fullWidth
                error={!!errors.clientName} helperText={errors.clientName} />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Project Description" />
              <TextInput placeholder="Enter Description" value={formData.description}
                onChange={handleChange("description")} inputBgColor="#fff"
                fullWidth multiline rows={3} />
            </Box>

            {/* Project Manager — real API data */}
            <Box>
              <CustomInputLabel label="Project Manager *" />
              <CustomSelect value={formData.projectManager}
                onChange={handleChange("projectManager")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  managerOptions.find((m) => m._id === v)?.fullName || (
                    <Typography fontSize={13} color="text.secondary">Select Manager</Typography>
                  )
                }
              >
                {managerOptions.map((m) => (
                  <MenuItem key={m._id} value={m._id}>{m.fullName}</MenuItem>
                ))}
              </CustomSelect>
              {errors.projectManager && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.projectManager}</Typography>
              )}
            </Box>

            {/* Project Type — real API data */}
            <Box>
              <CustomInputLabel label="Project Type" />
              <CustomSelect value={formData.projectType}
                onChange={handleChange("projectType")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  projectTypeOptions.find((t) => t._id === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Type</Typography>
                  )
                }
              >
                {projectTypeOptions.map((t) => (
                  <MenuItem key={t._id} value={t._id}>{t.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Departments — real API data */}
            <Box>
              <CustomInputLabel label="Departments" />
              <CustomSelect multiple value={formData.departmentIds}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentIds: e.target.value }))}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(selected) => {
                  if (!selected?.length) return <Typography fontSize={13} color="text.secondary">Select departments</Typography>;
                  const names = departmentOptions.filter((d) => selected.includes(d._id)).map((d) => d.name);
                  return <Typography fontSize={13} noWrap>{names.length === 1 ? names[0] : `${names[0]} +${names.length - 1} more`}</Typography>;
                }}
                MenuProps={multiMenuProps}
              >
                {departmentOptions.map((dept) => {
                  const isSelected = formData.departmentIds.includes(dept._id);
                  return (
                    <MenuItem key={dept._id} value={dept._id} disableRipple
                      sx={{ px: 1.5, py: 1, gap: 1.5,
                        backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                        "&:hover": { backgroundColor: "#F5F5F5" },
                        "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                      }}
                    >
                      <Typography fontSize="13px" fontWeight={500} sx={{ flex: 1 }}>{dept.name}</Typography>
                      <Checkbox checked={isSelected} disableRipple
                        sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                      />
                    </MenuItem>
                  );
                })}
              </CustomSelect>
            </Box>

            {/* Assignees — real API data */}
            <Box>
              <CustomInputLabel label="Assign Team Members" />
              <CustomSelect multiple value={formData.assigneeIds}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigneeIds: e.target.value }))}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(selected) => {
                  if (!selected?.length) return <Typography fontSize={13} color="text.secondary">Select team members</Typography>;
                  const matched = employeeOptions.filter((e) => selected.includes(e._id));
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
                {employeeOptions.map((emp) => {
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
                          background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff", flexShrink: 0 }}
                      >{getInitials(emp.fullName)}</Avatar>
                      <Typography fontSize="13px" fontWeight={500} sx={{ flex: 1 }}>{emp.fullName}</Typography>
                      <Checkbox checked={isSelected} disableRipple
                        sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                      />
                    </MenuItem>
                  );
                })}
              </CustomSelect>
            </Box>

            {/* Start + End Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Start Date *" />
                <DatePicker value={formData.startDate} onChange={handleDateChange("startDate")}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.startDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.startDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.startDate}</Typography>}
              </Box>
              <Box>
                <CustomInputLabel label="End Date *" />
                <DatePicker value={formData.endDate} onChange={handleDateChange("endDate")}
                  slotProps={{ textField: { size: "small", fullWidth: true, error: !!errors.endDate } }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.endDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.endDate}</Typography>}
              </Box>
            </Box>

            {/* Status + Budget */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Status *" />
                <CustomSelect value={formData.status} onChange={handleChange("status")}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(v) =>
                    STATUS_OPTIONS.find((s) => s.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Status</Typography>
                    )
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.status && <Typography fontSize="12px" color="error" mt={0.5}>{errors.status}</Typography>}
              </Box>
              <Box>
                <CustomInputLabel label="Budget" />
                <TextInput placeholder="0" value={formData.budget}
                  onChange={handleChange("budget")} inputBgColor="#fff"
                  fullWidth type="number"
                  InputStartIcon={<span style={{ fontSize: "14px", color: "#808080", fontWeight: 500 }}>$</span>}
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
          confirmText={
            loading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : editingProject ? "Save & Update" : "Save Project"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddProject;