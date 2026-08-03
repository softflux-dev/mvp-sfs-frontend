import { useState, useCallback } from "react";
import {
  getModuleDetailApi,
  generateUseCasesApi,
  saveUseCasesApi,
  detailUseCaseApi,
  generateFlowchartApi,
  saveFlowchartApi,
  generatePlanTasksApi,
  commitPlanTasksApi,
} from "../../api/modules/plan";

const EMPTY_PLAN = { status: "none", useCases: [], flowchart: { nodes: [], edges: [] } };

export const usePlan = (projectId, moduleId) => {
  const [module,        setModule]        = useState(null);
  const [plan,          setPlan]          = useState(EMPTY_PLAN);
  const [taskCount,     setTaskCount]     = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [generatingUC,  setGeneratingUC]  = useState(false);
  const [savingUC,      setSavingUC]      = useState(false);
  const [generatingFC,  setGeneratingFC]  = useState(false);
  const [savingFC,      setSavingFC]      = useState(false);
  const [error,         setError]         = useState("");

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

  // ── Stage 1 — generate use cases only ──────────────────────────────────────
  const generateUseCases = useCallback(async () => {
    setGeneratingUC(true);
    setError("");
    try {
      const res = await generateUseCasesApi(projectId, moduleId);
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to generate use cases.";
      setError(msg);
      return { success: false, message: msg };
    } catch (e) {
      const msg = e?.response?.data?.message || "AI generation failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setGeneratingUC(false);
    }
  }, [projectId, moduleId]);

  // ── Save edited / checked use cases ────────────────────────────────────────
  const saveUseCases = useCallback(async (useCases) => {
    setSavingUC(true);
    setError("");
    try {
      const res = await saveUseCasesApi(projectId, moduleId, useCases);
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true, message: "Use cases saved." };
      }
      const msg = res?.data?.message || "Failed to save use cases.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setSavingUC(false);
    }
  }, [projectId, moduleId]);

  // ── AI implementation detail for one use case (instructions optional) ──────
  const detailUseCase = useCallback(async (title, description, instructions) => {
    try {
      const res = await detailUseCaseApi(projectId, moduleId, { title, description, instructions });
      if (res?.status === 200 || res?.status === 201) {
        return { success: true, details: res.data.data.details || "" };
      }
      return { success: false, message: res?.data?.message || "Failed to generate detail." };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || "AI generation failed." };
    }
  }, [projectId, moduleId]);

  // ── Stage 2 — generate flowchart from the finalized (checked) use cases ────
  const generateFlowchart = useCallback(async () => {
    setGeneratingFC(true);
    setError("");
    try {
      const res = await generateFlowchartApi(projectId, moduleId);
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to generate flowchart.";
      setError(msg);
      return { success: false, message: msg };
    } catch (e) {
      const msg = e?.response?.data?.message || "AI generation failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setGeneratingFC(false);
    }
  }, [projectId, moduleId]);

  // ── Save the edited / dragged flowchart graph ───────────────────────────────
  const saveFlowchart = useCallback(async (flowchart) => {
    setSavingFC(true);
    setError("");
    try {
      const res = await saveFlowchartApi(projectId, moduleId, flowchart);
      if (res?.status === 200 || res?.status === 201) {
        setPlan(res.data.data.plan);
        return { success: true, message: "Flowchart saved." };
      }
      const msg = res?.data?.message || "Failed to save flowchart.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setSavingFC(false);
    }
  }, [projectId, moduleId]);

  // ── Stage 3 — generate task proposals (returns list, not persisted) ────────
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
    loading, generatingUC, savingUC, generatingFC, savingFC, error,
    fetchDetail,
    generateUseCases, saveUseCases, detailUseCase,
    generateFlowchart, saveFlowchart,
    generateTasks, commitTasks,
  };
};