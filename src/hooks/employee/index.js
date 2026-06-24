import { useState, useCallback, useEffect } from "react";
import {
  getEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  toggleEmployeeStatusApi,
} from "../../api/modules/employee";

const defaultFilters = {
  search:     "",
  department: "",
  role:       "",
  status:     "",
  type:       "",
  page:       1,
  limit:      10,
};

export const useEmployee = () => {
  const [employees,     setEmployees]     = useState([]);
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
  const fetchEmployees = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:       customParams.page       ?? filters.page,
        limit:      customParams.limit      ?? filters.limit,
        search:     customParams.search     ?? filters.search,
        department: customParams.department ?? filters.department,
        role:       customParams.role       ?? filters.role,
        status:     customParams.status     ?? filters.status,
        type:       customParams.type       ?? filters.type,
      };

      // strip empty values
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getEmployeesApi(params);

      if (response?.status === 200 || response?.status === 201) {
        const { employees: data, pagination: pg } = response.data.data;
        setEmployees(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch employees.";
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
  const createEmployee = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      // build FormData for multipart (avatar support)
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
  if (key === "avatarFile" && value) {
    payload.append("avatar", value);
  } else if (key === "salaryBreakdown" && value != null) {
    // Objects must be JSON-stringified before appending to FormData
    payload.append(key, JSON.stringify(value));
  } else if (key !== "avatarPreview" && key !== "avatarFile" && value != null) {
    payload.append(key, value);
  }
});

      const response = await createEmployeeApi(payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchEmployees();
        return {
          success: true,
          message: response.data.message,    
          data:    response.data.data,
        };
      } else {
        const msg = response?.data?.message || "Failed to create employee.";
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
  }, [fetchEmployees]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateEmployee = useCallback(async (id, formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
     Object.entries(formData).forEach(([key, value]) => {
  if (key === "avatarFile" && value) {
    payload.append("avatar", value);
  } else if (key === "salaryBreakdown" && value != null) {
    // Objects must be JSON-stringified before appending to FormData
    payload.append(key, JSON.stringify(value));
  } else if (key !== "avatarPreview" && key !== "avatarFile" && value != null) {
    payload.append(key, value);
  }
});

      const response = await updateEmployeeApi(id, payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchEmployees();
        return { success: true, message: "Employee updated successfully.", data: response.data.data };
      } else {
        const msg = response?.data?.message || "Failed to update employee.";
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
  }, [fetchEmployees]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteEmployee = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteEmployeeApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchEmployees();
        return { success: true, message: "Employee deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete employee.";
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
  }, [fetchEmployees]);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleEmployeeStatus = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await toggleEmployeeStatusApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchEmployees();
        return {
          success: true,
          message: response.data?.message || "Status updated.",
        };
      } else {
        const msg = response?.data?.message || "Failed to update status.";
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
  }, [fetchEmployees]);

  // ── Pagination ─────────────────────────────────────────────────────────────
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
    fetchEmployees();
  }, [filters]);

  return {
    employees,
    loading,
    actionLoading,
    error,
    pagination,
    filters,

    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,

    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  };
};