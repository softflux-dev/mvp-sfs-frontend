// src/app/hrPortal/bonusIncrement/addIncrementDialog.jsx —
import { useState, useEffect, useRef } from "react";
import {
  Box, MenuItem, Typography, Avatar, Divider, CircularProgress,
} from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer, DialogHeader, DialogBody, CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import { getEmployeesApi } from "../../../api/modules/employee";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const ALLOWANCE_LABELS = {
  basicSalary:        "Basic Salary",
  securityAllowance:  "Security Allowance",
  medicalAllowance:   "Medical Allowance",
  transportAllowance: "Transport Allowance",
  lunchAllowance:     "Lunch Allowance",
  housingAllowance:   "Housing Allowance",
};

const INITIAL_FORM = {
  employeeId:    "",
  effectiveDate: null,
  percentage:    "",
  description:   "",
};

const AddIncrementDialog = ({
  open,
  onClose,
  onSave,
  loading  = false,
  apiError = "",
}) => {
  const [form,   setForm]   = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});

  const fieldRefs = {
    employeeId:    useRef(null),
    effectiveDate: useRef(null),
    percentage:    useRef(null),
  };

  // Real employees from hook
const [employees, setEmployees] = useState([]);


  useEffect(() => {
  if (!open) return;
  getEmployeesApi({ limit: 100, page: 1 }).then((res) => {
    if (res?.status === 200 || res?.status === 201) {
      setEmployees(res.data.data.employees || []);
    }
  });
}, [open]);

  useEffect(() => {
    if (!open) return;
    setForm({ ...INITIAL_FORM });
    setErrors({});
  }, [open]);

  // Derived values
  const selectedEmployee = employees.find((e) => e._id === form.employeeId) || null;
  const pct = parseFloat(form.percentage) || 0;

  // Live breakdown calculation
  const calcBreakdown = (selectedEmployee?.salaryBreakdown && pct > 0)
    ? (() => {
        const result = {};
        Object.keys(ALLOWANCE_LABELS).forEach((key) => {
          const original = selectedEmployee.salaryBreakdown[key] || 0;
          result[key] = Math.round(original + (original * pct) / 100);
        });
        return result;
      })()
    : null;

  const newTotal = calcBreakdown
    ? Object.values(calcBreakdown).reduce((s, v) => s + v, 0)
    : 0;

  const set = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId)                            e.employeeId    = "Please select an employee.";
    if (!form.effectiveDate)                         e.effectiveDate = "Effective date is required.";
    if (!form.percentage || pct <= 0 || pct > 100)  e.percentage    = "Enter a valid percentage (1–100).";
    return e;
  };

  const FIELD_ORDER = ["employeeId", "effectiveDate", "percentage"];

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
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

    onSave?.({
      employeeId:       form.employeeId,
      effectiveDate:    form.effectiveDate,
      incrementPercent: pct,
      newSalary:        newTotal || selectedEmployee?.monthlySalary || 0,
      newBreakdown:     calcBreakdown || {},
      description:      form.description,
    });
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
        <DialogHeader title="Add Increment" onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
            maxHeight: "62vh", overflowY: "auto",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
          }}>

            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Employee select */}
            <Box ref={fieldRefs.employeeId}>
              <CustomInputLabel label="Select Employee *" />
              <CustomSelect
                value={form.employeeId}
                onChange={set("employeeId")}
                fullWidth height="45px" inputBgColor="#fff" displayEmpty
                renderValue={(v) => {
                  const emp = employees.find((e) => e._id === v);
                  if (!emp) return (
                    <Typography fontSize={13} color="text.secondary">Select Employee</Typography>
                  );
                  return (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={emp.avatar}
                        sx={{ width: 24, height: 24, fontSize: "9px", fontWeight: 700,
                          background: "linear-gradient(135deg, #AA2493, #022179)", color: "#fff" }}
                      >{getInitials(emp.fullName)}</Avatar>
                      <Typography fontSize={13}>{emp.fullName}</Typography>
                      <Typography fontSize={11} color="text.secondary">({emp.empId})</Typography>
                    </Box>
                  );
                }}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id} sx={{ px: 1.5, py: 1, gap: 1.5 }}>
                    <Avatar src={emp.avatar}
                      sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        color: "#fff", flexShrink: 0 }}
                    >{getInitials(emp.fullName)}</Avatar>
                    <Box>
                      <Typography fontSize="13px" fontWeight={500}>{emp.fullName}</Typography>
                      <Typography fontSize="11px" color="text.secondary">{emp.empId}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </CustomSelect>
              {errors.employeeId && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.employeeId}</Typography>
              )}
            </Box>

            {/* Current monthly salary — read-only, shown once employee selected */}
            {selectedEmployee && (
              <Box>
                <CustomInputLabel label="Current Monthly Salary" />
                <Box sx={{
                  height: "45px", display: "flex", alignItems: "center", px: 2, gap: 1,
                  backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB",
                }}>
                  <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>
                  <Typography fontSize="15px" fontWeight={700} color="text.primary">
                    {(selectedEmployee.monthlySalary || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Effective Date */}
            <Box ref={fieldRefs.effectiveDate}>
              <CustomInputLabel label="Effective Date *" />
              <DatePicker
                value={form.effectiveDate}
                onChange={(val) => {
                  setForm((p) => ({ ...p, effectiveDate: val }));
                  if (errors.effectiveDate) setErrors((p) => ({ ...p, effectiveDate: "" }));
                }}
                slotProps={{
                  textField: { size: "small", fullWidth: true, error: !!errors.effectiveDate },
                }}
                sx={GlobalStyle.datePickerStyle}
              />
              {errors.effectiveDate && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.effectiveDate}</Typography>
              )}
            </Box>

            {/* Increment % */}
            <Box ref={fieldRefs.percentage}>
              <CustomInputLabel label="Increment Percentage *" />
              <TextInput
                placeholder="e.g. 10"
                value={form.percentage}
                onChange={set("percentage")}
                onKeyDown={(e) => { if (["-","e","E","+"].includes(e.key)) e.preventDefault(); }}
                inputBgColor="#fff" fullWidth type="number" inputProps={{ min: 1, max: 100 }}
                error={!!errors.percentage} helperText={errors.percentage}
                InputStartIcon={
                  <Typography fontSize="13px" color="#808080" fontWeight={500}>%</Typography>
                }
              />
            </Box>

            {/* Live salary breakdown — shown once employee + percentage are both filled */}
            {calcBreakdown && pct > 0 && (
              <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={1.5}>
                  Updated Salary Breakdown
                </Typography>

                {Object.entries(ALLOWANCE_LABELS).map(([key, label]) => {
                  const original = selectedEmployee?.salaryBreakdown?.[key] || 0;
                  const updated  = calcBreakdown[key] || 0;
                  return (
                    <Box key={key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography fontSize="12px" color="text.secondary">{label}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontSize="12px" color="text.secondary"
                          sx={{ textDecoration: "line-through" }}
                        >
                          Rs {original.toLocaleString()}
                        </Typography>
                        <Typography fontSize="12px" fontWeight={600} color="#04C373">
                          Rs {updated.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontSize="13px" fontWeight={700} color="text.primary">
                    New Total Monthly
                  </Typography>
                  <Typography fontSize="14px" fontWeight={700} color="#AA2493">
                    Rs {newTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Description */}
            <Box>
              <CustomInputLabel label="Description / Reason (Optional)" />
              <TextInput
                placeholder="e.g. Annual performance increment"
                value={form.description}
                onChange={set("description")}
                inputBgColor="#fff" fullWidth multiline rows={3}
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
              : "Apply Increment"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddIncrementDialog;