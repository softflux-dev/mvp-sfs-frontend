// src/hooks/securitySettings.js — NEW FILE
import { useState, useEffect, useCallback } from "react";
import {
  getSecuritySettingsApi,
  updateSecuritySettingsApi,
  changeAdminPasswordApi,
} from "../../api/modules/securitySettings";

// ── For the Settings > Security tab (Admin managing the system-wide value) ──
export const useSecuritySettings = () => {
  const [settings,      setSettings]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSecuritySettingsApi();
      if (res?.status === 200 || res?.status === 201) {
        setSettings(res.data.data.settings || null);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to load security settings.";
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
      const res = await updateSecuritySettingsApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        setSettings(res.data.data.settings);
        // Keep the locally-cached timeout (used by useSessionTimeout) in
        // sync immediately, without waiting for the next page load.
        localStorage.setItem("sessionTimeout", res.data.data.settings.sessionTimeout);
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

  const changePassword = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await changeAdminPasswordApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, message: res.data.message };
      }
      const msg = res?.data?.message || "Failed to update password.";
      return { success: false, message: msg };
    } catch {
      return { success: false, message: "Something went wrong." };
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, actionLoading, error, fetchSettings, saveSettings, changePassword };
};