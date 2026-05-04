import { useState, useRef } from "react";
import { Box, Typography, Avatar, MenuItem, Grid } from "@mui/material";

import { TextInput, CustomSelect } from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";

import UploadIcon from "../../../../assets/icons/upload.svg";

const INDUSTRY_OPTIONS = [
  { value: "technology",  label: "Technology"  },
  { value: "finance",     label: "Finance"     },
  { value: "healthcare",  label: "Healthcare"  },
  { value: "education",   label: "Education"   },
  { value: "retail",      label: "Retail"      },
];

const CompanyProfileTab = () => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    logo:        null,
    logoPreview: "",
    companyName: "",
    industry:    "",
    address:     "",
    website:     "",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      logo:        file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = () => {
    console.log("Save:", formData);
    setSaveSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2.5}>
        Company Profile
      </Typography>

     {/* ── Logo upload ──────────────────────────────────────────────────── */}
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Avatar
        src={formData.logoPreview}
        sx={{
          width: 72,
          height: 72,
          background: "linear-gradient(135deg, #AA2493, #022179)",
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        {!formData.logoPreview && "S"}
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleLogoChange}
      />

      <CustomButton
        type="button"
        btnBgColor="primary.lightGray"
        btnTextColor="text.primary"
        startIcon={
          <img src={UploadIcon} alt="upload" style={{ width: 15, height: 15, marginLeft: 20 }} />
        }
        width="auto"
        textWeight={true}
        btnLabel="Upload Logo"
        handlePressBtn={() => fileInputRef.current?.click()}
      />
    </Box>

      {/* ── Form fields ──────────────────────────────────────────────────── */}
      <Box
        sx={{
         
          borderRadius: "16px",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Grid container spacing={2}>
          {/* Company Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Company Name" />
            <TextInput
              placeholder="Enter Name"
              value={formData.companyName}
              onChange={handleChange("companyName")}
              inputBgColor="#F5F5F5"
              fullWidth
            />
          </Grid>

          {/* Industry */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Industry" />
            <CustomSelect
              value={formData.industry}
              onChange={handleChange("industry")}
              fullWidth
              height="45px"
              inputBgColor="#F5F5F5"
            >
              <MenuItem value="">Select Industry</MenuItem>
              {INDUSTRY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Address" />
            <TextInput
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange("address")}
              inputBgColor="#F5F5F5"
              fullWidth
            />
          </Grid>

          {/* Website */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Website" />
            <TextInput
              placeholder="Enter Website Url"
              value={formData.website}
              onChange={handleChange("website")}
              inputBgColor="#F5F5F5"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Save button ──────────────────────────────────────────────────── */}
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
        message="Changes saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default CompanyProfileTab;