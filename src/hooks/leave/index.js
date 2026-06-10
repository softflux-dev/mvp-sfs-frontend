// src/hooks/leave.js
import { useState, useCallback, useEffect, useRef } from "react";
import {
  empGetMyLeavesApi,
  empCreateLeaveApi,
  empCancelLeaveApi,
  hrGetLeavesApi,
  hrReviewLeaveApi,
} from "../../api/modules/leave";

// ── Hook: Employee — own leave requests ───────────────────────────────────────
export const useMyLeaves = () => {
  const [leaves,        setLeaves]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters,       setFilters]       = useState({ status: "", page: 1, limit: 10 });

  const fetchLeaves = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, ...customParams };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await empGetMyLeavesApi(params);
      if (res?.status === 200 || res?.status === 201) {
        setLeaves(Array.isArray(res.data.data.leaves) ? res.data.data.leaves : []);
        if (res.data.data.pagination) setPagination(res.data.data.pagination);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch leaves.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setLoading(false); }
  }, [filters]);

  const createLeave = useCallback(async (payload) => {
    setActionLoading(true);
    try {
      const res = await empCreateLeaveApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        await fetchLeaves();
        return { success: true, message: "Leave request submitted successfully." };
      }
      const msg = res?.data?.message || "Failed to submit leave request.";
      return { success: false, message: msg };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [fetchLeaves]);

  const cancelLeave = useCallback(async (leaveId) => {
    setActionLoading(true);
    try {
      const res = await empCancelLeaveApi(leaveId);
      if (res?.status === 200 || res?.status === 201) {
        await fetchLeaves();
        return { success: true, message: "Leave request cancelled." };
      }
      const msg = res?.data?.message || "Failed to cancel leave request.";
      return { success: false, message: msg };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [fetchLeaves]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  useEffect(() => { fetchLeaves(); }, [filters]);

  return {
    leaves, loading, actionLoading, error, pagination,
    fetchLeaves, createLeave, cancelLeave, handleFilterChange, handlePageChange,
  };
};

// ── Hook: HR — all employee leave requests ────────────────────────────────────
export const useHRLeaves = () => {
  const [leaves,        setLeaves]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters,       setFilters]       = useState({ status: "", search: "", leaveType: "", page: 1, limit: 10 });
 
  // Keep a ref to latest filters so fetchLeaves always uses current values
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
 
  const fetchLeaves = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filtersRef.current, ...customParams };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await hrGetLeavesApi(params);
      if (res?.status === 200 || res?.status === 201) {
        setLeaves(Array.isArray(res.data.data.leaves) ? res.data.data.leaves : []);
        if (res.data.data.pagination) setPagination(res.data.data.pagination);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch leaves.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setLoading(false); }
  }, []); // ← no filters dependency — uses ref instead
 
  const reviewLeave = useCallback(async (leaveId, status, hrNotes = "") => {
    setActionLoading(true);
    try {
      const res = await hrReviewLeaveApi(leaveId, { status, hrNotes });
      if (res?.status === 200 || res?.status === 201) {
        // Optimistically update the leave status in state immediately
        setLeaves((prev) =>
          prev.map((l) =>
            l._id === leaveId ? { ...l, status, hrNotes } : l
          )
        );
        // Also refetch to get fresh data
        await fetchLeaves();
        return { success: true, message: `Leave ${status} successfully.` };
      }
      const msg = res?.data?.message || "Failed to review leave.";
      return { success: false, message: msg };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [fetchLeaves]);
 
  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);
 
  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);
 
  useEffect(() => { fetchLeaves(); }, [filters]);
 
  return {
    leaves, loading, actionLoading, error, pagination,
    fetchLeaves, reviewLeave, handleFilterChange, handlePageChange,
  };
};