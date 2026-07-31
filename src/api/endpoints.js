// src/api/endpoints.js — Phases 3/5 (Leave Management Enhancement)
// Added keys only: adminGetEscalatedLeaves, adminReviewEscalation, hrGetAllBalances.
// Everything else is unchanged from the current file — merge these three keys
// into your existing endpoints.js under the "Leave Management" section.

const ENDPOINTS = {

  // Auth
  login:          "auth/login",
  checkEmail: "auth/check-email",
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
  getDeactivationImpact:      "admin/employees",
  getReassignmentCandidates:  "admin/employees/reassignment-candidates",
  reassignAndDeactivate:      "admin/employees",
  reactivateEmployee:         "admin/employees",

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
  uploadTaskAttachment:         "admin/projects",
  deleteTaskAttachment:         "admin/projects",
  downloadTaskAttachment:       "admin/projects",

  getEmployeeTasks: "admin/employees",

  getProjectDocuments:     "admin/projects",
  uploadProjectDocument:   "admin/projects",
  deleteProjectDocument:   "admin/projects",
  downloadProjectDocument: "admin/projects",

  getTaskDetail:       "tasks",
  addComment:          "tasks",
  updateTaskStatus:    "tasks",
  submitWork:          "tasks",
  getSubmissions:      "tasks",
  downloadSubmission:  "tasks",

  pmGetTasks:           "pm/tasks",
  pmGetProjectTasks:    "pm/projects",
  pmCreateTask:         "pm/projects",
  pmUpdateTask:         "pm/projects",
  pmDeleteTask:         "pm/projects",
  pmGetProjects: "pm/projects",
  pmUpdateProjectStages: "pm/projects",

  empGetMyTasks:   "employee/tasks",
  empGetTaskById:  "employee/tasks",

  getBugReports:    "tasks",
  createBugReport:  "tasks",
  updateBugReport:  "tasks",
  deleteBugReport:  "tasks",

  getProfile:      "employee/profile",
  updateProfile:   "employee/profile",
  changePassword:  "employee/profile/change-password",

  getSharedDocuments:    "documents",
  uploadSharedDocument:  "documents",
  deleteSharedDocument:  "documents",
  downloadSharedDocument:"documents",

  getNotificationPreferences:    "admin/settings/notifications",
  updateNotificationPreferences: "admin/settings/notifications",

  getNotifications:         "notifications",
  markNotificationRead:     "notifications",
  markAllNotificationsRead: "notifications",

  // ── Leave Management ──────────────────────────────────────────────────────
  empGetMyLeaves:     "employee/leaves",
  hrGetLeaves:        "hr/leaves",
  hrReviewLeave:      "hr/leaves",

  // NEW — Admin escalation queue (Phase 3)
  adminGetEscalatedLeaves: "admin/leaves/escalated",
  adminReviewEscalation:   "admin/leaves",   // used as `${adminReviewEscalation}/${id}/escalation`

  // NEW — HR company-wide leave balance dashboard (Phase 5)
  hrGetAllBalances: "hr/leaves/balances",

  // ── Attendance (HR) ───────────────────────────────────────────────────────
  getAttendanceSummary:   "hr/attendance/summary",
  getAttendanceDetail:    "hr/attendance/detail",
  updateAttendanceRecord: "hr/attendance",
  importAttendance:       "hr/attendance/import",
  getAttendanceImports:   "hr/attendance/imports",
  getAttendancePartial:   "hr/attendance/partial",

  empAttendanceDefaultMonth: "employee/attendance/default-month",
  empAttendanceStats:        "employee/attendance/stats",
  empAttendanceMonthly:      "employee/attendance/monthly",
  empAttendanceWeek:         "employee/attendance/week",
  empAttendanceAnnual:       "employee/attendance/annual",

  getHolidays: "hr/holidays",

  getCompanyProfile:    "admin/settings/company",
  updateCompanyProfile: "admin/settings/company",
  getCurrencies:     "admin/settings/company/currencies",
  getActiveCurrency: "settings/currency",
  getWorkingHours:    "admin/settings/working-hours",
  updateWorkingHours: "admin/settings/working-hours",
  getCountries:   "admin/settings/company/countries",
  getPhoneConfig: "settings/phone-config",

  getLeavePolicy:    "admin/settings/leave-policy",
  updateLeavePolicy: "admin/settings/leave-policy",

  getSecuritySettings:    "admin/settings/security",
  updateSecuritySettings: "admin/settings/security",
  changeAdminPassword:    "admin/settings/security/password",

  addBonus:    "hr/bonus",
  getBonuses:  "hr/bonus",
  updateBonus: "hr/bonus",
  deleteBonus: "hr/bonus",

  addIncrement:    "hr/increment",
  getIncrements:   "hr/increment",
  deleteIncrement: "hr/increment",

  generatePayroll:  "hr/payroll/generate",
  getPayroll:       "hr/payroll",
  finalizePayroll:  "hr/payroll",
  sendPayslipEmail: "hr/payroll/send-payslip",
  updatePayroll: "hr/payroll",
  getEmployeePayrollHistory: "hr/payroll/employee",
  empGetMySalary: "employee/salary",

  getPerformanceOverview: "admin/performance",

};

export default ENDPOINTS;