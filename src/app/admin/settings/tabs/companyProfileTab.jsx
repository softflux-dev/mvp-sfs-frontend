// src/app/admin/settings/tabs/companyProfileTab.jsx — 
import { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, MenuItem, Grid, CircularProgress } from "@mui/material";

import { TextInput, CustomSelect } from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";
import { useCompanyProfile } from "../../../../hooks/companySettings";
import { useCompanyLogoStore } from "../../../../zustand/useCompanyLogoStore";
import { baseUrl } from "../../../../api/index";
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

// ── Banner upload constraints. SVG intentionally excluded — most email
// clients (Outlook especially) don't reliably render SVG in <img> tags,
// and the banner's whole purpose is to appear inside emails. ────────────
const MAX_BANNER_SIZE_MB = 3;
const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Accepts: example.com, www.example.com, https://example.com, with optional path
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const INITIAL_FORM = {
  companyName:   "",
  industry:      "",
  address:       "",
  website:       "",
  logoFile:      null,
  logoPreview:   "",
  bannerFile:    null,
  bannerPreview: "",
};


const resolveLogoUrl = (logoUrl) => logoUrl || "";

const CompanyProfileTab = () => {
  const fileInputRef   = useRef(null);
  const bannerInputRef = useRef(null);
  const { profile, loading, actionLoading, error, saveProfile } = useCompanyProfile();
  const setCompanyLogo = useCompanyLogoStore((state) => state.setLogoUrl);

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoError,   setLogoError]   = useState("");
  const [bannerError, setBannerError] = useState("");

  // Populate form once the profile loads from the backend
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName:   profile.companyName || "",
        industry:      profile.industry    || "",
        address:       profile.address     || "",
        website:       profile.website     || "",
        logoFile:      null,
        logoPreview:   resolveLogoUrl(profile.logoUrl),
        bannerFile:    null,
        bannerPreview: resolveLogoUrl(profile.bannerUrl),
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
      // URL.createObjectURL gives a temporary LOCAL blob URL for instant
      // preview before saving — this is fine as-is, it's not a backend
      // path so resolveLogoUrl doesn't apply here.
      logoPreview: URL.createObjectURL(file),
    }));
  };

  // ── Banner upload handler — same validation pattern as logo ─────────────
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError("");

    if (!ALLOWED_BANNER_TYPES.includes(file.type)) {
      setBannerError("Banner must be a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
      setBannerError(`Banner must be smaller than ${MAX_BANNER_SIZE_MB}MB.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      bannerFile:    file,
      bannerPreview: URL.createObjectURL(file),
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

      // Broadcast the new logo URL immediately so the topbar avatar
      // (Profile.jsx, Admin only) updates live without a page refresh.
      // Must resolve to an absolute URL here too — same reasoning as above.
      if (result.profile?.logoUrl) {
        setCompanyLogo(resolveLogoUrl(result.profile.logoUrl));
      }

      // Also refresh the local preview to the now-permanent backend URL,
      // replacing the temporary blob: URL used during preview.
      setFormData((prev) => ({
        ...prev,
        logoFile:      null,
        logoPreview:   resolveLogoUrl(result.profile?.logoUrl) || prev.logoPreview,
        bannerFile:    null,
        bannerPreview: resolveLogoUrl(result.profile?.bannerUrl) || prev.bannerPreview,
      }));
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

      {/* ── Logo + Banner upload — side by side, aligned with the form
          field columns below (each takes half width, matching the
          md:6/md:6 Grid pattern used further down). ─────────────────────── */}
      <Grid container spacing={2} mb={1}>

        {/* Logo upload — left column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={formData.logoPreview}
              sx={{
                width: 72,
                height: 72,
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
              <Typography fontSize="11px" color="text.secondary">
                Used in reports, the app bar, and everywhere else in the system.
              </Typography>
            </Box>
          </Box>
          {logoError && (
            <Typography fontSize="12px" color="error" mt={1}>{logoError}</Typography>
          )}
        </Grid>

        {/* Banner upload — right column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 140,
                height: 72,
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#F5F5F5",
                backgroundImage: formData.bannerPreview ? `url(${formData.bannerPreview})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {!formData.bannerPreview && (
                <Typography fontSize="10px" color="text.secondary" textAlign="center" px={1}>
                  No banner uploaded
                </Typography>
              )}
            </Box>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleBannerChange}
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
                btnLabel="Upload Email Banner"
                handlePressBtn={() => bannerInputRef.current?.click()}
              />
              <Typography fontSize="11px" color="text.secondary" mt={0.5}>
                JPG, PNG or WEBP · max {MAX_BANNER_SIZE_MB}MB
              </Typography>
              <Typography fontSize="11px" color="text.secondary">
                Used only in emails. If not uploaded, your logo will be used instead.
              </Typography>
            </Box>
          </Box>
          {bannerError && (
            <Typography fontSize="12px" color="error" mt={1}>{bannerError}</Typography>
          )}
        </Grid>

      </Grid>

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