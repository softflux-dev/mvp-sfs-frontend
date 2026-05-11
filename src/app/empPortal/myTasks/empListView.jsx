import { Box } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";
import { empMockTasks } from "./empMockTasks";
import ViewIcon from "../../../assets/icons/view.svg";

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
  "perf_view",   // eye icon only — employee can only view, not edit/delete
];

const EmpListView = ({ tasks = empMockTasks, onViewClick }) => {
  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={tasks}
        displayRows={displayRows}
        isLoading={false}
        viewIcon={ViewIcon}
        onViewClick={onViewClick}
      />
    </Box>
  );
};

export default EmpListView;