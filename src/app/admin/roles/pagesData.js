// app/admin/roles/pagesData.js
// Each portal's pages — map these to your actual route paths

export const adminPages = [
  { id: "admin-dashboard",    title: "Dashboard",    path: "/admin/dashboard"    },
  { id: "admin-projects",     title: "Projects",     path: "/admin/projects"     },
  { id: "admin-employees",    title: "Employees",    path: "/admin/employees"    },
  { id: "admin-performance",  title: "Performance",  path: "/admin/performance"  },
  { id: "admin-roles",        title: "Roles",        path: "/admin/roles"        },
  { id: "admin-messages",     title: "Messages",     path: "/admin/messages"     },
  { id: "admin-documents",    title: "Documents",    path: "/admin/documents"    },
  { id: "admin-reports",      title: "Reports",      path: "/admin/reports"      },
  { id: "admin-integrations", title: "Integrations", path: "/admin/integrations" },
  { id: "admin-settings",     title: "Settings",     path: "/admin/settings"     },
];

export const hrPages = [
  { id: "hr-dashboard",   title: "HR Dashboard", path: "/hr/dashboard"   },
  { id: "hr-attendance",  title: "Attendance Management",   path: "/hr/attendance"  },
  { id: "hr-leaves",      title: "Leaves Management",       path: "/hr/leaves"      },
  { id: "hr-payroll",     title: "Payroll",      path: "/hr/payroll"     },
  { id: "hr-messages",    title: "Messages",     path: "/hr/messages"    },
  { id: "hr-documents",   title: "Documents",    path: "/hr/documents"   },
];

export const projectManagerPages = [
  { id: "pm-dashboard",    title: "Dashboard",        path: "/pm/dashboard"    },
  { id: "pm-projects",     title: "My Projects",      path: "/pm/projects"     },
  { id: "pm-tasks",        title: "Task Management",  path: "/pm/tasks"        },
  { id: "pm-performance",  title: "Team Performance", path: "/pm/performance"  },
  { id: "pm-messages",     title: "Messages",         path: "/pm/messages"     },
  { id: "pm-documents",    title: "Documents",        path: "/pm/documents"    },
];

export const employeePages = [
  { id: "emp-dashboard",  title: "Dashboard", path: "/employee/dashboard"  },
  { id: "emp-tasks",      title: "My Tasks",  path: "/employee/tasks"      },
  { id: "emp-attendance", title: "My Attendance",path: "/employee/attendance" },
  { id: "emp-messages",   title: "Messages",  path: "/employee/messages"   },
  { id: "emp-salary",     title: "My Salary",    path: "/employee/salary"     },
  { id: "emp-profile",    title: "Profile",   path: "/employee/profile"    },
];