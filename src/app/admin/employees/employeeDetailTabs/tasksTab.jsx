// employees/employeeDetailTabs/tasksTab.jsx
import { useState } from "react";
import { Box } from "@mui/material";
import Filter from "../../../../components/filterBar/filter";
import PaginatedTable from "../../../../components/dynamicTable";

// ── Mock tasks data — replace with real API data ──────────────────────────────
const mockTasks = [
  { id: 1,  taskName: "Build API Endpoints",          project: "E-Commerce Platform",  module: "Backend API",   priority: "High",   status: "In Progress" },
  { id: 2,  taskName: "User Authentication Module",   project: "HR Management System", module: "—",             priority: "High",   status: "Completed"   },
  { id: 3,  taskName: "Build API Endpoints",          project: "E-Commerce Platform",  module: "Backend API",   priority: "High",   status: "Completed"   },
  { id: 4,  taskName: "Design Dashboard UI",          project: "HR Management System", module: "Frontend",      priority: "Medium", status: "In Progress" },
  { id: 5,  taskName: "Write Unit Tests",             project: "E-Commerce Platform",  module: "QA",            priority: "Low",    status: "Completed"   },
  { id: 6,  taskName: "Database Schema Migration",    project: "E-Commerce Platform",  module: "Backend API",   priority: "High",   status: "Completed"   },
  { id: 7,  taskName: "Implement Notification System",project: "HR Management System", module: "Backend",       priority: "Medium", status: "In Progress" },
  { id: 8,  taskName: "Fix Login Bug",                project: "E-Commerce Platform",  module: "Auth",          priority: "High",   status: "Completed"   },
];

const tableHeader = [
  { id: "taskName", label: "Task"     },
  { id: "project",  label: "Project"  },
  { id: "module",   label: "Module"   },
  { id: "priority", label: "Priority" },
  { id: "status",   label: "Status"   },
];

const displayRows = [
  "task_name",
  "task_project",
  "task_module",
  "task_priority",
  "status_chip",
];

const TasksTab = ({ employee = {} }) => {
  const [filters, setFilters] = useState({});

  const filteredTasks = mockTasks.filter((t) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";

    const matchSearch =
      !search ||
      t.taskName.toLowerCase().includes(search) ||
      t.project.toLowerCase().includes(search);

    const matchStatus = !status || t.status.toLowerCase().replace(" ", "_") === status;

    return matchSearch && matchStatus;
  });

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <Filter mode="employee_tasks" onFilterChange={setFilters} />

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredTasks}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>

    </Box>
  );
};

export default TasksTab;