import ENDPOINTS from "../endpoints";
import api       from "../index";

// ── Admin: project tasks ──────────────────────────────────────────────────────
export const getProjectTasksApi = (projectId, params) =>
  api(`${ENDPOINTS.getProjectTasks}/${projectId}/tasks`, params, "get");

export const createTaskApi = (projectId, payload) =>
  api(`${ENDPOINTS.createTask}/${projectId}/tasks`, payload, "post");

export const updateTaskApi = (projectId, taskId, payload) =>
  api(`${ENDPOINTS.updateTask}/${projectId}/tasks/${taskId}`, payload, "put");

export const deleteTaskApi = (projectId, taskId) =>
  api(`${ENDPOINTS.deleteTask}/${projectId}/tasks/${taskId}`, null, "delete");

export const getEmployeesByDepartmentApi = (projectId, departmentId) =>
  api(`${ENDPOINTS.getEmployeesByDepartmentTask}/${projectId}/tasks/employees-by-department/${departmentId}`, null, "get");

// Admin: employee tasks view
export const getEmployeeTasksApi = (employeeId, params) =>
  api(`${ENDPOINTS.getEmployeeTasks}/${employeeId}/tasks`, params, "get");

// ── Admin: task attachments ───────────────────────────────────────────────────
export const uploadTaskAttachmentApi = (projectId, taskId, formData) =>
  api(`${ENDPOINTS.uploadTaskAttachment}/${projectId}/tasks/${taskId}/attachments`, formData, "post", true);

export const deleteTaskAttachmentApi = (projectId, taskId, attachmentId) =>
  api(`${ENDPOINTS.deleteTaskAttachment}/${projectId}/tasks/${taskId}/attachments/${attachmentId}`, null, "delete");

export const downloadTaskAttachmentApi = (projectId, taskId, attachmentId) =>
  `${import.meta.env.VITE_API_BASE_URL || ""}/api/${ENDPOINTS.downloadTaskAttachment}/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`;

// ── Shared: task detail (all roles) ──────────────────────────────────────────
export const getTaskDetailApi = (taskId) =>
  api(`${ENDPOINTS.getTaskDetail}/${taskId}/detail`, null, "get");

export const addCommentApi = (taskId, text) =>
  api(`${ENDPOINTS.addComment}/${taskId}/comments`, { text }, "post");

export const updateTaskStatusApi = (taskId, status) =>
  api(`${ENDPOINTS.updateTaskStatus}/${taskId}/status`, { status }, "patch");

export const submitWorkApi = (taskId, formData) =>
  api(`${ENDPOINTS.submitWork}/${taskId}/submissions`, formData, "post", true);

export const getSubmissionsApi = (taskId) =>
  api(`${ENDPOINTS.getSubmissions}/${taskId}/submissions`, null, "get");

export const downloadSubmissionUrl = (taskId, submissionId) =>
  `${import.meta.env.VITE_API_BASE_URL || ""}/api/${ENDPOINTS.downloadSubmission}/${taskId}/submissions/${submissionId}/download`;

// ── PM Portal ─────────────────────────────────────────────────────────────────
export const pmGetTasksApi = (params) =>
  api(ENDPOINTS.pmGetTasks, params, "get");

export const pmGetProjectTasksApi = (projectId, params) =>
  api(`${ENDPOINTS.pmGetProjectTasks}/${projectId}/tasks`, params, "get");

export const pmCreateTaskApi = (projectId, payload) =>
  api(`${ENDPOINTS.pmCreateTask}/${projectId}/tasks`, payload, "post");

export const pmUpdateTaskApi = (projectId, taskId, payload) =>
  api(`${ENDPOINTS.pmUpdateTask}/${projectId}/tasks/${taskId}`, payload, "put");

export const pmDeleteTaskApi = (projectId, taskId) =>
  api(`${ENDPOINTS.pmDeleteTask}/${projectId}/tasks/${taskId}`, null, "delete");



// ── Employee Portal ───────────────────────────────────────────────────────────
export const empGetMyTasksApi = (params) =>
  api(ENDPOINTS.empGetMyTasks, params, "get");

export const empGetTaskByIdApi = (taskId) =>
  api(`${ENDPOINTS.empGetTaskById}/${taskId}`, null, "get");

// ── Bug Reports ───────────────────────────────────────────────────────────────
export const getBugReportsApi = (taskId, params) =>
  api(`${ENDPOINTS.getBugReports}/${taskId}/bugs`, params, "get");

export const createBugReportApi = (taskId, payload) =>
  api(`${ENDPOINTS.createBugReport}/${taskId}/bugs`, payload, "post", false);

export const updateBugReportApi = (taskId, bugId, payload) =>
  api(`${ENDPOINTS.updateBugReport}/${taskId}/bugs/${bugId}`, payload, "put", false);

export const deleteBugReportApi = (taskId, bugId) =>
  api(`${ENDPOINTS.deleteBugReport}/${taskId}/bugs/${bugId}`, null, "delete");

