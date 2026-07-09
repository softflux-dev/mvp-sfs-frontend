// src/app/admin/employees/salarySetupDialog.jsx —
import { useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";

const ALLOWANCE_FIELDS = [
  { key: "securityAllowance",   label: "Security Allowance"   },
  { key: "medicalAllowance",    label: "Medical Allowance"    },
  { key: "transportAllowance",  label: "Transport Allowance"  },
  { key: "lunchAllowance",      label: "Lunch Allowance"      },
  { key: "housingAllowance",    label: "Housing Allowance"    },
];

const EMPTY_SALARY = {
  basicSalary:          "",
  securityAllowance:    "",
  medicalAllowance:     "",
  transportAllowance:   "",
  lunchAllowance:       "",
  housingAllowance:     "",
};

const blockInvalidNumericKeys = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
};

const toNum = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const SalarySetupDialog = ({
  open,
  onClose,
  onSave,
  loading     = false,
  editingEmployee = null,
  initialSalary   = null,
  onDraftChange   = null,
}) => {
  const [salary, setSalary] = useState({ ...EMPTY_SALARY });
  const [errors, setErrors] = useState({});

 const fieldRefs = {
    basicSalary: useRef(null),
  };

  // ── Track the closed→open transition only — this must NOT re-run every
  //    time `initialSalary` changes while the dialog is already open,
  //    otherwise it fights with the continuous draft-sync effect below
  //    (every keystroke updates initialSalary via the parent, which would
  //    re-trigger this effect and reset the field mid-type).
  const wasOpenRef = useRef(false);

  // Pre-populate when editing an existing employee who already has salary data
useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;

    if (editingEmployee?.salaryBreakdown) {
      setSalary({
        basicSalary:         String(editingEmployee.salaryBreakdown.basicSalary        || ""),
        securityAllowance:   String(editingEmployee.salaryBreakdown.securityAllowance  || ""),
        medicalAllowance:    String(editingEmployee.salaryBreakdown.medicalAllowance   || ""),
        transportAllowance:  String(editingEmployee.salaryBreakdown.transportAllowance || ""),
        lunchAllowance:      String(editingEmployee.salaryBreakdown.lunchAllowance     || ""),
        housingAllowance:    String(editingEmployee.salaryBreakdown.housingAllowance   || ""),
      });
    } else if (initialSalary?.salaryBreakdown) {
      // Restore whatever the user last entered, in case this reopen is
      // due to a failed save (e.g. duplicate Attendance ID caught on step 1)
      setSalary({
        basicSalary:         String(initialSalary.salaryBreakdown.basicSalary        || ""),
        securityAllowance:   String(initialSalary.salaryBreakdown.securityAllowance  || ""),
        medicalAllowance:    String(initialSalary.salaryBreakdown.medicalAllowance   || ""),
        transportAllowance:  String(initialSalary.salaryBreakdown.transportAllowance || ""),
        lunchAllowance:      String(initialSalary.salaryBreakdown.lunchAllowance     || ""),
        housingAllowance:    String(initialSalary.salaryBreakdown.housingAllowance   || ""),
      });
    } else {
      setSalary({ ...EMPTY_SALARY });
    }
    setErrors({});
  }, [open, editingEmployee, initialSalary]);

// ── Continuously report the current draft back to the parent, so any
  //    partial input survives even if the user clicks "Back" instead of
  //    "Save" (e.g. to go fix a validation error on step 1).
  useEffect(() => {
    if (!open) return;
    onDraftChange?.({ salaryBreakdown: { ...salary } });
  }, [salary, open]);

  const handleChange = (field) => (e) => {
    setSalary((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Auto-calculated derived values ──────────────────────────────────────
  const totalMonthly =
    toNum(salary.basicSalary) +
    toNum(salary.securityAllowance) +
    toNum(salary.medicalAllowance) +
    toNum(salary.transportAllowance) +
    toNum(salary.lunchAllowance) +
    toNum(salary.housingAllowance);

  // Hourly rate = total monthly / (working days per month × hours per day)
  // Standard assumption: 22 working days, 8 hours — adjust if needed.
  const hourlyRate = totalMonthly > 0 ? (totalMonthly / (22 * 8)).toFixed(2) : "0.00";

  const validate = () => {
    const e = {};
    if (!salary.basicSalary || toNum(salary.basicSalary) <= 0) {
      e.basicSalary = "Basic salary is required and must be greater than 0.";
    }
    return e;
  };

  const FIELD_ORDER = ["basicSalary"];

  const handleSave = () => {
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
    onSave?.({
      salaryBreakdown: {
        basicSalary:        toNum(salary.basicSalary),
        securityAllowance:  toNum(salary.securityAllowance),
        medicalAllowance:   toNum(salary.medicalAllowance),
        transportAllowance: toNum(salary.transportAllowance),
        lunchAllowance:     toNum(salary.lunchAllowance),
        housingAllowance:   toNum(salary.housingAllowance),
      },
      monthlySalary: totalMonthly,   // ← passed back so existing monthlySalary field stays in sync
      hourlyRate:    parseFloat(hourlyRate),
    });
  };

 const handleClose = () => {
    setErrors({});
    onClose?.();
  };;

  const rsIcon = <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>;

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
      <DialogHeader title="Salary Setup" onClose={handleClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px", p: 3,
          display: "flex", flexDirection: "column", gap: 2,
          maxHeight: "60vh", overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
        }}>

          {/* Basic Salary */}
          <Box ref={fieldRefs.basicSalary}>
            <CustomInputLabel label="Basic Salary *" />
            <TextInput
              placeholder="0"
              value={salary.basicSalary}
              onChange={handleChange("basicSalary")}
              onKeyDown={blockInvalidNumericKeys}
              inputBgColor="#fff"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              error={!!errors.basicSalary}
              helperText={errors.basicSalary}
              InputStartIcon={rsIcon}
            />
          </Box>

          {/* Allowances */}
          {ALLOWANCE_FIELDS.map(({ key, label }) => (
            <Box key={key}>
              <CustomInputLabel label={`${label} (Optional)`} />
              <TextInput
                placeholder="0"
                value={salary[key]}
                onChange={handleChange(key)}
                onKeyDown={blockInvalidNumericKeys}
                inputBgColor="#fff"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                InputStartIcon={rsIcon}
              />
            </Box>
          ))}

          {/* Divider */}
          <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Total Monthly Salary — read-only, auto-calculated */}
            <Box>
              <CustomInputLabel label="Total Monthly Salary" />
              <Box sx={{
                height: "45px", display: "flex", alignItems: "center",
                px: 2, gap: 1,
                backgroundColor: "#fff", borderRadius: "10px",
                border: "1.5px solid #AA2493",
              }}>
                <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>
                <Typography fontSize="15px" fontWeight={700} color="text.primary">
                  {totalMonthly.toLocaleString()}
                </Typography>
                <Typography fontSize="11px" color="text.secondary" ml={1}>
                  (Basic + all allowances)
                </Typography>
              </Box>
            </Box>

            {/* Hourly Rate — read-only, auto-calculated */}
            <Box>
              <CustomInputLabel label="Hourly Rate" />
              <Box sx={{
                height: "45px", display: "flex", alignItems: "center",
                px: 2, gap: 1,
                backgroundColor: "#fff", borderRadius: "10px",
                border: "1px solid #E5E7EB",
              }}>
                <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>
                <Typography fontSize="15px" fontWeight={600} color="text.primary">
                  {hourlyRate}
                </Typography>
                <Typography fontSize="11px" color="text.secondary" ml={1}>
                  /hr (based on 22 days × 8 hrs)
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Back"
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : editingEmployee ? "Update Employee" : "Save Employee"
        }
        isConfirmBtnDisable={loading}
        variant="gradient"
      />
    </DialogContainer>
  );
};

export default SalarySetupDialog;