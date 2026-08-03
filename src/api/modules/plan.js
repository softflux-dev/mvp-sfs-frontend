// api/modules/plan.js
// Uses the same api(url, payload, method) wrapper as your other api modules.
import ENDPOINTS from "../endpoints";
import api       from "../index";

// Mirrors module.js: /admin/projects/:projectId/modules/:moduleId/...
const base = (projectId, moduleId) =>
  `${ENDPOINTS.getModules}/${projectId}/modules/${moduleId}`;

// GET module + plan + task count
export const getModuleDetailApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/detail`, null, "get");

// ── Stage 1 — use cases ────────────────────────────────────────────────────
// POST — one-time AI generation of use cases only
export const generateUseCasesApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/plan/usecases/generate`, null, "post");

// PATCH — save edited/checked use cases
export const saveUseCasesApi = (projectId, moduleId, useCases) =>
  api(`${base(projectId, moduleId)}/plan/usecases`, { useCases }, "patch");

// POST — AI implementation detail for one use case (stateless)
export const detailUseCaseApi = (projectId, moduleId, payload) =>
  api(`${base(projectId, moduleId)}/plan/usecase-detail`, payload, "post");

// ── Stage 2 — flowchart (generated ONLY from the finalized use cases) ──────
// POST — generate the flowchart from the currently checked use cases
export const generateFlowchartApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/plan/flowchart/generate`, null, "post");

// PATCH — save the edited/dragged flowchart graph
export const saveFlowchartApi = (projectId, moduleId, flowchart) =>
  api(`${base(projectId, moduleId)}/plan/flowchart`, { flowchart }, "patch");

// ── Stage 3 — tasks ──────────────────────────────────────────────────────────
// POST — AI task proposals (not persisted)
export const generatePlanTasksApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/plan/tasks/generate`, null, "post");

// POST — commit the edited task list to the module
export const commitPlanTasksApi = (projectId, moduleId, tasks) =>
  api(`${base(projectId, moduleId)}/plan/tasks/commit`, { tasks }, "post");