// src/hooks/companySettings.js — FULL REPLACEMENT
import { useState, useEffect, useCallback } from "react";
import { getCompanyProfileApi, updateCompanyProfileApi } from "../../api/modules/companySettings";

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

  // formData: { companyName, industry, address, website, logoFile? }
  const saveProfile = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("companyName", formData.companyName || "");
      payload.append("industry",    formData.industry    || "");
      payload.append("address",     formData.address     || "");
      payload.append("website",     formData.website      || "");
      if (formData.logoFile) {
        payload.append("logo", formData.logoFile);
      }

      const res = await updateCompanyProfileApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        const savedProfile = res.data.data.profile;
        setProfile(savedProfile);
        // Include the saved profile in the result so callers (e.g. the
        // topbar logo broadcast) can read the fresh logoUrl immediately.
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