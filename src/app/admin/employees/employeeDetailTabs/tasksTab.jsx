import { useState } from "react";
import { Box, Typography } from "@mui/material";

import Filter         from "../../../../components/filterBar/filter";
import PaginatedTable from "../../../../components/dynamicTable";
import { useEmployeeTask } from "../../../../hooks/task";      // ← hook

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
  const { tasks, loading, error, fetchTasks } = useEmployeeTask(employee.id);
  const [filters, setFilters] = useState({});

  // client-side filter (no pagination needed for emp tasks)
  const filteredTasks = tasks.filter((t) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";

    const matchSearch =
      !search ||
      t.taskName?.toLowerCase().includes(search) ||
      t.project?.toLowerCase().includes(search);

    const matchStatus = !status ||
      t.status?.toLowerCase().replace(/\s/g, "_") === status;

    return matchSearch && matchStatus;
  });

  // map API shape → table row shape
  const tableData = tasks
    .filter((t) => {
      const search = filters.search?.toLowerCase() || "";
      const status = filters.status || "";
      const matchSearch = !search ||
        t.title?.toLowerCase().includes(search) ||
        t.project?.projectName?.toLowerCase().includes(search);
      const matchStatus = !status || t.status === status;
      return matchSearch && matchStatus;
    })
    .map((t) => ({
      id:       t._id,
      taskName: t.title,
      project:  t.project?.projectName || "—",
      module:   t.module?.title        || "—",
      priority: t.priority
        ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
        : "—",
      status: t.status
        ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
        : "—",
    }));

  return (
    <Box sx={{ mt: 2 }}>

      {error && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      <Filter mode="employee_tasks" onFilterChange={setFilters} />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
        />
      </Box>

    </Box>
  );
};

export default TasksTab;