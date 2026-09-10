import { useState, useCallback, useEffect } from "react";
import {
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from "../../api/modules/notificationPreferences";

const NOTIFICATION_KEYS = [
  "newTaskAssignment",
  "leaveRequestSubmitted",
  "leaveApprovedRejected",
  "taskStatusUpdate",
  "projectTeamUpdated",     
  "newMessageReceived",
];

// Build a clean default state matching the keys
const buildDefault = () =>
  NOTIFICATION_KEYS.reduce((acc, key) => {
    acc[key] = { email: false, inApp: false };
    return acc;
  }, {});

export const useNotificationPreferences = () => {
  const [prefs,         setPrefs]         = useState(buildDefault());
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotificationPreferencesApi();
      if (res?.status === 200 || res?.status === 201) {
        const data = res.data.data.preferences;
        // Merge API data over defaults so all keys always exist
        setPrefs((prev) => ({
          ...prev,
          ...NOTIFICATION_KEYS.reduce((acc, key) => {
            if (data[key]) acc[key] = { email: !!data[key].email, inApp: !!data[key].inApp };
            return acc;
          }, {}),
        }));
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch preferences.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const savePrefs = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateNotificationPreferencesApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, message: "Notification preferences saved successfully." };
      }
      const msg = res?.data?.message || "Failed to save preferences.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrefs(); }, []);

  return { prefs, setPrefs, loading, actionLoading, error, fetchPrefs, savePrefs };
};