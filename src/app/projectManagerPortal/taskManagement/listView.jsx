import { Box } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";
import { MoreVerticalIcon } from "lucide-react";
import { mockTasks } from "./mockTasks";

const tableHeader = [
  { id: "title",    label: "Task Title" },
  { id: "project",  label: "Project"   },
  { id: "module",   label: "Module"    },
  { id: "assignee", label: "Assignee"  },
  { id: "priority", label: "Priority"  },
  { id: "status",   label: "Status"    },
  { id: "deadline", label: "Deadline"  },
  { id: "actions",  label: "Actions"   },
];

const displayRows = [
  "task_list_title",
  "task_list_project",
  "task_list_module",
  "task_assignee",
  "task_list_priority",
  "task_list_status",
  "task_list_deadline",
  "actions_menu",
];

const menuOptions = [
  { value: "view",   label: "View"                    },
  { value: "edit",   label: "Edit"                    },
  { value: "delete", label: "Delete", color: "#FF0000" },
];

const ListView = ({ tasks = mockTasks, onMenuAction }) => {
  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={tasks}
        displayRows={displayRows}
        isLoading={false}
        menuIcon={MoreVerticalIcon}
        menuOptions={menuOptions}
        onMenuAction={onMenuAction}
      />
    </Box>
  );
};

export default ListView;