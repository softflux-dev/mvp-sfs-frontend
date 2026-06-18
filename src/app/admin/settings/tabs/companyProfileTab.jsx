// src/app/admin/settings/tabs/companyProfileTab.jsx — FULL REPLACEMENT
import { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, MenuItem, Grid, CircularProgress } from "@mui/material";

import { TextInput, CustomSelect } from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";
import { useCompanyProfile } from "../../../../hooks/companySettings";

import UploadIcon from "../../../../assets/icons/upload.svg";

const INDUSTRY_OPTIONS = [
  { value: "technology",  label: "Technology"  },
  { value: "finance",     label: "Finance"     },
  { value: "healthcare",  label: "Healthcare"  },
  { value: "education",   label: "Education"   },
  { value: "retail",      label: "Retail"      },
];

const MAX_LOGO_SIZE_MB = 2;
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

// Accepts: example.com, www.example.com, https://example.com, with optional path
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const INITIAL_FORM = {
  companyName: "",
  industry:    "",
  address:     "",
  website:     "",
  logoFile:    null,
  logoPreview: "",
};

const CompanyProfileTab = () => {
  const fileInputRef = useRef(null);
  const { profile, loading, actionLoading, error, saveProfile } = useCompanyProfile();

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoError,   setLogoError]   = useState("");

  // Populate form once the profile loads from the backend
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        industry:    profile.industry    || "",
        address:     profile.address     || "",
        website:     profile.website     || "",
        logoFile:    null,
        logoPreview: profile.logoUrl     || "",
      });
    }
  }, [profile]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError("");

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Logo must be a JPG, PNG, WEBP, or SVG image.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setLogoError(`Logo must be smaller than ${MAX_LOGO_SIZE_MB}MB.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      logoFile:    file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const validate = () => {
    const e = {};

    if (!formData.companyName.trim()) {
      e.companyName = "Company name is required.";
    } else if (formData.companyName.trim().length < 2) {
      e.companyName = "Company name must be at least 2 characters.";
    } else if (formData.companyName.trim().length > 100) {
      e.companyName = "Company name cannot exceed 100 characters.";
    }

    if (!formData.industry) {
      e.industry = "Please select an industry.";
    }

    if (!formData.address.trim()) {
      e.address = "Address is required.";
    } else if (formData.address.trim().length > 250) {
      e.address = "Address cannot exceed 250 characters.";
    }

    // Website is optional, but if provided must look like a real URL
    if (formData.website.trim() && !WEBSITE_REGEX.test(formData.website.trim())) {
      e.website = "Please enter a valid website URL (e.g. www.company.com).";
    }

    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await saveProfile(formData);
    if (result.success) {
      setSaveSuccess(true);
      setErrors({});
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>
      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2.5}>
        Company Profile
      </Typography>

      {error && (
        <Box mb={2.5} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {/* ── Logo upload ──────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
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
          {!formData.logoPreview && (formData.companyName?.charAt(0).toUpperCase() || "S")}
        </Avatar>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          hidden
          onChange={handleLogoChange}
        />

        <Box>
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
          <Typography fontSize="11px" color="text.secondary" mt={0.5}>
            JPG, PNG, WEBP or SVG · max {MAX_LOGO_SIZE_MB}MB
          </Typography>
        </Box>
      </Box>

      {logoError && (
        <Typography fontSize="12px" color="error" mb={2}>{logoError}</Typography>
      )}

      {/* ── Form fields ──────────────────────────────────────────────────── */}
      <Box sx={{ borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Grid container spacing={2}>
          {/* Company Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Company Name *" />
            <TextInput
              placeholder="Enter Name"
              value={formData.companyName}
              onChange={handleChange("companyName")}
              inputBgColor="#F5F5F5"
              fullWidth
              error={!!errors.companyName}
              helperText={errors.companyName}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Industry */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Industry *" />
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
            {errors.industry && (
              <Typography fontSize="12px" color="error" mt={0.5}>{errors.industry}</Typography>
            )}
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Address *" />
            <TextInput
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange("address")}
              inputBgColor="#F5F5F5"
              fullWidth
              error={!!errors.address}
              helperText={errors.address}
              inputProps={{ maxLength: 250 }}
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
              error={!!errors.website}
              helperText={errors.website}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Save button ──────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mt={2.5}>
        <CustomButton
          btnLabel={actionLoading ? "Saving..." : "Save Changes"}
          variant="gradient"
          handlePressBtn={handleSave}
          isDisabled={actionLoading}
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