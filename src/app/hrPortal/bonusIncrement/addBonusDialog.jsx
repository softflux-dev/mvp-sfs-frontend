// src/app/hrPortal/bonusIncrement/addBonusDialog.jsx — 
import { useState, useEffect } from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox, CircularProgress } from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";
import {
  DialogContainer, DialogHeader, DialogBody, CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";
import { useEmployee }     from "../../../hooks/employee";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: { borderRadius: "14px", mt: 0.5, boxShadow: "0px 8px 24px rgba(0,0,0,0.10)", maxHeight: 280 },
  },
};

const INITIAL_FORM = { monthYear: null, amount: "", employeeIds: [], description: "" };

const AddBonusDialog = ({
  open,
  onClose,
  onSave,
  editingBonus = null,
  loading      = false,
  apiError     = "",
}) => {
  const [form,   setForm]   = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});

  // Real employees from hook — fetch flat list when dialog opens
  const { employees, fetchEmployees } = useEmployee();

  useEffect(() => {
    if (open) fetchEmployees({ limit: 100, page: 1 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editingBonus) {
      setForm({
        // month/year from the bonus record to seed the picker
        monthYear:   (editingBonus.month !== undefined && editingBonus.year)
          ? new Date(editingBonus.year, editingBonus.month, 1)
          : null,
        amount:      String(editingBonus.amount || ""),
        employeeIds: [editingBonus.employeeId].filter(Boolean),
        description: editingBonus.description || "",
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }
    setErrors({});
  }, [open, editingBonus]);

  const set = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.monthYear)                          e.monthYear   = "Please select a month.";
    if (!form.amount || Number(form.amount) <= 0) e.amount      = "Enter a valid bonus amount.";
    if (!form.employeeIds.length)                 e.employeeIds = "Select at least one employee.";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const d = new Date(form.monthYear);
    onSave?.({
      employeeIds: form.employeeIds,
      month:       d.getMonth(),   // 0-indexed — matches backend schema
      year:        d.getFullYear(),
      amount:      Number(form.amount),
      description: form.description,
    });
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose?.();
  };

  const renderMultiValue = (selected) => {
    if (!selected?.length)
      return <Typography fontSize={13} color="text.secondary">Select employees</Typography>;
    const matched = employees.filter((e) => selected.includes(e._id));
    if (!matched.length)
      return <Typography fontSize={13} color="text.secondary">Select employees</Typography>;
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
        <Typography fontSize={13} color="text.primary" noWrap>
          {matched.length === 1
            ? matched[0].fullName
            : `${matched[0].fullName} +${matched.length - 1} more`}
        </Typography>
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="480px" fullWidth>
        <DialogHeader
          title={editingBonus ? "Edit Bonus" : "Add Bonus"}
          onClose={handleClose}
        />
        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
            display: "flex", flexDirection: "column", gap: 2.5,
          }}>

            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Month/Year DatePicker */}
            <Box>
              <CustomInputLabel label="Bonus Month *" />
              <DatePicker
                value={form.monthYear}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, monthYear: val }));
                  if (errors.monthYear) setErrors((prev) => ({ ...prev, monthYear: "" }));
                }}
                views={["year", "month"]}
                openTo="month"
                slotProps={{
                  textField: { size: "small", fullWidth: true, error: !!errors.monthYear },
                }}
                sx={GlobalStyle.datePickerStyle}
              />
              {errors.monthYear && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.monthYear}</Typography>
              )}
            </Box>

            {/* Amount */}
            <Box>
              <CustomInputLabel label="Bonus Amount (Rs) *" />
              <TextInput
                placeholder="Enter amount"
                value={form.amount}
                onChange={set("amount")}
                onKeyDown={(e) => { if (["-","e","E","+"].includes(e.key)) e.preventDefault(); }}
                inputBgColor="#fff" fullWidth type="number" inputProps={{ min: 1 }}
                error={!!errors.amount} helperText={errors.amount}
                InputStartIcon={
                  <Typography fontSize="13px" color="#808080" fontWeight={500}>Rs</Typography>
                }
              />
            </Box>

            {/* Multi-select employees — real data from useEmployee */}
            <Box>
              <CustomInputLabel label="Select Employees *" />
              <CustomSelect
                multiple
                value={form.employeeIds}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, employeeIds: e.target.value }));
                  if (errors.employeeIds) setErrors((prev) => ({ ...prev, employeeIds: "" }));
                }}
                fullWidth height="45px" inputBgColor="#fff"
                displayEmpty renderValue={renderMultiValue} MenuProps={multiMenuProps}
              >
                {employees.map((emp) => {
                  const isSelected = form.employeeIds.includes(emp._id);
                  return (
                    <MenuItem key={emp._id} value={emp._id} disableRipple
                      sx={{
                        px: 1.5, py: 1, gap: 1.5,
                        backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                        "&:hover": { backgroundColor: "#F5F5F5" },
                        "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                        "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                      }}
                    >
                      <Avatar src={emp.avatar}
                        sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                          background: "linear-gradient(135deg, #AA2493, #022179)",
                          color: "#fff", flexShrink: 0 }}
                      >{getInitials(emp.fullName)}</Avatar>
                      <Box flex={1}>
                        <Typography fontSize="13px" fontWeight={500}>{emp.fullName}</Typography>
                        <Typography fontSize="11px" color="text.secondary">{emp.empId}</Typography>
                      </Box>
                      <Checkbox checked={isSelected} disableRipple
                        sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                      />
                    </MenuItem>
                  );
                })}
              </CustomSelect>
              {errors.employeeIds && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.employeeIds}</Typography>
              )}
            </Box>

            {/* Description (optional) */}
            <Box>
              <CustomInputLabel label="Description (Optional)" />
              <TextInput
                placeholder="e.g. Eid bonus, performance bonus"
                value={form.description}
                onChange={set("description")}
                inputBgColor="#fff" fullWidth multiline rows={2}
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
              : editingBonus ? "Update Bonus" : "Add Bonus"
          }
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddBonusDialog;