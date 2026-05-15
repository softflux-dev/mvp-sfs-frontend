import React, { useState, useEffect, useRef } from "react";
import { Box, MenuItem, Typography, CircularProgress } from "@mui/material";
import { DatePicker }            from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider }  from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }        from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import { useDepartment }   from "../../../hooks/department";   // ← real depts
import { useRole }         from "../../../hooks/role";         // ← real roles

import avatarPlaceholder from "../../../assets/icons/avatar-placeholder.svg";
import cameraIcon        from "../../../assets/icons/camera-icon.svg";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract",  label: "Contract"  },
];

const INITIAL_FORM = {
  fullName:       "",
  email:          "",
  phone:          "",
  department:     "",
  role:           "",
  employmentType: "",
  workingHours:   "",
  joiningDate:    null,
  monthlySalary:  "",
  avatarFile:     null,
  avatarPreview:  "",
};

const AddEmployee = ({
  open,
  onClose,
  onSave,
  editingEmployee = null,
  loading  = false,
  apiError = "",
}) => {
  const { departments, fetchDepartments } = useDepartment();
  const { roles,       fetchRoles }       = useRole();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const fileInputRef = useRef();

  // ── Fetch dropdowns when dialog opens ─────────────────────────────────────
  useEffect(() => {
    if (open) {
      fetchDepartments({ limit: 100 });
      fetchRoles({ limit: 100 });
    }
  }, [open]);

  // ── Populate form when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editingEmployee) {
      setFormData({
        fullName:       editingEmployee.name          || editingEmployee.fullName || "",
        email:          editingEmployee.email         || "",
        phone:          editingEmployee.phone         || "",
        department:     editingEmployee.departmentId  || "",
        role:           editingEmployee.roleId        || "",
        employmentType: editingEmployee.type          || editingEmployee.employmentType || "",
        workingHours:   editingEmployee.workingHours  ?? "",
        joiningDate:    editingEmployee.joiningDate
                          ? new Date(editingEmployee.joiningDate) : null,
        monthlySalary:  editingEmployee.monthlySalary != null
                          ? String(editingEmployee.monthlySalary) : "",
        avatarFile:     null,
        avatarPreview:  editingEmployee.avatar || "",
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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      avatarFile:    file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const blockInvalidNumericKeys = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  
  const blockNonNumericKeys = (e) => {
    if (!/[\d]/.test(e.key) &&
        !["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim())  e.fullName       = "Full name is required";
    if (!formData.email.trim())     e.email          = "Email is required";
     if (formData.phone.trim()) {
    if (!/^\d+$/.test(formData.phone.trim())) {
      e.phone = "Phone number must contain digits only";
    } else if (formData.phone.trim().length < 7) {
      e.phone = "Phone number must be at least 7 digits";
    } else if (formData.phone.trim().length > 15) {
      e.phone = "Phone number cannot exceed 15 digits";
    }
  }
    if (!formData.department)       e.department     = "Department is required";
    if (!formData.role)             e.role           = "Role is required";
    if (!formData.employmentType)   e.employmentType = "Employment type is required";
    if (!formData.joiningDate)      e.joiningDate    = "Joining date is required";

    const wh = Number(formData.workingHours);
    if (formData.workingHours === "" || isNaN(wh)) e.workingHours = "Working hours is required";
    else if (wh <= 0)  e.workingHours = "Must be greater than 0";
    else if (wh > 24)  e.workingHours = "Cannot exceed 24";
    else if (!Number.isInteger(wh)) e.workingHours = "Must be a whole number";

    const sal = Number(formData.monthlySalary);
    if (formData.monthlySalary === "" || isNaN(sal)) e.monthlySalary = "Salary is required";
    else if (sal <= 0) e.monthlySalary = "Must be greater than 0";

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
      <DialogContainer open={open} onClose={handleClose} maxWidth="500px" fullWidth>
        <DialogHeader
          title={editingEmployee ? "Edit Employee" : "Add New Employee"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
          }}>

            {/* API error inside dialog */}
            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Avatar */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: "50%",
                  bgcolor: "#E5E7EB", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {formData.avatarPreview ? (
                    <img src={formData.avatarPreview} alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={avatarPlaceholder} alt="placeholder"
                      style={{ width: 40, height: 40, opacity: 0.4 }} />
                  )}
                </Box>
                <Box onClick={() => fileInputRef.current?.click()} sx={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: "50%",
                  bgcolor: "#fff", border: "1px solid #E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}>
                  <img src={cameraIcon} alt="upload" style={{ width: 12, height: 12 }} />
                </Box>
                <input ref={fileInputRef} type="file" hidden
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange} />
              </Box>
              <Box>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">
                  Upload Profile Photo
                </Typography>
                <Typography fontSize="11px" color="text.secondary">
                  JPG, PNG or GIF (max. 2MB)
                </Typography>
              </Box>
            </Box>

            {/* Full Name */}
            <Box>
              <CustomInputLabel label="Full Name *" />
              <TextInput placeholder="Enter Full Name" value={formData.fullName}
                onChange={handleChange("fullName")} inputBgColor="#fff" fullWidth
                error={!!errors.fullName} helperText={errors.fullName} />
            </Box>

            {/* Email — disabled on edit */}
            <Box>
              <CustomInputLabel label="Email *" />
              <TextInput placeholder="Enter Email" value={formData.email}
                onChange={handleChange("email")} inputBgColor="#fff" fullWidth
                type="email" disabled={!!editingEmployee}
                error={!!errors.email} helperText={errors.email} />
            </Box>

            {/* Phone */}
            <Box>
              <CustomInputLabel label="Phone" />
              <TextInput
                placeholder="Enter Phone"
                value={formData.phone}
                onChange={handleChange("phone")}
                onKeyDown={blockNonNumericKeys}
                inputBgColor="#fff"
                fullWidth
                type="tel"
                inputProps={{ maxLength: 15 }}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Box>


            {/* Department + Role */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Department *" />
                <CustomSelect value={formData.department}
                  onChange={handleChange("department")}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(v) =>
                    departments.find((d) => d._id === v)?.name || (
                      <Typography fontSize={13} color="text.secondary">Select Department</Typography>
                    )
                  }
                >
                  {departments.map((d) => (
                    <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.department && (
                  <Typography fontSize="12px" color="error" mt={0.5}>{errors.department}</Typography>
                )}
              </Box>

              <Box>
                <CustomInputLabel label="Role *" />
                <CustomSelect value={formData.role}
                  onChange={handleChange("role")}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  renderValue={(v) =>
                    roles.find((r) => r._id === v)?.roleName || (
                      <Typography fontSize={13} color="text.secondary">Select Role</Typography>
                    )
                  }
                >
                  {roles.map((r) => (
                    <MenuItem key={r._id} value={r._id}>{r.roleName}</MenuItem>
                  ))}
                </CustomSelect>
                {errors.role && (
                  <Typography fontSize="12px" color="error" mt={0.5}>{errors.role}</Typography>
                )}
              </Box>
            </Box>

            {/* Employment Type */}
            <Box>
              <CustomInputLabel label="Employment Type *" />
              <CustomSelect value={formData.employmentType}
                onChange={handleChange("employmentType")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) =>
                  EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Type</Typography>
                  )
                }
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.employmentType && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.employmentType}</Typography>
              )}
            </Box>

            {/* Working Hours + Joining Date */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Working Hours/Day *" />
                <TextInput placeholder="0" value={formData.workingHours}
                  onChange={handleChange("workingHours")}
                  onKeyDown={blockInvalidNumericKeys}
                  inputBgColor="#fff" fullWidth type="number"
                  inputProps={{ min: 1, max: 24, step: 1 }}
                  error={!!errors.workingHours} helperText={errors.workingHours} />
              </Box>
              <Box>
                <CustomInputLabel label="Joining Date *" />
                <DatePicker value={formData.joiningDate} onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      size: "small", fullWidth: true,
                      placeholder: "dd/mm/yyyy",
                      error: !!errors.joiningDate,
                    },
                  }}
                  sx={GlobalStyle.datePickerStyle}
                />
                {errors.joiningDate && (
                  <Typography fontSize="12px" color="error" mt={0.5}>{errors.joiningDate}</Typography>
                )}
              </Box>
            </Box>

            {/* Monthly Salary */}
            <Box>
              <CustomInputLabel label="Monthly Salary *" />
              <TextInput placeholder="0" value={formData.monthlySalary}
                onChange={handleChange("monthlySalary")}
                onKeyDown={blockInvalidNumericKeys}
                inputBgColor="#fff" fullWidth type="number"
                inputProps={{ min: 1 }}
                error={!!errors.monthlySalary} helperText={errors.monthlySalary}
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
          confirmText={
            loading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : editingEmployee ? "Update Employee" : "Save Employee"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddEmployee;