import ENDPOINTS from "../endpoints";
import api       from "../index";

// admin -> admin/projects/:id/modules/:id, pm -> pm/projects/:id/modules/:id
const base = (projectId, moduleId, role = "admin") => {
  const root = role === "pm" ? "pm/projects" : ENDPOINTS.getModules; // "admin/projects"
  return `${root}/${projectId}/modules/${moduleId}`;
};

export const getModuleDetailApi = (projectId, moduleId, role) =>
  api(`${base(projectId, moduleId, role)}/detail`, null, "get");

export const generateUseCasesApi = (projectId, moduleId, role) =>
  api(`${base(projectId, moduleId, role)}/plan/usecases/generate`, null, "post");

export const saveUseCasesApi = (projectId, moduleId, useCases, role) =>
  api(`${base(projectId, moduleId, role)}/plan/usecases`, { useCases }, "patch");

export const detailUseCaseApi = (projectId, moduleId, payload, role) =>
  api(`${base(projectId, moduleId, role)}/plan/usecase-detail`, payload, "post");

export const generateFlowchartApi = (projectId, moduleId, role) =>
  api(`${base(projectId, moduleId, role)}/plan/flowchart/generate`, null, "post");

export const saveFlowchartApi = (projectId, moduleId, flowchart, role) =>
  api(`${base(projectId, moduleId, role)}/plan/flowchart`, { flowchart }, "patch");

export const generatePlanTasksApi = (projectId, moduleId, role) =>
  api(`${base(projectId, moduleId, role)}/plan/tasks/generate`, null, "post");

export const commitPlanTasksApi = (projectId, moduleId, tasks, role) =>
  api(`${base(projectId, moduleId, role)}/plan/tasks/commit`, { tasks }, "post");