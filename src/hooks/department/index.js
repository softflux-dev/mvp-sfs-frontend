// src/hooks/department.js — 
import { useState, useCallback, useEffect } from "react";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../../api/modules/department";

const defaultFilters = {
  search:   "",
  isActive: "",
  page:     1,
  limit:    10,
};

export const useDepartment = () => {
  const [departments,  setDepartments]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [actionLoading,setActionLoading]= useState(false); // for create/update/delete
  const [error,        setError]        = useState("");
  const [filters,      setFilters]      = useState(defaultFilters);
  const [pagination,   setPagination]   = useState({
    total:      0,
    totalPages: 0,
    page:       1,
    limit:      10,
  });

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:     customParams.page     ?? filters.page,
        limit:    customParams.limit    ?? filters.limit,
        search:   customParams.search   ?? filters.search,
        isActive: customParams.isActive ?? filters.isActive,
      };

      // strip empty values
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getDepartmentsApi(params);

      if (response?.status === 200 || response?.status === 201) {
        const { departments: data, pagination: pg } = response.data.data;
        setDepartments(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch departments.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createDepartment = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createDepartmentApi(payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchDepartments();
        return { success: true, message: "Department created successfully." };
      } else {
        const msg = response?.data?.message || "Failed to create department.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDepartments]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateDepartment = useCallback(async (id, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateDepartmentApi(id, payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchDepartments();
        return { success: true, message: "Department updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update department.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDepartments]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteDepartment = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteDepartmentApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchDepartments();
        return { success: true, message: "Department deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete department.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDepartments]);

  // ── Pagination handlers ────────────────────────────────────────────────────
  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page:  1,
    }));
  }, []);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  // ── Auto-fetch on filter/page change ──────────────────────────────────────
  useEffect(() => {
    fetchDepartments();
  }, [filters]);

  return {
    // state
    departments,
    loading,
    actionLoading,
    error,
    pagination,
    filters,

    // actions
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // pagination
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  };
};