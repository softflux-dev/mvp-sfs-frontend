// src/hooks/bonusIncrement.js — NEW FILE
import { useState, useCallback, useEffect } from "react";
import {
  addBonusApi,
  getBonusesApi,
  updateBonusApi,
  deleteBonusApi,
  addIncrementApi,
  getIncrementsApi,
  deleteIncrementApi,
} from "../../api/modules/bonusIncrement";

// ── useBonus ──────────────────────────────────────────────────────────────────
export const useBonus = () => {
  const [bonuses,       setBonuses]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [pagination,    setPagination]    = useState({ total: 0, totalPages: 0, page: 1, limit: 50 });
  const [filters,       setFilters]       = useState({ month: "", year: "", page: 1, limit: 50 });

  const fetchBonuses = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:  customParams.page  ?? filters.page,
        limit: customParams.limit ?? filters.limit,
        month: customParams.month ?? filters.month,
        year:  customParams.year  ?? filters.year,
      };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getBonusesApi(params);
      if (response?.status === 200 || response?.status === 201) {
        const { bonuses: data, pagination: pg } = response.data.data;
        setBonuses(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      }
      const msg = response?.data?.message || "Failed to fetch bonuses.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addBonus = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await addBonusApi(payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchBonuses();
        return { success: true, message: "Bonus added successfully." };
      }
      const msg = response?.data?.message || "Failed to add bonus.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBonuses]);

  const updateBonus = useCallback(async (id, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateBonusApi(id, payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchBonuses();
        return { success: true, message: "Bonus updated successfully." };
      }
      const msg = response?.data?.message || "Failed to update bonus.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBonuses]);

  const deleteBonus = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteBonusApi(id);
      if (response?.status === 200 || response?.status === 201) {
        await fetchBonuses();
        return { success: true, message: "Bonus deleted successfully." };
      }
      const msg = response?.data?.message || "Failed to delete bonus.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBonuses]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  useEffect(() => { fetchBonuses(); }, [filters]);

  return {
    bonuses, loading, actionLoading, error, pagination, filters,
    fetchBonuses, addBonus, updateBonus, deleteBonus,
    handleFilterChange, handlePageChange,
  };
};

// ── useIncrement ──────────────────────────────────────────────────────────────
export const useIncrement = () => {
  const [increments,    setIncrements]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [pagination,    setPagination]    = useState({ total: 0, totalPages: 0, page: 1, limit: 50 });
  const [filters,       setFilters]       = useState({ page: 1, limit: 50 });

  const fetchIncrements = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:  customParams.page  ?? filters.page,
        limit: customParams.limit ?? filters.limit,
      };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getIncrementsApi(params);
      if (response?.status === 200 || response?.status === 201) {
        const { increments: data, pagination: pg } = response.data.data;
        setIncrements(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      }
      const msg = response?.data?.message || "Failed to fetch increments.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addIncrement = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await addIncrementApi(payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchIncrements();
        return { success: true, message: "Increment applied successfully." };
      }
      const msg = response?.data?.message || "Failed to apply increment.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchIncrements]);

  const deleteIncrement = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteIncrementApi(id);
      if (response?.status === 200 || response?.status === 201) {
        await fetchIncrements();
        return { success: true, message: "Increment record deleted successfully." };
      }
      const msg = response?.data?.message || "Failed to delete increment.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchIncrements]);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  useEffect(() => { fetchIncrements(); }, [filters]);

  return {
    increments, loading, actionLoading, error, pagination,
    fetchIncrements, addIncrement, deleteIncrement, handlePageChange,
  };
};