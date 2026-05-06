export const mockTasks = [
  { id: 1,  title: "Design product listing page",       project: "E-Commerce Platform",       module: "Product Catalog",    assigneeName: "Sarah Johnson",  assigneeAvatar: "", priority: "High",   status: "In Progress", deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 2,  title: "Implement payment gateway",         project: "E-Commerce Platform",       module: "Checkout",           assigneeName: "James Chen",     assigneeAvatar: "", priority: "High",   status: "Review",      deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 3,  title: "Setup CI/CD pipeline",              project: "Healthcare Portal",          module: "Infrastructure",     assigneeName: "Aisha Patel",    assigneeAvatar: "", priority: "Medium", status: "Assigned",    deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 4,  title: "Patient records API",               project: "Healthcare Portal",          module: "Backend API",        assigneeName: "Michael Williams",assigneeAvatar:"", priority: "High",   status: "In Progress", deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 5,  title: "Design CRM dashboard wireframes",   project: "CRM Dashboard",             module: "UI Design",          assigneeName: "Priya Garcia",   assigneeAvatar: "", priority: "Medium", status: "New",         deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 6,  title: "Write unit tests for auth module",  project: "Mobile Banking App",        module: "Authentication",     assigneeName: "David Kim",      assigneeAvatar: "", priority: "Medium", status: "In Progress", deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 7,  title: "Optimize database queries",         project: "Mobile Banking App",        module: "Performance",        assigneeName: "Maria Brown",    assigneeAvatar: "", priority: "High",   status: "Completed",   deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 8,  title: "Build notification system",         project: "Mobile Banking App",        module: "Notifications",      assigneeName: "Chen Singh",     assigneeAvatar: "", priority: "Low",    status: "Assigned",    deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 9,  title: "Create course enrollment flow",     project: "Learning Management System",module: "Enrollment",         assigneeName: "Omar Ahmed",     assigneeAvatar: "", priority: "Low",    status: "New",         deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
  { id: 10, title: "API load testing",                  project: "E-Commerce Platform",       module: "QA",                 assigneeName: "Emily Taylor",   assigneeAvatar: "", priority: "Medium", status: "New",         deadline: "Jun 29, 2026", comments: 5, attachments: 2 },
];

export const KANBAN_COLUMNS = [
  { id: "New",         label: "New"         },
  { id: "Assigned",    label: "Assigned"    },
  { id: "In Progress", label: "In Progress" },
  { id: "Review",      label: "Review"      },
  { id: "Completed",   label: "Completed"   },
];