// src/hooks/leave.js — Phases 2/3 (Leave Management Enhancement)
// useHRLeaves.reviewLeave signature changed: (leaveId, payload) where payload
// is { decision, customFrom, customTo, leaveTypeOverride, hrNotes } — matches
// the new controllers/hr/leave.js reviewLeave body shape.

import { useState, useCallback, useEffect, useRef } from "react";
import {
  empGetMyLeavesApi,
  empCreateLeaveApi,
  empCancelLeaveApi,
  empGetMyLeaveBalanceApi,
  hrGetLeavesApi,
  hrReviewLeaveApi,
  hrGetAllBalancesApi,
} from "../../api/modules/leave";

// ── Hook: Employee — own leave balance ────────────────────────────────────────
export const useMyLeaveBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await empGetMyLeaveBalanceApi();
      if (res?.status === 200 || res?.status === 201) {
        setBalance(res.data.data);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch leave balance.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return { balance, loading, error, fetchBalance };
};

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
  const [filters, setFilters] = useState({ status: "", search: "", leaveType: "", dateFilter: "", dateFrom: "", dateTo: "", page: 1, limit: 10 });
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
  }, []);

  // ── reviewLeave — NEW signature: (leaveId, payload) ─────────────────────
  // payload: { decision: "approve_all"|"approve_custom"|"reject_all",
  //            customFrom?, customTo?, leaveTypeOverride, hrNotes }
  const reviewLeave = useCallback(async (leaveId, payload) => {
    setActionLoading(true);
    try {
      const res = await hrReviewLeaveApi(leaveId, payload);
      if (res?.status === 200 || res?.status === 201) {
        await fetchLeaves();
        const label = payload.decision === "reject_all" ? "rejected" : "approved";
        return { success: true, message: `Leave ${label} successfully.`, leave: res.data.data.leave };
      }
      const msg = res?.data?.message || "Failed to review leave.";
      return { success: false, message: msg };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Something went wrong." };
    } finally {
      setActionLoading(false);
    }
  }, [fetchLeaves]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
  }, []);

  useEffect(() => { fetchLeaves(); }, [filters]);

  return {
    leaves, loading, actionLoading, error, pagination,
    fetchLeaves, reviewLeave, handleFilterChange, handlePageChange, handleRowsPerPageChange,
  };
};

// ── Hook: HR — company-wide leave balance grid (Phase 5) ─────────────────────
export const useHRLeaveBalances = () => {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters,    setFilters]    = useState({ search: "", department: "", role: "", page: 1, limit: 20 });
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const fetchBalances = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filtersRef.current, ...customParams };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await hrGetAllBalancesApi(params);
      if (res?.status === 200 || res?.status === 201) {
        setRows(Array.isArray(res.data.data.rows) ? res.data.data.rows : []);
        setYear(res.data.data.year);
        if (res.data.data.pagination) setPagination(res.data.data.pagination);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch leave balances.";
      setError(msg); return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
  }, []);

  useEffect(() => { fetchBalances(); }, [filters]);

  return {
    rows, loading, error, year, pagination,
    fetchBalances, handleFilterChange, handlePageChange, handleRowsPerPageChange,
  };
};