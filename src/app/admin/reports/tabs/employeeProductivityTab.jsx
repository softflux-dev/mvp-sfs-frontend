// tabs/employeeProductivityTab.jsx
import { useState } from "react";
import { Box, Grid, MenuItem, Avatar, Typography } from "@mui/material";
import Filter from "../../../../components/filterBar/filter";
import CustomSelect    from "../../../../components/customSelect";
import PaginatedTable  from "../../../../components/dynamicTable";
import GlobalStyle     from "../../../../style/style";
import ProjectProgressChart from "../../dashboard/projectProgressChart";
import EmployeeProductivityChart from "./employeeProductivityChart";



// ── Mock data ──────────────────────────────────────────────────────────────
const mockProductivity = [
  { id: 1, name: "Ali Hassan",   avatar: "", assigned: 2, completed: 1, delayed: 0, avgTime: "1.6d", completionRate: 87 },
  { id: 2, name: "Sara Ahmed",   avatar: "", assigned: 0, completed: 0, delayed: 0, avgTime: "2.5d", completionRate: 87 },
  { id: 3, name: "Omar Farooq",  avatar: "", assigned: 3, completed: 1, delayed: 2, avgTime: "1.4d", completionRate: 87 },
  { id: 4, name: "Fatima Khan",  avatar: "", assigned: 2, completed: 0, delayed: 0, avgTime: "2.4d", completionRate: 87 },
  { id: 5, name: "Bilal Raza",   avatar: "", assigned: 1, completed: 0, delayed: 0, avgTime: "2.0d", completionRate: 0  },
  { id: 6, name: "Ali Azeem",    avatar: "", assigned: 0, completed: 6, delayed: 0, avgTime: "1.0d", completionRate: 0  },
  { id: 7, name: "Usman Shah",   avatar: "", assigned: 2, completed: 0, delayed: 1, avgTime: "3.6d", completionRate: 87 },
];

const tableHeader = [
  { id: "name",           label: "Employee"   },
  { id: "assigned",       label: "Assigned"   },
  { id: "completed",      label: "Completed"  },
  { id: "delayed",        label: "Delayed"    },
  { id: "avgTime",        label: "Avg Time"   },
  { id: "completionRate", label: "Rate"       },
];

const displayRows = [
  "perf_member",
  "perf_assigned",
  "perf_completed",
  "perf_delayed",
  "perf_avg_time",
  "perf_completion_rate",
];

const EmployeeProductivityTab = () => {
  const [department, setDepartment] = useState("");
  const [dateRange,  setDateRange]  = useState(null);

  return (
   
      <Box>
          {/* Filters row */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
         <Filter
         mode="employee_productivity" onFilterChange={(f) => setFilters(f)}/>
          </Box>
        {/* ── Chart ────────────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, mb: 3 }}>
        

          {/* Reuse the existing ProjectProgressChart */}
          <EmployeeProductivityChart />

        </Box>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={mockProductivity}
            displayRows={displayRows}
            isLoading={false}
          />
        </Box>
      </Box>
   
  );
};

export default EmployeeProductivityTab;