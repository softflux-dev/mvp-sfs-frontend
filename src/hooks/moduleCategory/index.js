import { useState, useCallback, useEffect } from "react";
import {
  getModuleCategoriesApi,
  createModuleCategoryApi,
  updateModuleCategoryApi,
  deleteModuleCategoryApi,
} from "../../api/modules/moduleCategory";

export const useModuleCategory = (projectId) => {
  const [moduleCategories, setModuleCategories] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchModuleCategories = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getModuleCategoriesApi(projectId);
      if (response?.status === 200 || response?.status === 201) {
        const { moduleCategories: data } = response.data.data;
        setModuleCategories(Array.isArray(data) ? data : []);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch categories.";
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

  const createModuleCategory = useCallback(async (label) => {
    if (!projectId) return { success: false, message: "No project selected." };
    setActionLoading(true);
    setError("");
    try {
      const response = await createModuleCategoryApi(projectId, { label });
      if (response?.status === 200 || response?.status === 201) {
        await fetchModuleCategories();
        return {
          success:        true,
          message:        "Category created successfully.",
          moduleCategory: response.data.data.moduleCategory,
        };
      } else {
        const msg = response?.data?.message || "Failed to create category.";
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
  }, [projectId, fetchModuleCategories]);

  const updateModuleCategory = useCallback(async (id, label) => {
    if (!projectId) return { success: false, message: "No project selected." };
    setActionLoading(true);
    setError("");
    try {
      const response = await updateModuleCategoryApi(projectId, id, { label });
      if (response?.status === 200 || response?.status === 201) {
        await fetchModuleCategories();
        return { success: true, message: "Category updated successfully." };
      } else {
        const msg = response?.data?.message || "Failed to update category.";
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
  }, [projectId, fetchModuleCategories]);

  const deleteModuleCategory = useCallback(async (id) => {
    if (!projectId) return { success: false, message: "No project selected." };
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteModuleCategoryApi(projectId, id);
      if (response?.status === 200 || response?.status === 201) {
        await fetchModuleCategories();
        return { success: true, message: "Category deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete category.";
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
  }, [projectId, fetchModuleCategories]);

  useEffect(() => { fetchModuleCategories(); }, [fetchModuleCategories]);

  return {
    moduleCategories,
    loading,
    actionLoading,
    error,
    fetchModuleCategories,
    createModuleCategory,
    updateModuleCategory,
    deleteModuleCategory,
  };
};