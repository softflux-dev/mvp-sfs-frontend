// src/components/phoneInput/index.jsx
// Reusable E.164 phone field: country picker + national number input.
// Stores digits only; displays them grouped via libphonenumber's AsYouType.
import { useMemo, useState } from "react";
import { Box, MenuItem, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CustomSelect, TextInput } from "../index";
import { validatePhone, formatAsYouType } from "../../utils/phone";



const SEARCH_THRESHOLD = 8;

// value: { country, nationalNumber }
const PhoneInput = ({
  value = {},
  onChange,
  countries    = [],
  error        = "",
  disabled     = false,
  inputBgColor = "#fff",
  placeholder  = "",
  showHint     = true,
  countryWidth = 150,
}) => {
  const [search, setSearch] = useState("");

  const country = useMemo(
    () => countries.find((c) => c.code === value.country) || null,
    [countries, value.country]
  );
  const showSearch = countries.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!showSearch || !q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/\D/g, ""))
    );
  }, [countries, search, showSearch]);

  const handleCountry = (e) => {
    onChange?.({ ...value, country: e.target.value });
    setSearch("");
  };

  const handleNumber = (e) => {
    // Strip everything except digits — the displayed value is formatted,
    // but what we store and validate is always the raw digit string.
    const digits = e.target.value.replace(/\D/g, "");
    onChange?.({ ...value, nationalNumber: digits });
  };

  const display = formatAsYouType(value.nationalNumber, value.country);
  const result  = country && value.nationalNumber
    ? validatePhone(country, value.nationalNumber)
    : null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box sx={{ width: countryWidth, flexShrink: 0 }}>
          <CustomSelect
            value={value.country || ""}
            onChange={handleCountry}
            fullWidth
            height="45px"
            inputBgColor={inputBgColor}
            disabled={disabled}
            displayEmpty
            MenuProps={{
              PaperProps: { sx: { maxHeight: 320, borderRadius: "14px", mt: 0.5 } },
              autoFocus: false,
            }}
            renderValue={(v) => {
              const c = countries.find((x) => x.code === v);
              return c ? (
                <Typography fontSize={13} noWrap>{c.flag} +{c.dial}</Typography>
              ) : (
                <Typography fontSize={13} color="text.secondary">Country</Typography>
              );
            }}
          >
            {/* Search — only when the list is long enough to need it */}
            {showSearch && (
              <Box sx={{ px: 1.5, py: 1, position: "sticky", top: 0, bgcolor: "#fff", zIndex: 1 }}
                   onKeyDown={(e) => e.stopPropagation()}
                   onClick={(e) => e.stopPropagation()}>
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="Search country"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
            )}

            {filtered.length === 0 && (
              <MenuItem disabled>
                <Typography fontSize={13} color="text.secondary">No match</Typography>
              </MenuItem>
            )}

            {filtered.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                <Typography fontSize={13} noWrap>
                  {c.flag}&nbsp; {c.name} &nbsp;
                  <Typography component="span" fontSize={12} color="text.secondary">
                    +{c.dial}
                  </Typography>
                </Typography>
              </MenuItem>
            ))}
          </CustomSelect>
        </Box>

        <TextInput
          placeholder={placeholder || country?.example || "Phone number"}
          value={display}
          onChange={handleNumber}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (/[^\d\s()+\-.]/.test(pasted)) e.preventDefault();
          }}
          inputBgColor={inputBgColor}
          fullWidth
          disabled={disabled || !value.country}
          error={!!error}
          inputProps={{ maxLength: 24, inputMode: "tel" }}
        />
      </Box>

      {error ? (
        <Typography fontSize="12px" color="error" mt={0.5}>{error}</Typography>
      ) : showHint && result?.valid ? (
        <Typography fontSize="11px" color="#04C373" mt={0.5}>
          ✓ Saved as {result.e164}
        </Typography>
      ) : showHint && country ? (
        <Typography fontSize="11px" color="text.secondary" mt={0.5}>
          {country.example ? `Format: ${country.example}` : `Enter a ${country.name} number`}
        </Typography>
      ) : null}
    </Box>
  );
};

export default PhoneInput;