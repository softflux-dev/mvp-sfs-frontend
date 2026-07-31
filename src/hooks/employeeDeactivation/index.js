// src/hooks/employeeDeactivation.js — (Employee Deactivation/Reactivation feature)
import { useState, useCallback } from "react";
import {
  getDeactivationImpactApi,
  getReassignmentCandidatesApi,
  reassignAndDeactivateApi,
  reactivateEmployeeApi,
} from "../../api/modules/employee";

export const useEmployeeDeactivation = () => {
  const [impact,        setImpact]        = useState(null); // { employee, items, summary }
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError,   setImpactError]   = useState("");

  const [candidatesByItem, setCandidatesByItem] = useState({}); // itemKey -> candidates[]
  const [candidatesLoading, setCandidatesLoading] = useState({});

  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchImpact = useCallback(async (employeeId) => {
    setImpactLoading(true);
    setImpactError("");
    try {
      const res = await getDeactivationImpactApi(employeeId);
      if (res?.status === 200 || res?.status === 201) {
        setImpact(res.data.data);
        return { success: true, data: res.data.data };
      }
      const msg = res?.data?.message || "Failed to load impact.";
      setImpactError(msg);
      return { success: false, message: msg };
    } catch {
      setImpactError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setImpactLoading(false);
    }
  }, []);

  // itemKey: `${itemType}:${itemId}` — lets each row manage its own candidate list.
  const fetchCandidates = useCallback(async (itemKey, { roleId, departmentId, excludeId, includeOtherRoles = false }) => {
    setCandidatesLoading((prev) => ({ ...prev, [itemKey]: true }));
    try {
      const params = { excludeId };
      if (!includeOtherRoles && roleId) params.roleId = roleId;
      if (departmentId) params.departmentId = departmentId;
      const res = await getReassignmentCandidatesApi(params);
      if (res?.status === 200 || res?.status === 201) {
        setCandidatesByItem((prev) => ({ ...prev, [itemKey]: res.data.data.candidates || [] }));
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    } finally {
      setCandidatesLoading((prev) => ({ ...prev, [itemKey]: false }));
    }
  }, []);

  const confirmDeactivation = useCallback(async (employeeId, reassignments, reason) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await reassignAndDeactivateApi(employeeId, { reassignments, reason });
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, message: res.data.message, data: res.data.data };
      }
      const msg = res?.data?.message || "Failed to deactivate.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const reactivate = useCallback(async (employeeId, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await reactivateEmployeeApi(employeeId, payload);
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, message: res.data.message, data: res.data.data };
      }
      const msg = res?.data?.message || "Failed to reactivate.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const resetImpact = useCallback(() => {
    setImpact(null); setImpactError(""); setCandidatesByItem({}); setError("");
  }, []);

  return {
    impact, impactLoading, impactError, fetchImpact,
    candidatesByItem, candidatesLoading, fetchCandidates,
    actionLoading, error, confirmDeactivation, reactivate, resetImpact,
  };
};