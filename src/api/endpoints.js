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
  updateProjectStages: "admin/projects",
  empGetProjectById: "employee/projects",
  

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
  
  // ── Employee Profile (/api/employee/profile) ──────────────────────────────
  getProfile:      "employee/profile",
  updateProfile:   "employee/profile",
  changePassword:  "employee/profile/change-password",

  // ── Shared Documents (/api/documents) ────────────────────────────────────
  getSharedDocuments:    "documents",
  uploadSharedDocument:  "documents",
  deleteSharedDocument:  "documents",
  downloadSharedDocument:"documents",

  // Notification Preferences
  getNotificationPreferences:    "admin/settings/notifications",
  updateNotificationPreferences: "admin/settings/notifications",

  getNotifications:         "notifications",
  markNotificationRead:     "notifications",
  markAllNotificationsRead: "notifications",

   // ── Leave Management ──────────────────────────────────────────────────────
  empGetMyLeaves:     "employee/leaves",   // GET / POST / DELETE /:id
  hrGetLeaves:        "hr/leaves",         // GET /
  hrReviewLeave:      "hr/leaves",         // PATCH /:id

  // ── Attendance (HR) ───────────────────────────────────────────────────────
getAttendanceSummary:   "hr/attendance/summary",
getAttendanceDetail:    "hr/attendance/detail",
updateAttendanceRecord: "hr/attendance",
importAttendance:       "hr/attendance/import",
getAttendanceImports:   "hr/attendance/imports",
getAttendancePartial:   "hr/attendance/partial",

// ── Attendance (Employee) ─────────────────
empAttendanceDefaultMonth: "employee/attendance/default-month",
empAttendanceStats:        "employee/attendance/stats",
empAttendanceMonthly:      "employee/attendance/monthly",
empAttendanceWeek:         "employee/attendance/week",
empAttendanceAnnual:       "employee/attendance/annual",

getHolidays: "hr/holidays",

};


export default ENDPOINTS;