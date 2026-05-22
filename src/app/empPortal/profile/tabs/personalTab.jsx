import { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";

import { TextInput }     from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";

const PersonalTab = ({ profile = {}, loading = false, onSave }) => {

  if (!profile) return null;
  const [formData, setFormData] = useState({
    fullName:     "",
    phone:        "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error,       setError]       = useState("");

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
  };

  const handleSave = async () => {
    setError("");
    const fd = new FormData();
    fd.append("fullName", formData.fullName);
    fd.append("phone",    formData.phone);

    const result = await onSave?.(fd);
    if (result?.success) {
      setSaveSuccess(true);
    } else {
      setError(result?.message || "Failed to save.");
    }
  };

  // read-only fields — admin controls these
  const readOnlyFields = [
    { label: "Email Address",      value: profile.email        || "—" },
    { label: "Department",         value: profile.department   || "—" },
    { label: "Role",               value: profile.role         || "—" },
    { label: "Joining Date",       value: profile.joiningDate  || "—" },
    { label: "Employment Type",    value: profile.empType      || "—" },
    { label: "Working Hours / Day",value: profile.workingHours || "—" },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2.5}>
        Personal Profile
      </Typography>

      {error && (
        <Box mb={2} px={2} py={1}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {/* Editable fields */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Full Name" />
          <TextInput
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Phone Number" />
          <TextInput
            placeholder="Enter Phone Number"
            value={formData.phone}
            onChange={handleChange("phone")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Grid>

        {/* Read-only fields */}
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