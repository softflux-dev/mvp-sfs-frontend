import { useState, useEffect, useCallback } from "react";
import { getProfileApi, updateProfileApi, changePasswordApi } from "../../api/modules/profile";

export const useProfile = () => {
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProfileApi();
      if (res?.status === 200 || res?.status === 201) {
        setProfile(res.data.data.employee);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch profile.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateProfileApi(formData);
      if (res?.status === 200 || res?.status === 201) {
        setProfile(res.data.data.employee);
        return { success: true, message: "Profile updated successfully." };
      }
      const msg = res?.data?.message || "Failed to update profile.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await changePasswordApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, message: "Password changed successfully." };
      }
      const msg = res?.data?.message || "Failed to change password.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  return {
    profile,
    loading,
    actionLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  };
};