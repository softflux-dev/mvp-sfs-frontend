// api/modules/plan.js
import ENDPOINTS from "../endpoints";
import api       from "../index";

// Mirrors module.js: /admin/projects/:projectId/modules/:moduleId/...
const base = (projectId, moduleId) =>
  `${ENDPOINTS.getModules}/${projectId}/modules/${moduleId}`;

// GET module + plan + task count
export const getModuleDetailApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/detail`, null, "get");

// POST — one-time AI generation of flowchart + use cases
export const generatePlanApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/plan/generate`, null, "post");

// PATCH — save edited flowchart + use cases
export const savePlanApi = (projectId, moduleId, payload) =>
  api(`${base(projectId, moduleId)}/plan`, payload, "patch");

// POST — AI implementation detail for one use case (stateless)
export const detailUseCaseApi = (projectId, moduleId, payload) =>
  api(`${base(projectId, moduleId)}/plan/usecase-detail`, payload, "post");

// POST — AI task proposals (not persisted)
export const generatePlanTasksApi = (projectId, moduleId) =>
  api(`${base(projectId, moduleId)}/plan/tasks/generate`, null, "post");

// POST — commit the edited task list to the module
export const commitPlanTasksApi = (projectId, moduleId, tasks) =>
  api(`${base(projectId, moduleId)}/plan/tasks/commit`, { tasks }, "post");