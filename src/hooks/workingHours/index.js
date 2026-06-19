// src/hooks/workingHours.js — NEW FILE
import { useState, useEffect, useCallback } from "react";
import { getWorkingHoursApi, updateWorkingHoursApi } from "../../api/modules/workingHours";

export const useWorkingHours = () => {
  const [settings,      setSettings]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWorkingHoursApi();
      if (res?.status === 200 || res?.status === 201) {
        setSettings(res.data.data.settings || null);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to load working hours.";
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

  const saveSettings = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateWorkingHoursApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        setSettings(res.data.data.settings);
        return { success: true, message: res.data.message };
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

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, actionLoading, error, fetchSettings, saveSettings };
};