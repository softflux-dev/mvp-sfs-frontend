import { useState, useCallback, useEffect } from "react";
import {
  getModulesApi,
  createModuleApi,
  updateModuleApi,
  deleteModuleApi,
} from "../../api/modules/module";

export const useModule = (projectId) => {
  const [modules,       setModules]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchModules = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getModulesApi(projectId);

      if (response?.status === 200 || response?.status === 201) {
        const { modules: data } = response.data.data;
        setModules(Array.isArray(data) ? data : []);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch modules.";
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
  }, [projectId]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createModule = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createModuleApi(projectId, payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchModules();
        return { success: true, message: "Module created successfully." };
      } else {
        const msg = response?.data?.message || "Failed to create module.";
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
  }, [projectId, fetchModules]);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateModule = useCallback(async (moduleId, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateModuleApi(projectId, moduleId, payload);

      if (response?.status === 200 || response?.status === 201) {
        await fetchModules();
        return { success: true, message: "Module updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update module.";
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
  }, [projectId, fetchModules]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteModule = useCallback(async (moduleId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteModuleApi(projectId, moduleId);

      if (response?.status === 200 || response?.status === 201) {
        await fetchModules();
        return { success: true, message: "Module deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete module.";
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
  }, [projectId, fetchModules]);

  useEffect(() => {
    fetchModules();
  }, [projectId]);

  return {
    modules,
    loading,
    actionLoading,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
  };
};