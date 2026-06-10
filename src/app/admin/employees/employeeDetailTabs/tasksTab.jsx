// src/app/admin/employees/employeeDetailTabs/tasksTab.jsx — FULL REPLACEMENT
import { useState, useEffect, useMemo } from "react";
import { Box, Typography }              from "@mui/material";

import Filter         from "../../../../components/filterBar/filter";
import PaginatedTable from "../../../../components/dynamicTable";
import { useEmployeeTask }   from "../../../../hooks/task";
import { getProjectByIdApi } from "../../../../api/modules/project";

const tableHeader = [
  { id: "task",      label: "Task"        },
  { id: "project",   label: "Project"     },
  { id: "module",    label: "Module"      },
  { id: "priority",  label: "Priority"    },
  { id: "status",    label: "Task Status" },
];

const displayRows = [
  "task",
  "projectName",
  "module",
  "task_priority",
  "project_status",
];

const TasksTab = ({ employee = {} }) => {
  const { tasks, loading, error } = useEmployeeTask(employee.id);

  const [selectedProject, setSelectedProject] = useState("");
  const [filters,         setFilters]         = useState({ search: "", status: "" });

  // ── per-project stages map: { projectId: stages[] } ──────────────────────
  const [projectStages, setProjectStages] = useState({});

  // ── Derive unique projects from tasks ─────────────────────────────────────
  const projects = useMemo(() => Array.from(
    new Map(
      tasks
        .filter((t) => t.project?._id || t.project)
        .map((t) => [
          t.project?._id || t.project,
          {
            _id:         t.project?._id  || t.project,
            projectName: t.project?.projectName || t.project || "—",
          },
        ])
    ).values()
  ), [tasks]);

  // ── Stable project ids string — only changes when projects list changes ───
  const projectIds = projects.map((p) => p._id).join(",");

  // ── Fetch stages for ALL projects once they are known ─────────────────────
  useEffect(() => {
    if (!projectIds) return;
    Promise.all(
      projects.map((p) =>
        getProjectByIdApi(p._id)
          .then((res) => ({
            id:     p._id,
            stages: res?.data?.data?.project?.stages || [],
          }))
          .catch(() => ({ id: p._id, stages: [] }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ id, stages }) => { map[id] = stages; });
      setProjectStages(map);
    });
  }, [projectIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Active stages ─────────────────────────────────────────────────────────
  // Selected project → that project's stages
  // No project selected → merge all stages from all projects (deduplicated by id)
  const activeStages = useMemo(() => {
    if (selectedProject) {
      return projectStages[selectedProject] || [];
    }
    // Merge all stages, deduplicate by stage id
    const merged = new Map();
    Object.values(projectStages).forEach((stages) => {
      stages.forEach((s) => { if (!merged.has(s.id)) merged.set(s.id, s); });
    });
    return Array.from(merged.values());
  }, [selectedProject, projectStages]);

  // ── Map tasks → table rows ────────────────────────────────────────────────
  const tableData = tasks
    .filter((t) => {
      const search = filters.search?.toLowerCase() || "";
      const status = filters.status || "";

      const matchProject = !selectedProject ||
        (t.project?._id || t.project) === selectedProject;

      const matchSearch = !search ||
        t.title?.toLowerCase().includes(search) ||
        (t.project?.projectName || "").toLowerCase().includes(search);

      const matchStatus = !status || t.status === status;

      return matchProject && matchSearch && matchStatus;
    })
    .map((t) => ({
      id:          t._id,
      task:        t.title || "—",
      projectName: t.project?.projectName || t.project || "—",
      module:      t.module?.title        || t.module  || "—",
      priority:    t.priority
        ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
        : "—",
      status:      t.status || "",   // raw stage id — project_status chip resolves via activeStages
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

      <Filter
        mode="employee_tasks"
        projects={projects}
        stages={activeStages}
        onFilterChange={(f) => {
          setSelectedProject(f.project || "");
          setFilters({
            search: f.search || "",
            status: f.status || "",
          });
        }}
      />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          stages={activeStages}
        />
      </Box>

    </Box>
  );
};

export default TasksTab;