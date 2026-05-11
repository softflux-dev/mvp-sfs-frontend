import { Box, Typography } from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

const breakdownData = [
  { id: 1, taskName: "Design System Updates", project: "Project Alpha", hoursLogged: "2h 0m", percent: 87 },
  { id: 2, taskName: "API Integration",        project: "Project Alpha", hoursLogged: "2h 0m", percent: 87 },
  { id: 3, taskName: "Bug Fixes",              project: "Project Alpha", hoursLogged: "2h 0m", percent: 87 },
  { id: 4, taskName: "Code Review",            project: "Project Alpha", hoursLogged: "2h 0m", percent: 87 },
  { id: 5, taskName: "Documentation",          project: "Project Alpha", hoursLogged: "2h 0m", percent: 0  },
];

const tableHeader = [
  { id: "taskName",    label: "Task Name"     },
  { id: "project",     label: "Project"       },
  { id: "hoursLogged", label: "Hours Logged"  },
  { id: "percent",     label: "% Of Week"     },
];

const displayRows = [
  "bbt_task_name",
  "bbt_project",
  "bbt_hours_logged",
  "bbt_percent",
];

const BreakdownByTask = ({ data = breakdownData }) => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "25px",
      p: 2,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={1} px={1}>
        Breakdown by Task
      </Typography>

      <PaginatedTable
        tableHeader={tableHeader}
        tableData={data}
        displayRows={displayRows}
        isLoading={false}
        hidepagination={true}
      />
    </Box>
  );
};

export default BreakdownByTask;