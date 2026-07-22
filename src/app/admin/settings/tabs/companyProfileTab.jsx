// src/app/admin/settings/tabs/companyProfileTab.jsx
import { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, MenuItem, Grid, CircularProgress, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { TextInput, CustomSelect } from "../../../../components";
import CustomInputLabel  from "../../../../components/customInputLabel";
import CustomButton      from "../../../../components/customButton";
import SuccessPopup      from "../../../../components/popups/confirmationDialog";
import PhoneInput        from "../../../../components/phoneInput";
import { useCompanyProfile, useCurrencies, useCountries } from "../../../../hooks/companySettings";
import { useCurrencyStore }    from "../../../../zustand/useCurrencyStore";
import { useCompanyLogoStore } from "../../../../zustand/useCompanyLogoStore";
import { usePhoneConfigStore } from "../../../../zustand/usePhoneConfigStore";
import { validatePhone } from "../../../../utils/phone";
import { baseUrl } from "../../../../api/index";
import UploadIcon from "../../../../assets/icons/upload.svg";

const INDUSTRY_OPTIONS = [
  { value: "technology",  label: "Technology"  },
  { value: "finance",     label: "Finance"     },
  { value: "healthcare",  label: "Healthcare"  },
  { value: "education",   label: "Education"   },
  { value: "retail",      label: "Retail"      },
  { value: "other",       label: "Other"       },
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

const MAX_PHONES = 20;

const INITIAL_FORM = {
  companyName:    "",
  industry:       "",
  address:        "",
  website:        "",
  currency:       "USD",
  phoneCountries: [],
  phones:         [],
  logoFile:       null,
  logoPreview:    "",
  bannerFile:     null,
  bannerPreview:  "",
};

const resolveLogoUrl = (logoUrl) => logoUrl || "";

const CompanyProfileTab = () => {
  const fileInputRef   = useRef(null);
  const bannerInputRef = useRef(null);
  const { profile, loading, actionLoading, error, saveProfile } = useCompanyProfile();
  const setCompanyLogo = useCompanyLogoStore((state) => state.setLogoUrl);
  const { currencies, loading: currenciesLoading } = useCurrencies();
  const { countries,  loading: countriesLoading }  = useCountries();
  const setGlobalCurrency = useCurrencyStore((state) => state.setCurrency);
  const setPhoneConfig    = usePhoneConfigStore((state) => state.setPhoneConfig);

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoError,   setLogoError]   = useState("");
  const [bannerError, setBannerError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Populate form once the profile loads from the backend
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName:    profile.companyName    || "",
        industry:       profile.industry       || "",
        address:        profile.address        || "",
        website:        profile.website        || "",
        currency:       profile.currency       || "USD",
        phoneCountries: profile.phoneCountries || [],
        phones:         (profile.phones || []).map((p) => ({
          label:          p.label          || "",
          country:        p.country        || "",
          nationalNumber: p.nationalNumber || "",
          isPrimary:      !!p.isPrimary,
        })),
        logoFile:       null,
        logoPreview:    resolveLogoUrl(profile.logoUrl),
        bannerFile:     null,
        bannerPreview:  resolveLogoUrl(profile.bannerUrl),
      });
    }
  }, [profile]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Phone formats — the actual setting. Numbers are optional. ───────────
  // Countries selectable for a saved number = the formats chosen above.
  const selectedFormatCountries = countries.filter((c) =>
    formData.phoneCountries.includes(c.code)
  );

  // Filtered list for the format picker. Selected countries always stay
  // rendered — MUI needs a MenuItem for every value or it warns about
  // out-of-range values and the chips vanish while searching.
  const filteredCountries = (() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        formData.phoneCountries.includes(c.code) ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/\D/g, ""))
    );
  })();

const handleFormatsChange = (e) => {
    const next = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phoneCountries: next,
      // Clear the country on any number row whose format was just removed
      phones: prev.phones.map((p) =>
        next.includes(p.country) ? p : { ...p, country: "" }
      ),
    }));
    if (errors.phoneCountries) {
      setErrors((prev) => ({ ...prev, phoneCountries: "" }));
    }
  };

  // ── Phone row handlers ──────────────────────────────────────────────────
  const addPhone = () =>
    setFormData((prev) => {
      if (prev.phones.length >= MAX_PHONES) return prev;
      return {
        ...prev,
        phones: [
          ...prev.phones,
          {
            label:          "",
            country:        prev.phones[prev.phones.length - 1]?.country
                            || prev.phoneCountries[0]
                            || "",
            nationalNumber: "",
            isPrimary:      prev.phones.length === 0,
          },
        ],
      };
    });

  const updatePhone = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
    if (errors.phones?.[index]) {
      setErrors((prev) => {
        const next = { ...(prev.phones || {}) };
        delete next[index];
        return { ...prev, phones: Object.keys(next).length ? next : undefined };
      });
    }
  };

  const removePhone = (index) =>
    setFormData((prev) => {
      const next = prev.phones.filter((_, i) => i !== index);
      if (next.length && !next.some((p) => p.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return { ...prev, phones: next };
    });

  const setPrimaryPhone = (index) =>
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((p, i) => ({ ...p, isPrimary: i === index })),
    }));

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

    if (!formData.currency) {
      e.currency = "Please select a currency.";
    }

    // ── Phone formats: required, since employee phone validation reads
    // its rules from here. ───────────────────────────────────────────────
    if (!formData.phoneCountries.length) {
      e.phoneCountries = "Select at least one phone number format.";
    }

    // ── Numbers are OPTIONAL — but any row present must be complete ──────
    const phoneErrors = {};
    const seen = new Map();

    formData.phones.forEach((p, i) => {
      if (!p.country) {
        phoneErrors[i] = "Select a format for this number.";
        return;
      }
      const country = countries.find((c) => c.code === p.country);
      const result  = validatePhone(country, p.nationalNumber);

      if (!result.valid) {
        phoneErrors[i] = result.message;
        return;
      }
      if (seen.has(result.e164)) {
        phoneErrors[i] = "This number has already been added.";
        return;
      }
      seen.set(result.e164, i);
    });

    if (Object.keys(phoneErrors).length) e.phones = phoneErrors;

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
      if (result.profile?.logoUrl) {
        setCompanyLogo(resolveLogoUrl(result.profile.logoUrl));
      }

      // Broadcast the saved currency so every amount re-renders live
      if (result.profile?.currency) {
        const selected = currencies.find((c) => c.code === result.profile.currency);
        if (selected) setGlobalCurrency(selected);
      }

      // Broadcast the allowed phone formats so employee forms pick them up
      // without a page refresh.
      const formats = result.profile?.phoneCountries || [];
      setPhoneConfig({
        countries,
        allowedCountries: formats.length ? formats : countries.map((c) => c.code),
        defaultCountry:   formats[0] || countries[0]?.code || "PK",
      });

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
          field columns below. ──────────────────────────────────────────── */}
      <Grid container spacing={2} mb={1}>

        {/* Logo upload — left column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={formData.logoPreview}
              sx={{ width: 72, height: 72, fontSize: "24px", fontWeight: 700 }}
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

          {/* Currency */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Currency *" />
            <CustomSelect
              value={currencies.length ? formData.currency : ""}
              onChange={handleChange("currency")}
              fullWidth
              height="45px"
              inputBgColor="#F5F5F5"
              disabled={currenciesLoading}
            >
              <MenuItem value="">
                {currenciesLoading ? "Loading currencies..." : "Select Currency"}
              </MenuItem>
              {currencies.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </MenuItem>
              ))}
            </CustomSelect>
            {errors.currency && (
              <Typography fontSize="12px" color="error" mt={0.5}>{errors.currency}</Typography>
            )}
            <Typography fontSize="11px" color="text.secondary" mt={0.5}>
              Applied to all amounts across the system — reports, payroll, invoices and emails.
            </Typography>
          </Grid>

          {/* ── Phone Number Format — the actual setting ───────────────── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInputLabel label="Phone Number Format *" />
            <CustomSelect
              multiple
              value={formData.phoneCountries}
              onChange={handleFormatsChange}
              fullWidth
              height="45px"
              inputBgColor="#F5F5F5"
              disabled={countriesLoading}
              displayEmpty
              onClose={() => setCountrySearch("")}
              MenuProps={{
                PaperProps: { sx: { maxHeight: 320, borderRadius: "14px", mt: 0.5 } },
                autoFocus: false,
              }}
              renderValue={(selected) => {
                if (!selected?.length) {
                  return (
                    <Typography fontSize={13} color="text.secondary">
                      {countriesLoading ? "Loading countries..." : "Select country format(s)"}
                    </Typography>
                  );
                }
                const picked = countries.filter((c) => selected.includes(c.code));
                return (
                  <Typography fontSize={13} noWrap>
                    {picked.map((c) => `${c.flag} +${c.dial}`).join(", ")}
                  </Typography>
                );
              }}
            >
     
             {/* Search — sticky so it stays put while the list scrolls */}
             {/* Search — sticky so it stays put while the list scrolls */}
              <Box sx={{ px: 1.5, py: 1, position: "sticky", top: 0, bgcolor: "#fff", zIndex: 1 }}
                   onKeyDown={(e) => e.stopPropagation()}
                   onClick={(e) => e.stopPropagation()}>
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="Search country"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: 13, borderRadius: "10px" },
                  }}
                />
              </Box>

              {filteredCountries.length === 0 && (
                <MenuItem disabled>
                  <Typography fontSize={13} color="text.secondary">No match</Typography>
                </MenuItem>
              )}

              {filteredCountries.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  <Typography fontSize={13} noWrap>
                    {c.flag}&nbsp; {c.name}&nbsp;
                    <Typography component="span" fontSize={12} color="text.secondary">
                      +{c.dial}
                    </Typography>
                  </Typography>
                </MenuItem>
              ))}

            
            </CustomSelect>
            {errors.phoneCountries && (
              <Typography fontSize="12px" color="error" mt={0.5}>{errors.phoneCountries}</Typography>
            )}
            <Typography fontSize="11px" color="text.secondary" mt={0.5}>
              Pick one format per country you operate in. These are the formats
              accepted when entering an employee's phone number — numbers are
              validated against each country's real numbering plan and stored
              in international E.164 format.
            </Typography>
          </Grid>

          {/* Spacer so the numbers list starts on its own row */}
          <Grid size={{ xs: 12, md: 6 }} />

          {/* ── Company Phone Numbers (optional) ───────────────────────── */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} mt={1} gap={2}>
              <Box>
                <CustomInputLabel label="Company Phone Numbers (Optional)" />
                <Typography fontSize="11px" color="text.secondary">
                  Only if you want them on record — one per office or branch.
                </Typography>
              </Box>
              <Box
                onClick={() => formData.phoneCountries.length && addPhone()}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  px: 1.5, py: 0.5, borderRadius: "8px",
                  cursor: (!formData.phoneCountries.length || formData.phones.length >= MAX_PHONES)
                    ? "not-allowed" : "pointer",
                  opacity: (!formData.phoneCountries.length || formData.phones.length >= MAX_PHONES)
                    ? 0.5 : 1,
                  border: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 500,
                  whiteSpace: "nowrap", flexShrink: 0,
                  "&:hover": { backgroundColor: "#F9FAFB" },
                }}
              >
                <AddIcon sx={{ fontSize: 15 }} /> Add Number
              </Box>
            </Box>

            {!formData.phoneCountries.length && (
              <Typography fontSize="12px" color="text.secondary" mb={1}>
                Select a phone number format above before adding numbers.
              </Typography>
            )}

            {formData.phones.map((p, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5,
                  flexWrap: { xs: "wrap", lg: "nowrap" },
                }}
              >
                <Box sx={{ width: { xs: "100%", lg: 200 }, flexShrink: 0 }}>
                  <TextInput
                    placeholder="Label (e.g. Head Office)"
                    value={p.label}
                    onChange={(e) => updatePhone(i, { label: e.target.value })}
                    inputBgColor="#F5F5F5"
                    fullWidth
                    inputProps={{ maxLength: 50 }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <PhoneInput
                    value={p}
                    onChange={(val) => updatePhone(i, val)}
                    countries={selectedFormatCountries}
                    disabled={countriesLoading}
                    inputBgColor="#F5F5F5"
                    error={errors.phones?.[i] || ""}
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1} sx={{ height: 45 }}>
                  <Typography
                    fontSize="11px"
                    fontWeight={p.isPrimary ? 600 : 500}
                    onClick={() => setPrimaryPhone(i)}
                    sx={{
                      cursor: "pointer", whiteSpace: "nowrap",
                      px: 1, py: 0.5, borderRadius: "8px",
                      color:           p.isPrimary ? "#AA2493"   : "text.secondary",
                      backgroundColor: p.isPrimary ? "#AA24931A" : "transparent",
                    }}
                  >
                    {p.isPrimary ? "Primary" : "Set primary"}
                  </Typography>
                  <Box
                    onClick={() => removePhone(i)}
                    sx={{
                      cursor: "pointer", display: "flex",
                      color: "#9CA3AF", "&:hover": { color: "#DC2626" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
              </Box>
            ))}
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