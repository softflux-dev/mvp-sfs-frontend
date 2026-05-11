import { Box } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";
import { MoreVerticalIcon } from "lucide-react";
import { mockTasks } from "./mockTasks";

const tableHeader = [
  { id: "task",      label: "Task"      },
   { id: "projectName",    label: "Project Name"    },
  { id: "module",    label: "Module"    },
  { id: "assignees", label: "Assignees" },
  { id: "priority",  label: "Priority"  },
  { id: "startDate", label: "Start Date" },
  { id: "endDate",  label: "End Date"  },
  { id: "status",    label: "Status"    },
  { id: "actions",   label: "Actions"   },
];

const displayRows = [
  "task",
  "projectName",
  "module",
  "task_assignees",   
  "task_priority",
  "task_start_date",
  "task_end_date",
  "project_status",
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