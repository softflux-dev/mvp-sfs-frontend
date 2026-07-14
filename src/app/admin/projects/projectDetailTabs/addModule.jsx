import { useState, useEffect, useRef } from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../../components/popups/confirmationDialog";

const STATUS_OPTIONS = [
  { value: "planning",    label: "Planning"    },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing"     },
  { value: "review",      label: "Review"      },
  { value: "completed",   label: "Completed"   },
];

const INITIAL_FORM = { moduleName: "", description: "", status: "", category: "" };

const AddModule = ({ open, onClose, onSave, editingModule = null, loading = false, categoryOptions = [] }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const fieldRefs = {
    category:   useRef(null),
    moduleName: useRef(null),
    status:     useRef(null),
  };

  useEffect(() => {
    if (editingModule) {
      setFormData({
        moduleName:  editingModule.title             || "",
        description: editingModule.description       || "",
        status:      editingModule.status?.toLowerCase() || "",
        category:    editingModule.categoryId         || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
  }, [editingModule, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.category) e.category = "Category is required";
    if (!formData.moduleName.trim()) {
      e.moduleName = "Module name is required";
    } else if (!/^[a-zA-Z0-9\s_-]+$/.test(formData.moduleName.trim())) {
      e.moduleName = "Module name can only contain letters, numbers, spaces, hyphens, or underscores.";
    }
    if (!formData.status) e.status = "Status is required";
    return e;
  };

  const FIELD_ORDER = ["category", "moduleName", "status"];

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = FIELD_ORDER.find((f) => validationErrors[f]);
      if (firstErrorField && fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    onSave?.(formData);
    handleClose();
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="440px" fullWidth>
        <DialogHeader
          title={editingModule ? "Edit Module" : "Add Module"}
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
            {/* Category */}
            <Box ref={fieldRefs.category}>
              <CustomInputLabel label="Category *" />
              <CustomSelect
                value={formData.category}
                onChange={handleChange("category")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
                displayEmpty
                renderValue={(v) =>
                  categoryOptions.find((c) => c._id === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">Select Category</Typography>
                  )
                }
              >
                {categoryOptions.map((c) => (
                  <MenuItem key={c._id} value={c._id}>{c.label}</MenuItem>
                ))}
              </CustomSelect>
              {errors.category && (
                <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>
                  {errors.category}
                </Typography>
              )}
            </Box>

            {/* Module Name */}
            <Box ref={fieldRefs.moduleName}>
              <CustomInputLabel label="Module Name" />
              <TextInput
                placeholder="Enter"
                value={formData.moduleName}
                onChange={handleChange("moduleName")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.moduleName}
                helperText={errors.moduleName}
              />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Description" />
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

            {/* Status */}
            <Box ref={fieldRefs.status}>
              <CustomInputLabel label="Status" />
              <CustomSelect
                value={formData.status}
                onChange={handleChange("status")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
              >
                <MenuItem value="">Select Status</MenuItem>
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
          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Save Module"
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Save Successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AddModule;