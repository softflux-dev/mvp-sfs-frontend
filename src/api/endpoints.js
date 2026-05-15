
const ENDPOINTS = {
    
// Auth
login:          "auth/login",
forgotPassword: "auth/forgot-password",
verifyOtp:      "auth/verify-otp",
resetPassword:  "auth/reset-password",
getMe:          "auth/me",

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
  getEmployees:         "admin/employees",
  getEmployeeById:      "admin/employees",
  createEmployee:       "admin/employees",
  updateEmployee:       "admin/employees",
  deleteEmployee:       "admin/employees",
  toggleEmployeeStatus: "admin/employees",

  getEmployeeDocuments:    "admin/employees",  
  uploadEmployeeDocument:  "admin/employees",
  deleteEmployeeDocument:  "admin/employees",
  downloadEmployeeDocument:"admin/employees",

};

export default ENDPOINTS;