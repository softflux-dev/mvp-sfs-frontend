import { useState, useCallback, useEffect } from "react";
import {
  getRolesApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "../../api/modules/role";

const defaultFilters = {
  search: "",
  page:   1,
  limit:  10,
};

export const useRole = () => {
  const [roles,         setRoles]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [filters,       setFilters]       = useState(defaultFilters);
  const [pagination,    setPagination]    = useState({
    total:      0,
    totalPages: 0,
    page:       1,
    limit:      10,
  });

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:   customParams.page   ?? filters.page,
        limit:  customParams.limit  ?? filters.limit,
        search: customParams.search ?? filters.search,
      };

      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getRolesApi(params);

      if (response?.status === 200 || response?.status === 201) {
        const { roles: data, pagination: pg } = response.data.data;
        setRoles(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch roles.";
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
  const createRole = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createRoleApi(payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchRoles();
        return { success: true, message: "Role created successfully." };
      } else {
        const msg = response?.data?.message || "Failed to create role.";
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
  }, [fetchRoles]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateRole = useCallback(async (id, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateRoleApi(id, payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchRoles();
        return { success: true, message: "Role updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update role.";
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
  }, [fetchRoles]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteRole = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteRoleApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchRoles();
        return { success: true, message: "Role deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete role.";
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
  }, [fetchRoles]);

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

  // ── Auto-fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRoles();
  }, [filters]);

  return {
    roles,
    loading,
    actionLoading,
    error,
    pagination,
    filters,

    fetchRoles,
    createRole,
    updateRole,
    deleteRole,

    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  };
};