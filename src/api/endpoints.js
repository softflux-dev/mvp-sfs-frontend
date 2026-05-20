const ENDPOINTS = {

  // Auth
  login:          "auth/login",
  forgotPassword: "auth/forgot-password",
  verifyOtp:      "auth/verify-otp",
  resetPassword:  "auth/reset-password",
  getMe:          "auth/me",

  // Employee Auth
employeeLogin:          "employee/auth/login",
employeeForgotPassword: "employee/auth/forgot-password",
employeeVerifyOtp:      "employee/auth/verify-otp",
employeeResetPassword:  "employee/auth/reset-password",

  // Departments
  getDepartments:    "admin/departments",
  getDepartmentById: "admin/departments",
  createDepartment:  "admin/departments",
  updateDepartment:  "admin/departments",
  deleteDepartment:  "admin/departments",

  // Roles
  getRoles:    "admin/roles",
  getRoleById: "admin/roles",
  createRole:  "admin/roles",
  updateRole:  "admin/roles",
  deleteRole:  "admin/roles",

  // Employees
  getEmployees:            "admin/employees",
  getEmployeeById:         "admin/employees",
  createEmployee:          "admin/employees",
  updateEmployee:          "admin/employees",
  deleteEmployee:          "admin/employees",
  toggleEmployeeStatus:    "admin/employees",
  getEmployeeDocuments:    "admin/employees",
  uploadEmployeeDocument:  "admin/employees",
  deleteEmployeeDocument:  "admin/employees",
  downloadEmployeeDocument:"admin/employees",

  // Project Types
  getProjectTypes:   "admin/project-types",
  createProjectType: "admin/project-types",
  updateProjectType: "admin/project-types",
  deleteProjectType: "admin/project-types",

  // Projects
  getProjects:        "admin/projects",
  getProjectById:     "admin/projects",
  createProject:      "admin/projects",
  updateProject:      "admin/projects",
  deleteProject:      "admin/projects",
  getProjectManagers: "admin/projects",
  

  // Modules
  getModules:   "admin/projects",
  createModule: "admin/projects",
  updateModule: "admin/projects",
  deleteModule: "admin/projects",

  // Admin Tasks (under projects)
  getProjectTasks:              "admin/projects",
  createTask:                   "admin/projects",
  updateTask:                   "admin/projects",
  deleteTask:                   "admin/projects",
  getEmployeesByDepartmentTask: "admin/projects",
  // Task attachments
  uploadTaskAttachment:         "admin/projects",
  deleteTaskAttachment:         "admin/projects",
  downloadTaskAttachment:       "admin/projects",

  // Employee tasks (admin view)
  getEmployeeTasks: "admin/employees",

  // Project Documents
  getProjectDocuments:     "admin/projects",
  uploadProjectDocument:   "admin/projects",
  deleteProjectDocument:   "admin/projects",
  downloadProjectDocument: "admin/projects",

  // ── Shared Task Detail (/api/tasks/:taskId/...) ──────────────────────────
  getTaskDetail:       "tasks",
  addComment:          "tasks",
  updateTaskStatus:    "tasks",
  submitWork:          "tasks",
  getSubmissions:      "tasks",
  downloadSubmission:  "tasks",

  // ── PM Portal (/api/pm/...) ───────────────────────────────────────────────
  pmGetTasks:           "pm/tasks",
  pmGetProjectTasks:    "pm/projects",
  pmCreateTask:         "pm/projects",
  pmUpdateTask:         "pm/projects",
  pmDeleteTask:         "pm/projects",
  pmGetProjects: "pm/projects",

  // ── Employee Portal (/api/employee/...) ──────────────────────────────────
  empGetMyTasks:   "employee/tasks",
  empGetTaskById:  "employee/tasks",

 // Bug Reports (/api/tasks/:taskId/bugs)
  getBugReports:    "tasks",  
  createBugReport:  "tasks",  
  updateBugReport:  "tasks",  
  deleteBugReport:  "tasks",  
};

export default ENDPOINTS;