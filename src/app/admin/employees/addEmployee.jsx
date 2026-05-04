// employees/addEmployee.jsx
import React, { useState, useEffect, useRef } from "react";
import { Box, MenuItem, Typography, Grid } from "@mui/material";
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

// ── replace with your actual asset paths ─────────────────────────────────────
import avatarPlaceholder from "../../../assets/icons/avatar-placeholder.svg";
import cameraIcon        from "../../../assets/icons/camera-icon.svg";

const DEPARTMENT_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "design",      label: "Design"      },
  { value: "qa",          label: "QA"          },
  { value: "hr",          label: "HR"          },
];

const ROLE_OPTIONS = [
  { value: "super_admin",     label: "Super Admin"     },
  { value: "hr_manager",      label: "HR Manager"      },
  { value: "project_manager", label: "Project Manager" },
  { value: "developer",       label: "Developer"       },
  { value: "designer",        label: "Designer"        },
  { value: "qa_tester",       label: "QA Tester"       },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time",  label: "Full-time"  },
  { value: "part_time",  label: "Part Time"  },
  { value: "contract",   label: "Contract"   },
];

const INITIAL_FORM = {
  fullName:      "",
  email:         "",
  phone:         "",
  designation:   "",
  department:    "",
  role:          "",
  employmentType:"",
  workingHours:  0,
  joiningDate:   null,
  monthlySalary: "",
  avatarFile:    null,
  avatarPreview: "",
};

// ── Normalize label → value slug for selects ─────────────────────────────────
const matchOption = (options, raw) =>
  options.find((o) => o.value === raw) ||
  options.find((o) => o.label.toLowerCase() === raw?.toLowerCase());

const AddEmployee = ({ open, onClose, onSave, editingEmployee = null, loading = false }) => {
  const [formData,     setFormData]     = useState(INITIAL_FORM);
  const [errors,       setErrors]       = useState({});
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const fileInputRef = useRef();

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (editingEmployee) {
      const deptMatch = matchOption(DEPARTMENT_OPTIONS,    editingEmployee.department);
      const roleMatch = matchOption(ROLE_OPTIONS,          editingEmployee.role);
      const typeMatch = matchOption(EMPLOYMENT_TYPE_OPTIONS, editingEmployee.type);

      setFormData({
        fullName:       editingEmployee.name          || "",
        email:          editingEmployee.email         || "",
        phone:          editingEmployee.phone         || "",
        designation:    editingEmployee.designation   || "",
        department:     deptMatch?.value              || "",
        role:           roleMatch?.value              || "",
        employmentType: typeMatch?.value              || "",
        workingHours:   editingEmployee.workingHours  ?? 0,
        joiningDate:    editingEmployee.joiningDate
                          ? new Date(editingEmployee.joiningDate)
                          : null,
        monthlySalary:  editingEmployee.monthlySalary != null
                          ? String(editingEmployee.monthlySalary)
                          : "",
        avatarFile:    null,
        avatarPreview: editingEmployee.avatar || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingEmployee, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({ ...prev, joiningDate: value }));
    if (errors.joiningDate) setErrors((prev) => ({ ...prev, joiningDate: "" }));
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatarFile: file, avatarPreview: preview }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.fullName.trim())    e.fullName      = "Full name is required";
    if (!formData.email.trim())       e.email         = "Email is required";
    if (!formData.department)         e.department    = "Department is required";
    if (!formData.role)               e.role          = "Role is required";
    if (!formData.employmentType)     e.employmentType= "Employment type is required";
    if (!formData.joiningDate)        e.joiningDate   = "Joining date is required";
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
          title={editingEmployee ? "Edit Employee" : "Add New Employee"}
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
            {/* ── Avatar upload ──────────────────────────────────────────── */}
            <Box display="flex" alignItems="center" gap={2}>
              {/* Avatar circle */}
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 72, height: 72, borderRadius: "50%",
                    bgcolor: "#E5E7EB",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {formData.avatarPreview ? (
                    <img
                      src={formData.avatarPreview}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <img src={avatarPlaceholder} alt="placeholder" style={{ width: 40, height: 40, opacity: 0.4 }} />
                  )}
                </Box>
                {/* Camera badge */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 22, height: 22, borderRadius: "50%",
                    bgcolor: "#fff",
                    border: "1px solid #E5E7EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  }}
                >
                  <img src={cameraIcon} alt="upload" style={{ width: 12, height: 12 }} />
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                />
              </Box>

              {/* Upload label */}
              <Box>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">
                  Upload Profile Photo
                </Typography>
                <Typography fontSize="11px" color="text.secondary">
                  JPG, PNG or GIF (max. 2MB)
                </Typography>
              </Box>
            </Box>

            {/* ── Full Name ─────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Full Name *" />
              <TextInput
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Box>

            {/* ── Email ─────────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Email *" />
              <TextInput
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange("email")}
                inputBgColor="#fff"
                fullWidth
                type="email"
                error={!!errors.email}
                helperText={errors.email}
              />
            </Box>

            {/* ── Phone ─────────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Phone" />
              <TextInput
                placeholder="Enter Phone"
                value={formData.phone}
                onChange={handleChange("phone")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* ── Designation ───────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Designation" />
              <TextInput
                placeholder="Enter Designation"
                value={formData.designation}
                onChange={handleChange("designation")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* ── Department + Role ─────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Department" />
                <CustomSelect
                  value={formData.department}
                  onChange={handleChange("department")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                  displayEmpty
                  renderValue={(v) =>
                    DEPARTMENT_OPTIONS.find((o) => o.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Department</Typography>
                    )
                  }
                >
                  {DEPARTMENT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.department && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.department}
                  </Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="Role" />
                <CustomSelect
                  value={formData.role}
                  onChange={handleChange("role")}
                  fullWidth
                  height="45px"
                  inputBgColor="#fff"
                  displayEmpty
                  renderValue={(v) =>
                    ROLE_OPTIONS.find((o) => o.value === v)?.label || (
                      <Typography fontSize={13} color="text.secondary">Select Role</Typography>
                    )
                  }
                >
                  {ROLE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.role && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.role}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Employment Type ───────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Employment Type" />
              <CustomSelect
                value={formData.employmentType}
                onChange={handleChange("employmentType")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
                displayEmpty
                renderValue={(v) =>
                  EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Employment Type</Typography>
                  )
                }
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.employmentType && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.employmentType}
                </Typography>
              )}
            </Box>

            {/* ── Working Hours/Day + Joining Date ──────────────────────── */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Working Hours/Day" />
                <TextInput
                  placeholder="0"
                  value={formData.workingHours}
                  onChange={handleChange("workingHours")}
                  inputBgColor="#fff"
                  fullWidth
                  type="number"
                />
              </Box>

              <Box>
                <CustomInputLabel label="Joining Date" />
                <DatePicker
                  value={formData.joiningDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.joiningDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.joiningDate && (
                  <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                    {errors.joiningDate}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Monthly Salary ────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Monthly Salary" />
              <TextInput
                placeholder="0"
                value={formData.monthlySalary}
                onChange={handleChange("monthlySalary")}
                inputBgColor="#fff"
                fullWidth
                type="number"
                InputStartIcon={
                  <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>
                }
              />
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Save Employee"
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      {/* ── Save success popup ────────────────────────────────────────────── */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message="Save Successfully"
        autoClose
        autoCloseDelay={2000}
      />

    </LocalizationProvider>
  );
};

export default AddEmployee;