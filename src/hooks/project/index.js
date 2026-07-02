import { useState, useCallback, useEffect } from "react";
import {
  getProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from "../../api/modules/project";

const defaultFilters = {
  search:        "",
  status:        "",
  projectType:   "",
  manager:       "",
  dueDateFilter: "",
  dueDateFrom:   "",
  dueDateTo:     "",
  page:          1,
  limit:         10,
};

// MUI DatePicker gives back a Date object — API wants "yyyy-MM-dd"
const toDateParam = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const useProject = () => {
  const [projects,      setProjects]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [filters,       setFilters]       = useState(defaultFilters);
  const [pagination,    setPagination]    = useState({
    total: 0, totalPages: 0, page: 1, limit: 10,
  });

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
    const params = {
      page:          customParams.page          ?? filters.page,
      limit:         customParams.limit         ?? filters.limit,
      search:        customParams.search        ?? filters.search,
      status:        customParams.status        ?? filters.status,
      projectType:   customParams.projectType   ?? filters.projectType,
      manager:       customParams.manager       ?? filters.manager,
      dueDateFilter: customParams.dueDateFilter ?? filters.dueDateFilter,
      dueDateFrom:   toDateParam(customParams.dueDateFrom ?? filters.dueDateFrom),
      dueDateTo:     toDateParam(customParams.dueDateTo   ?? filters.dueDateTo),
    };

      Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] == null) delete params[k];
    });
      const response = await getProjectsApi(params);

      if (response?.status === 200 || response?.status === 201) {
        const { projects: data, pagination: pg } = response.data.data;
        setProjects(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch projects.";
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
  const createProject = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createProjectApi(formData);

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjects();
        return { success: true, message: response.data.message || "Project created successfully." };
      } else {
        const msg = response?.data?.message || "Failed to create project.";
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
  }, [fetchProjects]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateProject = useCallback(async (id, formData) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateProjectApi(id, formData);

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjects();
        return { success: true, message: "Project updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update project.";
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
  }, [fetchProjects]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteProject = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteProjectApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjects();
        return { success: true, message: "Project deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete project.";
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
  }, [fetchProjects]);

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

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  return {
    projects,
    loading,
    actionLoading,
    error,
    pagination,
    filters,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  };
};