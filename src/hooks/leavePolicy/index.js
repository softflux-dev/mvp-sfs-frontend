// src/hooks/leavePolicy.js — NEW FILE
import { useState, useEffect, useCallback } from "react";
import { getLeavePolicyApi, updateLeavePolicyApi } from "../../api/modules/leavePolicy";

export const useLeavePolicy = () => {
  const [policy,        setPolicy]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLeavePolicyApi();
      if (res?.status === 200 || res?.status === 201) {
        setPolicy(res.data.data.policy || null);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to load leave policy.";
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

  const savePolicy = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateLeavePolicyApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        setPolicy(res.data.data.policy);
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

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  return { policy, loading, actionLoading, error, fetchPolicy, savePolicy };
};