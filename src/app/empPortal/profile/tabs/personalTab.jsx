// profile/tabs/personalTab.jsx
import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";

import { TextInput } from "../../../../components";
import CustomInputLabel from "../../../../components/customInputLabel";
import CustomButton from "../../../../components/customButton";
import SuccessPopup from "../../../../components/popups/confirmationDialog";

const PersonalTab = ({ profile = {} }) => {
  const [formData, setFormData] = useState({
    fullName:       profile.name         || "John Doe",
    email:          profile.email        || "john.doe@company.com",
    phoneNumber:    profile.phone        || "+1 (555) 123-4567",
    department:     profile.department   || "Engineering",
    designation:    profile.designation  || "Senior Developer",
    joiningDate:    profile.joiningDate  || "2024-06-15",
    employmentType: profile.empType      || "Full-time",
    workingHours:   profile.workingHours || "8 hours",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    console.log("Save personal profile:", formData);
    setSaveSuccess(true);
  };

  const fields = [
    { key: "fullName",       label: "Full Name",          placeholder: "Enter Full Name"      },
    { key: "email",          label: "Email Address",      placeholder: "Enter Email Address"  },
    { key: "phoneNumber",    label: "Phone Number",       placeholder: "Enter Phone Number"   },
    { key: "department",     label: "Department",         placeholder: "Enter Department"     },
    { key: "designation",    label: "Designation",        placeholder: "Enter Designation"    },
    { key: "joiningDate",    label: "Joining Date",       placeholder: "YYYY-MM-DD"           },
    { key: "employmentType", label: "Employment Type",    placeholder: "e.g. Full-time"       },
    { key: "workingHours",   label: "Working Hours / Day",placeholder: "e.g. 8 hours"         },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2.5}>
        Personal Profile
      </Typography>

      <Box
        sx={{
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Grid container spacing={2}>
          {fields.map(({ key, label, placeholder }) => (
            <Grid key={key} size={{ xs: 12, md: 6 }}>
              <CustomInputLabel label={label} />
              <TextInput
                placeholder={placeholder}
                value={formData[key]}
                onChange={handleChange(key)}
                inputBgColor="#F5F5F5"
                fullWidth
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Save button */}
      <Box display="flex" justifyContent="flex-end" mt={2.5}>
        <CustomButton
          btnLabel="Save Changes"
          variant="gradient"
          handlePressBtn={handleSave}
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