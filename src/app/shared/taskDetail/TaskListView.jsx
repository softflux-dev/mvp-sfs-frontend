// src/components/shared/TaskListView.jsx

import { Box } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";
import ViewIcon from "../../../assets/icons/view.svg";

// Employee columns (view only)
const EMP_HEADERS = [
  { id: "task",        label: "Task"         },
  { id: "projectName", label: "Project Name" },
  { id: "module",      label: "Module"       },
  { id: "assignees",   label: "Assignees"    },
  { id: "priority",    label: "Priority"     },
  { id: "startDate",   label: "Start Date"   },
  { id: "endDate",     label: "End Date"     },
  { id: "taskStatus",  label: "Task Status"  },
  { id: "actions",     label: "Actions"      },
];

const EMP_DISPLAY = [
  "task", "projectName", "module", "task_assignees",
  "task_priority", "task_start_date", "task_end_date",
  "project_status", "perf_view",
];

// PM/Admin columns (view + edit + delete)
const PM_HEADERS = [
  { id: "task",        label: "Task"         },
  { id: "projectName", label: "Project Name" },
  { id: "module",      label: "Module"       },
  { id: "assignees",   label: "Assignees"    },
  { id: "priority",    label: "Priority"     },
  { id: "startDate",   label: "Start Date"   },
  { id: "endDate",     label: "End Date"     },
  { id: "taskStatus",  label: "Task Status"  },
  { id: "actions",     label: "Actions"      },
];

const PM_DISPLAY = [
  "task", "projectName", "module", "task_assignees",
  "task_priority", "task_start_date", "task_end_date",
  "project_status", "actions_menu",
];

const PM_MENU = [
  { value: "view",   label: "View"                     },
  { value: "edit",   label: "Edit"                     },
  { value: "delete", label: "Delete", color: "#FF0000" },
];

/**
 * Shared task list view for employee, PM, and admin.
 *
 * Props:
 *   role        — "employee" | "pm" | "admin"  (default "employee")
 *   tasks       — array of task rows
 *   loading     — boolean
 *   onViewClick — (row) => void  (employee)
 *   onMenuAction— (action, row) => void  (pm/admin)
 */
const TaskListView = ({
  role         = "employee",
  tasks        = [],
  loading      = false,
   stages       = [],
  onViewClick,
  onMenuAction,
}) => {
  const isEmployee = role === "employee";

  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
      <PaginatedTable
        tableHeader={isEmployee ? EMP_HEADERS : PM_HEADERS}
        tableData={tasks}
        stages={stages}
        displayRows={isEmployee ? EMP_DISPLAY : PM_DISPLAY}
        isLoading={loading}
        // employee props
        {...(isEmployee && {
          viewIcon: ViewIcon,
          onViewClick,
        })}
        // pm/admin props
        {...(!isEmployee && {
          menuOptions:  PM_MENU,
          onMenuAction,
        })}
      />
    </Box>
  );
};

export default TaskListView;