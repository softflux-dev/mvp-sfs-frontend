export const mockTasks = [
  { id: 1, task: "Design product card component", projectName: "E-Commerce Platform",     module: "Product Catalog", assigneeIds: ["sara_ahmed"],         assigneeAvatar: "", priority: "High", startDate:"May 1, 2026",   endDate: "Jun 30, 2026", status: "Completed"   },
  { id: 2, task: "Implement product search & filters", projectName: "E-Commerce Platform",module: "Product Catalog", assigneeIds: ["sara_ahmed", "jon"],  assigneeAvatar: "", priority: "High", startDate: "May 1, 2026", endDate:"Jun 30, 2026", status: "Planning"    },
  { id: 3, task: "Product image gallery",         projectName: "E-Commerce Platform",     module: "Checkout Flow",   assigneeIds: ["peter"],              assigneeAvatar: "", priority: "Low", startDate: "May 1, 2026",   endDate: "Jun 30, 2026", status: "Development" },
  { id: 4, task: "Cart state management",         projectName: "E-Commerce Platform",     module: "Checkout Flow",   assigneeIds: ["sara_ahmed", "peter", "sarah"], assigneeAvatar: "", priority: "Medium", startDate: "May 1, 2026",  endDate: "Jun 30, 2026", status: "Testing" },
  { id: 5, task: "Payment gateway integration",   projectName: "E-Commerce Platform",     module: "Product Catalog", assigneeIds: ["sarah"],              assigneeAvatar: "", priority: "Low",  startDate: "May 1, 2026",   endDate: "Jun 30, 2026", status: "Planning"    },
  { id: 6, task: "Order management CRUD",         projectName: "E-Commerce Platform",     module: "Product Catalog", assigneeIds: ["jon", "sarah"],       assigneeAvatar: "", priority: "High", startDate: "May 1, 2026",   endDate:"Jun 30, 2026", status: "Review"      },
  { id: 7, task: "Product reviews section",      projectName: "E-Commerce Platform",      module: "Checkout Flow",   assigneeIds: ["sara_ahmed", "jon", "peter", "sarah"], assigneeAvatar: "", priority: "Medium",startDate: "May 1, 2026", endDate: "Jun 30, 2026", status: "Completed" },
];

export const KANBAN_COLUMNS = [
  { id: "New",         label: "New"         },
  { id: "Assigned",    label: "Assigned"    },
  { id: "In Progress", label: "In Progress" },
  { id: "Review",      label: "Review"      },
  { id: "Completed",   label: "Completed"   },
];