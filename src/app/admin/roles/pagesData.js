// app/admin/roles/pagesData.js


export const adminPages = [
  { id: "admin-dashboard",    title: "Dashboard",    path: "/"               },
  { id: "admin-projects",     title: "Projects",     path: "/projects"       },
  { id: "admin-employees",    title: "Employees",    path: "/employees"      },
  { id: "admin-performance",  title: "Performance",  path: "/performance"    },
  { id: "admin-roles",        title: "Roles",        path: "/roles"          },
  { id: "admin-messages",     title: "Messages",     path: "/messages"       },
  { id: "admin-documents",    title: "Documents",    path: "/documents"      },
  { id: "admin-reports",      title: "Reports",      path: "/reports"        },
  { id: "admin-integrations", title: "Integrations", path: "/integrations"   },
  { id: "admin-settings",     title: "Settings",     path: "/settings"       },
];

export const hrPages = [
  { id: "hr-dashboard",   title: "HR Dashboard",         path: "/hr-dashboard"         },
  { id: "hr-attendance",  title: "Attendance Management", path: "/attendance-monitoring" },
  { id: "hr-leaves",      title: "Leave Management",      path: "/leave-management"      },
  { id: "hr-payroll",     title: "Payroll",               path: "/payroll-management"    },
  { id: "hr-messages",    title: "Messages",              path: "/hr-messages"           },
  { id: "hr-documents",   title: "Documents",             path: "/hr-documents"          },
];

export const projectManagerPages = [
  { id: "pm-dashboard",   title: "Dashboard",        path: "/dashboard"        },
  { id: "pm-projects",    title: "My Projects",      path: "/my-projects"      },
  { id: "pm-tasks",       title: "Task Management",  path: "/task-management"  },
  { id: "pm-performance", title: "Team Performance", path: "/team-performance" },
  { id: "pm-messages",    title: "Messages",         path: "/pm-messages"      },
  { id: "pm-documents",   title: "Documents",        path: "/pm-documents"     },
];

export const employeePages = [
  { id: "emp-dashboard",  title: "Dashboard",    path: "/employee-dashboard" },
  { id: "emp-tasks",      title: "My Tasks",     path: "/my-tasks"           },
  { id: "emp-attendance", title: "My Attendance",path: "/emp-attendance"     },
  { id: "emp-messages",   title: "Messages",     path: "/messages"           },
  { id: "emp-salary",     title: "My Salary",    path: "/salary"             },
  { id: "emp-profile",    title: "Profile",      path: "/profile"            },
  { id: "emp-documents", title: "My Documents", path: "/my-documents" },
];

// All pages grouped — used in SelectPagesDialog
export const ALL_PAGE_GROUPS = [
  { label: "Admin",           color: "#AA2493", pages: adminPages           },
  { label: "HR",              color: "#AA2493", pages: hrPages               },
  { label: "Project Manager", color: "#AA2493", pages: projectManagerPages   },
  { label: "Employee",        color: "#AA2493", pages: employeePages         },
];

// Flat list — used to match route paths to icons/components
export const ALL_PAGES_FLAT = [
  ...adminPages,
  ...hrPages,
  ...projectManagerPages,
  ...employeePages,
];