import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getProjectsApi = (params) =>
  api(ENDPOINTS.getProjects, params, "get");

export const getProjectByIdApi = (id) =>
  api(`${ENDPOINTS.getProjectById}/${id}`, null, "get");

export const createProjectApi = (payload) =>
  api(ENDPOINTS.createProject, payload, "post");

export const updateProjectApi = (id, payload) =>
  api(`${ENDPOINTS.updateProject}/${id}`, payload, "put");

export const deleteProjectApi = (id) =>
  api(`${ENDPOINTS.deleteProject}/${id}`, null, "delete");

export const getProjectManagersApi = () =>
  api(`${ENDPOINTS.getProjectManagers}/managers`, null, "get");

export const getProjectTeamApi = (projectId) =>
  api(`${ENDPOINTS.getProjects}/${projectId}/team`, null, "get");

export const removeTeamMemberApi = (projectId, employeeId) =>
  api(`${ENDPOINTS.getProjects}/${projectId}/team/remove`, { employeeId }, "patch");

export const getPMProjectsApi = (params) =>
  api(ENDPOINTS.pmGetProjects, params, "get");

export const getPMProjectByIdApi = (id) =>
  api(`${ENDPOINTS.pmGetProjects}/${id}`, null, "get");

export const getProjectStatsApi = (id) =>
  api(`${ENDPOINTS.getProjectById}/${id}/stats`, null, "get");

export const addTeamMembersApi = (projectId, employeeIds) =>
  api(`${ENDPOINTS.getProjects}/${projectId}/team/add`, { employeeIds }, "patch");

export const updateProjectStagesApi = (projectId, stages) =>
  api(`${ENDPOINTS.updateProjectStages}/${projectId}/stages`, { stages }, "patch");

export const getEmpProjectByIdApi = (id) =>
  api(`${ENDPOINTS.empGetProjectById}/${id}`, null, "get");
