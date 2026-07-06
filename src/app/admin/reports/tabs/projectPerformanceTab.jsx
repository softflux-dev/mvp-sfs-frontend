// src/app/admin/reports/tabs/projectPerformanceTab.jsx — 
import { forwardRef, useImperativeHandle } from "react";
import { Box } from "@mui/material";
import Filter         from "../../../../components/filterBar/filter";
import PaginatedTable  from "../../../../components/dynamicTable";
import { useProject }  from "../../../../hooks/project";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";

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
  "project_progress",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const ProjectPerformanceTab = forwardRef((props, ref) => {
  const {
    projects,
    loading,
    pagination,
    handleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  } = useProject();

  const tableData = projects.map((proj) => ({
    id:             proj._id,
    projectName:    proj.projectName,
    pm:             proj.projectManager?.fullName || "—",
    startDate:      fmtDate(proj.startDate),
    endDate:        fmtDate(proj.endDate),
    status:         proj.status
      ? proj.status.charAt(0).toUpperCase() + proj.status.slice(1)
      : "—",
    progress:       proj.progress ?? 0,
    totalTasks:     proj.totalTasks     ?? 0,
    completedTasks: proj.completedTasks ?? 0,
  }));

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const doc = createReportDoc("Project Performance Report");

      const completed  = tableData.filter((p) => p.status === "Completed").length;
      const inProgress = tableData.filter((p) => p.status?.replace("_", " ") === "In progress").length;

      let y = addSummaryCards(doc, [
        { label: "Total Projects", value: pagination.total || tableData.length },
        { label: "Completed",      value: completed, color: [4, 195, 115] },
        { label: "In Progress",    value: inProgress, color: [255, 151, 47] },
      ]);

      addReportTable(doc, {
        head: ["Project", "PM", "Start Date", "End Date", "Status", "Progress"],
        body: tableData.map((p) => [
          p.projectName, p.pm, p.startDate, p.endDate, p.status, `${p.progress}%`,
        ]),
        startY: y,
      });

      savePdf(doc, `project-performance-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Filter
          mode="project_performance"
          onFilterChange={(f) => {
            handleFilterChange({
              search: f.search || "",
              status: f.status || "",
            });
          }}
        />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          totalCount={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Box>
  );
});

export default ProjectPerformanceTab;