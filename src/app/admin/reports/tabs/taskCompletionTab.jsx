import { useState } from "react";
import { Box, Grid, MenuItem } from "@mui/material";

import Filter from "../../../../components/filterBar/filter";
import CustomSelect          from "../../../../components/customSelect";
import PaginatedTable        from "../../../../components/dynamicTable";
import GlobalStyle           from "../../../../style/style";
import TaskStatusBreakdownChart from "./taskStatusBreakdownChart";

// ── Mock data ──────────────────────────────────────────────────────────────
const mockTasks = [
  { id: 1,  taskName: "Build API Endpoints",        project: "E-Commerce Platform",  assigneeName: "Ali Hassan",   dueDate: "Jun 30, 2026", status: "In Progress" },
  { id: 2,  taskName: "Design Product Pages",       project: "E-Commerce Platform",  assigneeName: "Omar Farooq",  dueDate: "Jun 30, 2026", status: "Review"      },
  { id: 3,  taskName: "Payment Integration",        project: "E-Commerce Platform",  assigneeName: "Usman Shah",   dueDate: "Jun 30, 2026", status: "New"         },
  { id: 4,  taskName: "Write Test Cases",           project: "HR Management System", assigneeName: "Fatima Khan",  dueDate: "Jun 30, 2026", status: "In Progress" },
  { id: 5,  taskName: "User Authentication Module", project: "HR Management System", assigneeName: "Ali Hassan",   dueDate: "Jun 30, 2026", status: "Completed"   },
  { id: 6,  taskName: "Database Schema Design",     project: "Mobile Banking App",   assigneeName: "Usman Shah",   dueDate: "Jun 30, 2026", status: "In Progress" },
  { id: 7,  taskName: "UI Mockups Review",          project: "CMS Website Redesign", assigneeName: "Omar Farooq",  dueDate: "Jun 30, 2026", status: "Completed"   },
  { id: 8,  taskName: "Performance Optimization",   project: "E-Commerce Platform",  assigneeName: "Bilal Raza",   dueDate: "Jun 30, 2026", status: "Completed"   },
  { id: 9,  taskName: "Mobile Responsive Design",   project: "CMS Website Redesign", assigneeName: "Omar Farooq",  dueDate: "Jun 30, 2026", status: "New"         },
  { id: 10, taskName: "Security Audit",             project: "HR Management System", assigneeName: "Fatima Khan",  dueDate: "Jun 30, 2026", status: "Review"      },
];

const tableHeader = [
  { id: "taskName",     label: "Task"     },
  { id: "project",      label: "Project"  },
  { id: "assigneeName", label: "Assignee" },
  { id: "dueDate",      label: "Due Date" },
  { id: "status",       label: "Status"   },
];

const displayRows = [
  "task_name",
  "task_project",
  "task_assignee",
  "task_due_date",
  "task_status_chip",
];

const TaskCompletionTab = () => {
  const [project,   setProject]   = useState("");
  const [dateRange, setDateRange] = useState(null);

  return (
    
      <Box>
         {/* Filters row */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
         <Filter
         mode="task_completion" onFilterChange={(f) => setFilters(f)}/>
          </Box>
    

        {/* ── Chart + Table row ─────────────────────────────────────────── */}
        <Grid container spacing={3}>
          {/* Donut chart */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, height: "100%" }}>
              <TaskStatusBreakdownChart />
            </Box>
          </Grid>

          {/* Table */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
              <PaginatedTable
                tableHeader={tableHeader}
                tableData={mockTasks}
                displayRows={displayRows}
                isLoading={false}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
  
  );
};

export default TaskCompletionTab;