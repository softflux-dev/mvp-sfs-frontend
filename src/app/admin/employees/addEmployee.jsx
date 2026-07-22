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
import { useDepartment }   from "../../../hooks/department";
import { useRole }         from "../../../hooks/role";
import SalarySetupDialog   from "./salarySetupDialog";
import PhoneInput from "../../../components/phoneInput";
import { usePhoneConfigStore } from "../../../zustand/usePhoneConfigStore";
import { validatePhone, parseE164 } from "../../../utils/phone";
import avatarPlaceholder from "../../../assets/icons/avatar-placeholder.svg";
import cameraIcon        from "../../../assets/icons/camera-icon.svg";
import { baseUrl } from "../../../api/index";

const getBackendOrigin = () => baseUrl.replace(/\/api\/?$/, "");

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("C:\\") ||
    url.startsWith("/root/") ||
    url.startsWith("/home/") ||
    url.includes(":\\")
  ) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${getBackendOrigin()}${url}`;
};


const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract",  label: "Contract"  },
];

const INITIAL_FORM = {
  fullName:       "",
  email:          "",
  phoneCountry:   "",
  phoneNational:  "",
  department:     "",
  role:           "",
  employmentType: "",
  workingHours:   "",
  joiningDate:    null,
  monthlySalary:  "",
  machineId:      "",
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
  existingMachineIds = [],
}) => {
  const { departments, fetchDepartments } = useDepartment();
  const { roles,       fetchRoles }       = useRole();
  const { countries, allowedCountries, defaultCountry } = usePhoneConfigStore();
  const phoneCountries = allowedCountries.length
    ? countries.filter((c) => allowedCountries.includes(c.code))
    : countries;



  const [formData,       setFormData]       = useState(INITIAL_FORM);
  const [errors,         setErrors]         = useState({});
  const [salaryOpen,     setSalaryOpen]     = useState(false);  // step 2
  const [pendingFormData, setPendingFormData] = useState(null); 
  const [salaryDraft,    setSalaryDraft]    = useState(null);
  const fileInputRef = useRef();

   const filteredRoles = formData.department
    ? roles.filter((r) => (r.department?._id || r.department) === formData.department)
    : roles;

  const fieldRefs = {
    fullName:       useRef(null),
    email:          useRef(null),
    phone:          useRef(null),
    department:     useRef(null),
    role:           useRef(null),
    employmentType: useRef(null),
    workingHours:   useRef(null),
    joiningDate:    useRef(null),
    machineId:      useRef(null),
  };

  useEffect(() => {
    if (open) {
      fetchDepartments({ limit: 100 });
      fetchRoles({ limit: 100 });
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    setSalaryOpen(false);
    setPendingFormData(null);
    setSalaryDraft(null);
    setErrors({});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editingEmployee) {
      // Stored phone is E.164 — split it back into country + national parts
      const parsed = parseE164(editingEmployee.phone);
      setFormData({
        fullName:       editingEmployee.name          || editingEmployee.fullName || "",
        email:          editingEmployee.email         || "",
        phoneCountry:   parsed?.country        || editingEmployee.phoneCountry || defaultCountry,
        phoneNational:  parsed?.nationalNumber || "",
        department:     editingEmployee.departmentId  || "",
        role:           editingEmployee.roleId        || "",
        employmentType: editingEmployee.type          || editingEmployee.employmentType || "",
        workingHours:   editingEmployee.workingHours  ?? "",
        joiningDate:    editingEmployee.joiningDate
                          ? new Date(editingEmployee.joiningDate) : null,
        monthlySalary:  editingEmployee.monthlySalary != null
                          ? String(editingEmployee.monthlySalary) : "",
        machineId:      editingEmployee.machineId     || "",
        avatarFile:     null,
        avatarPreview:  resolveAvatarUrl(editingEmployee.avatar) || "",
      });
    } else {
      setFormData({ ...INITIAL_FORM, phoneCountry: defaultCountry });
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
const handleDepartmentChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, department: val, role: "" }));
    if (errors.department) setErrors((prev) => ({ ...prev, department: "" }));
    if (errors.role)       setErrors((prev) => ({ ...prev, role: "" }));
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

  const blockNegativePaste = (e) => {
  const pasted = e.clipboardData.getData("text");
  if (/-/.test(pasted)) e.preventDefault();
};
  const NAME_PATTERN = /^[a-zA-Z ]+$/;
  const FULLNAME_MAX_LENGTH = 50;

  const validate = () => {
    const e = {};
    if (formData.machineId.trim()) {
      if (!/^\d+$/.test(formData.machineId.trim())) {
        e.machineId = "Machine ID must contain numbers only.";
      } else if (existingMachineIds.includes(formData.machineId.trim())) {
        e.machineId = "This Attendance Machine ID is already assigned to another employee.";
      }
    }
   if (!formData.fullName.trim()) {
      e.fullName = "Full name is required";
    } else if (!NAME_PATTERN.test(formData.fullName.trim())) {
      e.fullName = "Full name can only contain letters and spaces";
    } else if (formData.fullName.trim().length < 2) {
      e.fullName = "Full name must be at least 2 characters";
    } else if (formData.fullName.trim().length > FULLNAME_MAX_LENGTH) {
      e.fullName = `Full name cannot exceed ${FULLNAME_MAX_LENGTH} characters`;
    } else if (/\s{2,}/.test(formData.fullName.trim())) {
      e.fullName = "Full name cannot contain multiple consecutive spaces";
    }
   if (!formData.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      e.email = "Please enter a valid email address";
    }
    if (formData.phoneNational?.trim()) {
      const country = phoneCountries.find((c) => c.code === formData.phoneCountry);
      const result  = validatePhone(country, formData.phoneNational);
      if (!result.valid) e.phone = result.message;
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

    return e;
  };

  const FIELD_ORDER = [
    "machineId", "fullName", "email", "phone",
    "department", "role", "employmentType",
    "workingHours", "joiningDate",
  ];

  // Step 1 — validate and open salary dialog
  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstErrorField = FIELD_ORDER.find((f) => validationErrors[f]);
      if (firstErrorField && fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block:    "center",
        });
      }
      return;
    }
    setPendingFormData(formData);
    setSalaryOpen(true);
  };


  // Step 2 — salary dialog calls this with the salary breakdown

  const handleSalaryDone = (salaryData) => {
    setSalaryDraft(salaryData);   // keep a copy in case the save below fails
    setSalaryOpen(false);

    // Phone goes to the backend in canonical E.164 form
    const country = phoneCountries.find((c) => c.code === pendingFormData.phoneCountry);
    const parsed  = pendingFormData.phoneNational
      ? validatePhone(country, pendingFormData.phoneNational)
      : null;

    // Merge step 1 + step 2 and call the parent's onSave
    onSave?.({
      ...pendingFormData,
      phone:           parsed?.valid ? parsed.e164 : "",
      phoneCountry:    pendingFormData.phoneCountry || "",
      monthlySalary:   salaryData.monthlySalary,
      hourlyRate:      salaryData.hourlyRate,
      salaryBreakdown: salaryData.salaryBreakdown,
    });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSalaryOpen(false);
    setPendingFormData(null);
    setSalaryDraft(null); 
    onClose?.();
  };

  const handleWorkingHoursChange = (e) => {
  let val = e.target.value.replace(/-/g, "");
  setFormData((prev) => ({ ...prev, workingHours: val }));
  if (errors.workingHours) setErrors((prev) => ({ ...prev, workingHours: "" }));
};

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* ── Step 1: Employee Info ──────────────────────────────────────── */}
      <DialogContainer open={open && !salaryOpen} onClose={handleClose} maxWidth="500px" fullWidth>
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

            {/* Attendance Machine ID */}
            <Box ref={fieldRefs.machineId}>
              <CustomInputLabel label="Attendance Machine ID (Optional)" />
              <TextInput
                placeholder="e.g. 1024 (ID from biometric device)"
                value={formData.machineId}
                onChange={handleChange("machineId")}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
                  if (!/[\d]/.test(e.key) &&
                      !["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.machineId}
                helperText={errors.machineId}
              />
            </Box>

           {/* Full Name */}
            <Box ref={fieldRefs.fullName}>
              <CustomInputLabel label="Full Name *" />
              <TextInput placeholder="Enter Full Name" value={formData.fullName}
                onChange={handleChange("fullName")} inputBgColor="#fff" fullWidth
                error={!!errors.fullName} helperText={errors.fullName}
                inputProps={{ maxLength: FULLNAME_MAX_LENGTH }} />
            </Box>

            {/* Email */}
            <Box ref={fieldRefs.email}>
              <CustomInputLabel label="Email *" />
              <TextInput placeholder="Enter Email" value={formData.email}
                onChange={handleChange("email")} inputBgColor="#fff" fullWidth
                type="email" disabled={!!editingEmployee}
                error={!!errors.email} helperText={errors.email} />
            </Box>

       
            {/* Phone */}
            <Box ref={fieldRefs.phone}>
              <CustomInputLabel label="Phone" />
              {phoneCountries.length === 0 ? (
                <Typography fontSize="12px" color="text.secondary">
                  No phone format configured. Set one in Settings → Company Profile.
                </Typography>
              ) : (
                <PhoneInput
                  value={{ country: formData.phoneCountry, nationalNumber: formData.phoneNational }}
                  onChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      phoneCountry:  val.country,
                      phoneNational: val.nationalNumber,
                    }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  countries={phoneCountries}
                  error={errors.phone}
                  countryWidth={130}
                />
              )}
            </Box>

            {/* Department + Role */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box ref={fieldRefs.department}>
                <CustomInputLabel label="Department *" />
               <CustomSelect value={formData.department}
                  onChange={handleDepartmentChange}
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
              <Box ref={fieldRefs.role}>
                <CustomInputLabel label="Role *" />
                <CustomSelect value={formData.role}
                  onChange={handleChange("role")}
                  fullWidth height="45px" inputBgColor="#fff" displayEmpty
                  disabled={!formData.department}
                  renderValue={(v) =>
                    filteredRoles.find((r) => r._id === v)?.roleName || (
                      <Typography fontSize={13} color="text.secondary">
                        {formData.department ? "Select Role" : "Select department first"}
                      </Typography>
                    )
                  }
                >
                  {filteredRoles.length === 0
                    ? <MenuItem disabled><Typography fontSize={13} color="text.secondary">No roles in this department</Typography></MenuItem>
                    : filteredRoles.map((r) => (
                        <MenuItem key={r._id} value={r._id}>{r.roleName}</MenuItem>
                      ))
                  }
                </CustomSelect>
                {errors.role && (
                  <Typography fontSize="12px" color="error" mt={0.5}>{errors.role}</Typography>
                )}
              </Box>
            </Box>

            {/* Employment Type */}
            <Box ref={fieldRefs.employmentType}>
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
              <Box ref={fieldRefs.workingHours}>
                <CustomInputLabel label="Working Hours/Day *" />
              <TextInput placeholder="0" value={formData.workingHours}
                  onChange={handleWorkingHoursChange}
                  onKeyDown={blockInvalidNumericKeys}
                  onPaste={blockNegativePaste}
                  inputBgColor="#fff" fullWidth type="number"
                  inputProps={{ min: 1, max: 24, step: 1 }}
                  error={!!errors.workingHours} helperText={errors.workingHours} />
              </Box>
              <Box ref={fieldRefs.joiningDate}>
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

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleNext}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Next"
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>

      {/* ── Step 2: Salary Setup ───────────────────────────────────────── */}
      <SalarySetupDialog
        open={salaryOpen}
        onClose={() => setSalaryOpen(false)}
        onSave={handleSalaryDone}
        loading={loading}
        editingEmployee={editingEmployee}
        initialSalary={salaryDraft}
        onDraftChange={setSalaryDraft}
      />
    </LocalizationProvider>
  );
};

export default AddEmployee;