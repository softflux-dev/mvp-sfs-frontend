import { useState, useCallback, useEffect } from "react";
import {
  getProjectTypesApi,
  createProjectTypeApi,
  updateProjectTypeApi,
  deleteProjectTypeApi,
} from "../../api/modules/projectType";

export const useProjectType = () => {
  const [projectTypes,  setProjectTypes]  = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchProjectTypes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getProjectTypesApi();

      if (response?.status === 200 || response?.status === 201) {
        const { projectTypes: data } = response.data.data;
        setProjectTypes(Array.isArray(data) ? data : []);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch project types.";
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
  }, []);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createProjectType = useCallback(async (label) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createProjectTypeApi({ label });

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjectTypes();
        return {
          success:     true,
          message:     "Project type created successfully.",
          projectType: response.data.data.projectType,
        };
      } else {
        const msg = response?.data?.message || "Failed to create project type.";
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
  }, [fetchProjectTypes]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateProjectType = useCallback(async (id, label) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateProjectTypeApi(id, { label });

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjectTypes();
        return { success: true, message: "Project type updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update project type.";
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
  }, [fetchProjectTypes]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteProjectType = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteProjectTypeApi(id);

      if (response?.status === 200 || response?.status === 201) {
        await fetchProjectTypes();
        return { success: true, message: "Project type deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete project type.";
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
  }, [fetchProjectTypes]);

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  return {
    projectTypes,
    loading,
    actionLoading,
    error,
    fetchProjectTypes,
    createProjectType,
    updateProjectType,
    deleteProjectType,
  };
};