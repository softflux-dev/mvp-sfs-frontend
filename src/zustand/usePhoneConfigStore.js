import { create } from "zustand";

const STORAGE_KEY = "app_phone_config";

const FALLBACK = { countries: [], allowedCountries: [], defaultCountry: "PK" };

// Hydrate from localStorage so phone inputs render instantly on reload
const readCached = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...FALLBACK, ...JSON.parse(raw) } : FALLBACK;
  } catch {
    return FALLBACK;
  }
};

const cached = readCached();

export const usePhoneConfigStore = create((set) => ({
  countries:        cached.countries,
  allowedCountries: cached.allowedCountries,
  defaultCountry:   cached.defaultCountry,
  loaded:           cached.countries.length > 0,

  setPhoneConfig: (cfg) => {
    const next = {
      countries:        cfg?.countries        || [],
      allowedCountries: cfg?.allowedCountries || [],
      defaultCountry:   cfg?.defaultCountry   || "PK",
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    set({ ...next, loaded: true });
  },
}));