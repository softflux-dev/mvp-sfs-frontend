import { useState, useCallback } from "react";
import {
  getModuleDetailApi,
  generatePlanApi,
  savePlanApi,
  detailUseCaseApi,
  generatePlanTasksApi,
  commitPlanTasksApi,
} from "../../api/modules/plan";

const EMPTY_PLAN = { status: "none", flowchart: [], useCases: [] };

export const usePlan = (projectId, moduleId) => {
  const [module,     setModule]     = useState(null);
  const [plan,       setPlan]       = useState(EMPTY_PLAN);
  const [taskCount,  setTaskCount]  = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [error,      setError]      = useState("");

  // ── Fetch module + plan ────────────────────────────────────────────────────
  const fetchDetail = useCallback(async () => {
    if (!projectId || !moduleId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getModuleDetailApi(projectId, moduleId);
      if (res?.status === 200 || res?.status === 201) {
        const mod = res.data.data.module;
        setModule(mod);
        setPlan(mod.plan?.status ? mod.plan : EMPTY_PLAN);
        setTaskCount(res.data.data.taskCount || 0);
        return { success: true };
      }
      setError(res?.data?.message || "Failed to load module.");
      return { success: false };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [projectId, moduleId]);

  // ── One-time plan generation ───────────────────────────────────────────────
  const generate = useCallback(async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await generatePlanApi(projectId, moduleId);
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to generate plan.";
      setError(msg);
      return { success: false, message: msg };
    } catch (e) {
      const msg = e?.response?.data?.message || "AI generation failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setGenerating(false);
    }
  }, [projectId, moduleId]);

  // ── Save edited flowchart + use cases ──────────────────────────────────────
  const savePlan = useCallback(async (flowchart, useCases) => {
    setSavingPlan(true);
    setError("");
    try {
      const res = await savePlanApi(projectId, moduleId, { flowchart, useCases });
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true, message: "Plan saved." };
      }
      const msg = res?.data?.message || "Failed to save plan.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setSavingPlan(false);
    }
  }, [projectId, moduleId]);

  // ── AI implementation detail for one use case ──────────────────────────────
  const detailUseCase = useCallback(async (title, description) => {
    try {
      const res = await detailUseCaseApi(projectId, moduleId, { title, description });
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, details: res.data.data.details || "" };
      }
      return { success: false, message: res?.data?.message || "Failed to generate detail." };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || "AI generation failed." };
    }
  }, [projectId, moduleId]);

  // ── Generate task proposals (returns list, not persisted) ──────────────────
  const generateTasks = useCallback(async () => {
    try {
      const res = await generatePlanTasksApi(projectId, moduleId);
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, tasks: res.data.data.tasks || [] };
      }
      return { success: false, message: res?.data?.message || "Failed to generate tasks." };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || "AI generation failed." };
    }
  }, [projectId, moduleId]);

  // ── Commit edited tasks to the module ──────────────────────────────────────
  const commitTasks = useCallback(async (tasks) => {
    try {
      const res = await commitPlanTasksApi(projectId, moduleId, tasks);
      if (res?.status === 200 || res?.status === 201) {
        await fetchDetail();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res?.data?.message || "Failed to add tasks." };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || "Something went wrong." };
    }
  }, [projectId, moduleId, fetchDetail]);

  return {
    module, plan, taskCount,
    loading, generating, savingPlan, error,
    fetchDetail, generate, savePlan, detailUseCase, generateTasks, commitTasks,
  };
};