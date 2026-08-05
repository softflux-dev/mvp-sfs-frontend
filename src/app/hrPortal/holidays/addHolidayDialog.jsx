// hrPortal/holidays/addHolidayDialog.jsx 
import { useState, useEffect, useRef } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import { DatePicker }            from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider }  from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs }          from "@mui/x-date-pickers/AdapterDayjs";
import dayjs                     from "dayjs";

import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

const TYPE_OPTIONS = [
  { value: "public",    label: "Public"    },
  { value: "religious", label: "Religious" },
  { value: "national",  label: "National"  },
  { value: "company",   label: "Company"   },
  { value: "optional",  label: "Optional"  },
];


const INITIAL_FORM = {
  name:        "",
  type:        "public",
  fromDate:    null,
  toDate:      null,
  description: "",
};

const AddHolidayDialog = ({ open, onClose, onSave, editingHoliday = null, loading = false, apiError = "" }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});

  const fieldRefs = {
    name:     useRef(null),
    fromDate: useRef(null),
    toDate:   useRef(null),
  };

  useEffect(() => {
    if (!open) return;
    if (editingHoliday) {
      setFormData({
        name:        editingHoliday.name        || "",
        type:        editingHoliday.type        || "public",
        fromDate:    editingHoliday.fromDate     ? dayjs(editingHoliday.fromDate) : null,
        toDate:      editingHoliday.toDate       ? dayjs(editingHoliday.toDate)   : null,
        description: editingHoliday.description || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingHoliday, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Keep toDate in sync if it's before a newly-picked fromDate
  const handleFromDateChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      fromDate: val,
      toDate: prev.toDate && val && prev.toDate.isBefore(val) ? val : prev.toDate,
    }));
    if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name     = "Holiday name is required";
    if (!formData.fromDate)     e.fromDate = "Start date is required";
    if (!formData.toDate)       e.toDate   = "End date is required";
    if (formData.fromDate && formData.toDate && formData.toDate.isBefore(formData.fromDate)) {
      e.toDate = "End date cannot be before start date";
    }
    return e;
  };

  const FIELD_ORDER = ["name", "fromDate", "toDate"];

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
      name:        formData.name.trim(),
      type:        formData.type,
      fromDate:    formData.fromDate.format("YYYY-MM-DD"),
      toDate:      formData.toDate.format("YYYY-MM-DD"),
      description: formData.description.trim(),
    });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogContainer open={open} onClose={handleClose} maxWidth="500px" fullWidth>
        <DialogHeader title={editingHoliday ? "Edit Holiday" : "Add New Holiday"} onClose={handleClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

            {apiError && (
              <Box px={1.5} py={1} sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}>
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Holiday Name */}
            <Box ref={fieldRefs.name}>
              <CustomInputLabel label="Holiday Name *" />
              <TextInput
                placeholder="e.g. Eid-ul-Fitr, Independence Day"
                value={formData.name}
                onChange={handleChange("name")}
                inputBgColor="#fff" fullWidth
                error={!!errors.name} helperText={errors.name}
              />
            </Box>

            {/* Type + Pay Type */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Holiday Type *" />
                <CustomSelect value={formData.type} onChange={handleChange("type")} fullWidth height="45px" inputBgColor="#fff">
                  {TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Box>

           {/* From / To Date */}
          <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
            <Box ref={fieldRefs.fromDate}>
              <CustomInputLabel label="Start Date *" />
              <DatePicker
                value={formData.fromDate}
                onChange={handleFromDateChange}
                slotProps={{
                  textField: { size: "small", fullWidth: true, error: !!errors.fromDate },
                  popper: { sx: GlobalStyle.datePickerPopperSx },
                }}
                sx={{
                  ...GlobalStyle.datePickerStyle, width: "100%",
                  "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } },
                }}
              />
              {errors.fromDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.fromDate}</Typography>}
            </Box>
            <Box ref={fieldRefs.toDate}>
              <CustomInputLabel label="End Date *" />
              <DatePicker
                value={formData.toDate}
                onChange={handleChange("toDate")}
                minDate={formData.fromDate || undefined}
                slotProps={{
                  textField: { size: "small", fullWidth: true, error: !!errors.toDate },
                  popper: { sx: GlobalStyle.datePickerPopperSx },
                }}
                sx={{
                  ...GlobalStyle.datePickerStyle, width: "100%",
                  "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "14px", "& fieldset": { border: "none" } },
                }}
              />
              {errors.toDate && <Typography fontSize="12px" color="error" mt={0.5}>{errors.toDate}</Typography>}
            </Box>
          </Box>
            <Typography fontSize="11px" color="text.secondary" mt={-1.5}>
              For a single-day holiday, set both dates the same.
            </Typography>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput
                placeholder="Optional notes about this holiday..."
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff" fullWidth
              />
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText={editingHoliday ? "Update Holiday" : "Save Holiday"}
          isConfirmBtnDisable={loading}
          variant="gradient"
        />
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default AddHolidayDialog;