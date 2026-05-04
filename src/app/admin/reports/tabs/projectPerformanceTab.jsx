import { Box } from "@mui/material";
import Filter         from "../../../../components/filterBar/filter";
import PaginatedTable from "../../../../components/dynamicTable";

const mockProjects = [
  { id: 1,  projectName: "E-Commerce Platform",  pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",   progress: 87 },
  { id: 2,  projectName: "HR Management System", pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",     progress: 87 },
  { id: 3,  projectName: "Mobile Banking App",   pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Development",  progress: 87 },
  { id: 4,  projectName: "Mobile Banking App",   pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Testing",      progress: 87 },
  { id: 5,  projectName: "CMS Website Redesign", pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",     progress: 0  },
  { id: 6,  projectName: "Inventory Tracker",    pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Review",       progress: 0  },
  { id: 7,  projectName: "HR Management System", pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",    progress: 87 },
  { id: 8,  projectName: "HR Management System", pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",    progress: 87 },
  { id: 9,  projectName: "Inventory Tracker",    pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Review",       progress: 0  },
  { id: 10, projectName: "CMS Website Redesign", pm: "Sara Ahmed", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",     progress: 0  },
];

const tableHeader = [
  { id: "projectName", label: "Project"    },
  { id: "pm",          label: "PM"         },
  { id: "startDate",   label: "Start Date" },
  { id: "endDate",     label: "End Date"   },
  { id: "status",      label: "Status"     },
  { id: "progress",    label: "Progress"   },
];

const displayRows = [
  "proj_name",
  "proj_pm",
  "proj_start_date",
  "proj_end_date",
  "project_status",
  "progress_bar",
];

const ProjectPerformanceTab = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Filter mode="project_performance" onFilterChange={(f) => console.log(f)} />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockProjects}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>
    </Box>
  );
};

export default ProjectPerformanceTab;