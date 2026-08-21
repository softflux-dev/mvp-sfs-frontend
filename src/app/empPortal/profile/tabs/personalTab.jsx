import { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";

import { TextInput }     from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";

const PersonalTab = ({ profile = {}, loading = false, onSave }) => {

  if (!profile) return null;

  const [formData, setFormData] = useState({
    fullName: "",
    phone:    "",
  });
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  // seed form when profile loads
  useEffect(() => {
    if (profile?.name) {
      setFormData({
        fullName: profile.name  || "",
        phone:    profile.phone || "",
      });
    }
  }, [profile]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};

    // Name: required, no digits
    if (!formData.fullName.trim()) {
      e.fullName = "Full name is required.";
    } else if (/\d/.test(formData.fullName)) {
      e.fullName = "Name cannot contain numbers.";
    }

    // Phone: optional, but if entered must be exactly 11 digits
    if (formData.phone.trim()) {
      if (!/^\d+$/.test(formData.phone.trim())) {
        e.phone = "Phone number must contain digits only.";
      } else if (formData.phone.trim().length !== 11) {
        e.phone = "Phone number must be exactly 11 digits.";
      }
    }

    return e;
  };

  const handleSave = async () => {
    setApiError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await onSave?.({
      fullName: formData.fullName,
      phone:    formData.phone,
    });
    if (result?.success) {
      setSaveSuccess(true);
      setErrors({});
    } else {
      setApiError(result?.message || "Failed to save.");
    }
  };

  // read-only fields — admin controls these
  const readOnlyFields = [
    { label: "Email Address",       value: profile.email        || "—" },
    { label: "Department",          value: profile.department   || "—" },
    { label: "Role",                value: profile.role         || "—" },
    { label: "Joining Date",        value: profile.joiningDate  || "—" },
    { label: "Employment Type",     value: profile.empType      || "—" },
    { label: "Working Hours / Day", value: profile.workingHours || "—" },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2.5}>
        Personal Profile
      </Typography>

      {apiError && (
        <Box mb={2} px={2} py={1}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{apiError}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {/* Editable — Full Name */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Full Name" />
          <TextInput
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            onKeyDown={(e) => {
              // Block digit keys so numbers can't be typed into the name field
              if (/^\d$/.test(e.key)) e.preventDefault();
            }}
            inputBgColor="#F5F5F5"
            fullWidth
            error={!!errors.fullName}
            helperText={errors.fullName}
          />
        </Grid>

        {/* Editable — Phone */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Phone Number" />
          <TextInput
            placeholder="Enter 11-digit phone number"
            value={formData.phone}
            onChange={handleChange("phone")}
            onKeyDown={(e) => {
              // Allow only digits, backspace, delete, arrows, tab
              if (
                !/^\d$/.test(e.key) &&
                !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            inputBgColor="#F5F5F5"
            fullWidth
            inputProps={{ maxLength: 11 }}
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Grid>

        {/* Read-only fields — admin controls these */}
        {readOnlyFields.map(({ label, value }) => (
          <Grid key={label} size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label={label} />
            <TextInput
              value={value}
              inputBgColor="#F5F5F5"
              fullWidth
              disabled
            />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={2.5}>
        <CustomButton
          btnLabel={loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : "Save Changes"
          }
          variant="gradient"
          handlePressBtn={handleSave}
          disabled={loading}
        />
      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Profile updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default PersonalTab;