// src/utils/phone.js — mirrors constants/countries.js on the server so the
// UI validates identically before submitting.
import {
  parsePhoneNumberFromString,
  AsYouType,
} from "libphonenumber-js";

// → { valid, e164, national, formatted, message }
export const validatePhone = (country, rawNumber) => {
  if (!country) return { valid: false, message: "Please select a country." };

  const raw = String(rawNumber || "").trim();
  if (!raw) return { valid: false, message: "Phone number is required." };

  let parsed;
  try {
    parsed = parsePhoneNumberFromString(raw, country.code);
  } catch {
    parsed = null;
  }

  if (!parsed || !parsed.isValid()) {
    const hint = country.example ? ` (e.g. ${country.example})` : "";
    return { valid: false, message: `Not a valid ${country.name} number${hint}.` };
  }

  if (parsed.country && parsed.country !== country.code) {
    return { valid: false, message: `That number doesn't belong to ${country.name}.` };
  }

  return {
    valid:     true,
    e164:      parsed.number,
    national:  parsed.nationalNumber,
    formatted: parsed.formatInternational(),
    message:   "",
  };
};

// Pretty-print a stored E.164 value: "+92 300 1234567"
export const formatE164 = (e164) => {
  try {
    const parsed = parsePhoneNumberFromString(String(e164 || ""));
    return parsed ? parsed.formatInternational() : "";
  } catch {
    return "";
  }
};

// "+923001234567" → { country: "PK", nationalNumber: "3001234567" }
export const parseE164 = (e164) => {
  try {
    const parsed = parsePhoneNumberFromString(String(e164 || ""));
    if (!parsed) return null;
    return { country: parsed.country || null, nationalNumber: parsed.nationalNumber };
  } catch {
    return null;
  }
};

// Live "as you type" grouping for the input field
export const formatAsYouType = (digits, countryCode) => {
  if (!digits) return "";
  if (!countryCode) return digits;
  try {
    return new AsYouType(countryCode).input(digits);
  } catch {
    return digits;
  }
};