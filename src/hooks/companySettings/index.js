// src/hooks/companySettings.js
import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import {
  getCompanyProfileApi,
  updateCompanyProfileApi,
  getCurrenciesApi,
  getActiveCurrencyApi,
  getCountriesApi,
  getPhoneConfigApi,
} from "../../api/modules/companySettings";
import { useCurrencyStore }    from "../../zustand/useCurrencyStore";
import { usePhoneConfigStore } from "../../zustand/usePhoneConfigStore";
import useUserStore            from "../../zustand/useUserStore";

// ── Supported currency list for the settings select ───────────────────────
export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getCurrenciesApi();
        if (alive && (res?.status === 200 || res?.status === 201)) {
          setCurrencies(res.data.data.currencies || []);
        }
      } catch {
        if (alive) setCurrencies([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { currencies, loading };
};

// ── Full country list for the settings phone picker ───────────────────────
export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getCountriesApi();
        if (alive && (res?.status === 200 || res?.status === 201)) {
          setCountries(res.data.data.countries || []);
        }
      } catch {
        if (alive) setCountries([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { countries, loading };
};

// ── Call once inside ProtectedLayout — active currency for every screen ───
export const useCurrencyBootstrap = () => {
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const userId      = useUserStore((s) => s.user?._id);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const res = await getActiveCurrencyApi();
        if (alive && (res?.status === 200 || res?.status === 201)) {
          setCurrency(res.data.data.currency);
        }
      } catch { /* keep cached / fallback */ }
    })();
    return () => { alive = false; };
  }, [userId, setCurrency]);
};

// ── Call once inside ProtectedLayout — phone rules for every screen ───────
export const usePhoneConfigBootstrap = () => {
  const setPhoneConfig = usePhoneConfigStore((s) => s.setPhoneConfig);
  const userId         = useUserStore((s) => s.user?._id);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const res = await getPhoneConfigApi();
        if (alive && (res?.status === 200 || res?.status === 201)) {
          setPhoneConfig(res.data.data);
        }
      } catch { /* keep cached / fallback */ }
    })();
    return () => { alive = false; };
  }, [userId, setPhoneConfig]);
};

// ── Company profile ───────────────────────────────────────────────────────
export const useCompanyProfile = () => {
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCompanyProfileApi();
      if (res?.status === 200 || res?.status === 201) {
        setProfile(res.data.data.profile || null);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to load company profile.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // formData: { companyName, industry, address, website, currency, phones[], logoFile?, bannerFile? }
  const saveProfile = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      let logoUrl, bannerUrl;

      if (formData.logoFile) {
        const uploaded = await uploadToCloudinary(formData.logoFile, "company");
        logoUrl = uploaded.url;
      }

      if (formData.bannerFile) {
        const uploaded = await uploadToCloudinary(formData.bannerFile, "company/banner");
        bannerUrl = uploaded.url;
      }

      const payload = {
        companyName: formData.companyName || "",
        industry:    formData.industry    || "",
        address:     formData.address     || "",
        website:     formData.website     || "",
       currency:       formData.currency || "USD",
       otMultiplier: formData.otMultiplier ?? 1,
        phoneCountries: formData.phoneCountries || [],
        phones:         (formData.phones || []).map((p) => ({
          label:          p.label || "",
          country:        p.country,
          nationalNumber: p.nationalNumber,
          isPrimary:      !!p.isPrimary,
        })),
      };
      if (logoUrl)   payload.logoUrl   = logoUrl;
      if (bannerUrl) payload.bannerUrl = bannerUrl;

      const res = await updateCompanyProfileApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        const savedProfile = res.data.data.profile;
        setProfile(savedProfile);
        return { success: true, message: res.data.message, profile: savedProfile };
      }
      const msg = res?.data?.message || "Failed to save changes.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, actionLoading, error, fetchProfile, saveProfile };
};