// src/hooks/companySettings.js — 
import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
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

  // formData: { companyName, industry, address, website, logoFile?, bannerFile? }
  const saveProfile = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      let logoUrl, bannerUrl;

      if (formData.logoFile) {
        const uploaded = await uploadToCloudinary(formData.logoFile, "company");
        logoUrl = uploaded.url;
      }

      // ── banner upload — same Cloudinary flow, separate folder so
      // logo and banner assets don't mix in the media library. ────────────
      if (formData.bannerFile) {
        const uploaded = await uploadToCloudinary(formData.bannerFile, "company/banner");
        bannerUrl = uploaded.url;
      }

      const payload = {
        companyName: formData.companyName || "",
        industry:    formData.industry    || "",
        address:     formData.address     || "",
        website:     formData.website     || "",
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