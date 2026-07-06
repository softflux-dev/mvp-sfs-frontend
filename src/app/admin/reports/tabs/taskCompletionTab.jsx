// src/app/admin/reports/tabs/taskCompletionTab.jsx — 
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { FolderKanban } from "lucide-react";

import Filter                   from "../../../../components/filterBar/filter";
import PaginatedTable            from "../../../../components/dynamicTable";
import TaskStatusBreakdownChart  from "./taskStatusBreakdownChart";
import { getProjectsApi, getProjectByIdApi } from "../../../../api/modules/project";
import { getProjectTasksApi }                from "../../../../api/modules/task";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";

const STAGE_COLORS = ["#2B6EFF", "#AA2493", "#F97316", "#04C373", "#030229"];

const tableHeader = [
  { id: "taskName",      label: "Task"     },
  { id: "project",       label: "Project"  },
  { id: "assigneeNames", label: "Assignee" },
  { id: "dueDate",       label: "Due Date" },
  { id: "status",        label: "Status"   },
];

const displayRows = [
  "task_name",
  "task_project",
  "task_assignees",
  "task_due_date",
  "task_status_chip",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const SelectProjectEmptyState = ({ loading }) => (
  <Box sx={{
    backgroundColor: "#fff", borderRadius: "25px", p: 6,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: 320,
  }}>
    <Box sx={{
      width: 64, height: 64, borderRadius: "50%",
      background: "linear-gradient(135deg, #AA249320, #02217920)",
      display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
    }}>
      <FolderKanban size={28} color="#AA2493" />
    </Box>
    <Typography fontSize="16px" fontWeight={600} color="text.primary" mb={0.5}>
      {loading ? "Loading projects..." : "Select a Project"}
    </Typography>
    {!loading && (
      <Typography fontSize="13px" color="text.secondary" textAlign="center">
        Choose a project from the filter above to view its task completion data.
      </Typography>
    )}
  </Box>
);

const TaskCompletionTab = forwardRef((props, ref) => {
  const [projects,        setProjects]        = useState([]);
  const [loadingProjects, setLoadingProjects]  = useState(true);
  const [selectedProject, setSelectedProject]  = useState(null);
  const [stages,          setStages]           = useState([]);
  const [tasks,           setTasks]            = useState([]);
  const [loading,         setLoading]          = useState(false);

  useEffect(() => {
    getProjectsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjects(res.data.data.projects || []);
      }
    }).finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selectedProject?._id) {
      setStages([]);
      setTasks([]);
      return;
    }
    setLoading(true);

    Promise.all([
      getProjectByIdApi(selectedProject._id),
      getProjectTasksApi(selectedProject._id),
    ]).then(([projRes, tasksRes]) => {
      setStages(projRes?.data?.data?.project?.stages || []);
      setTasks(tasksRes?.data?.data?.tasks || []);
    }).finally(() => setLoading(false));
  }, [selectedProject?._id]);

  const stageCount = {};
  stages.forEach((s) => { stageCount[s.id] = 0; });
  tasks.forEach((t) => {
    if (stageCount[t.status] !== undefined) stageCount[t.status]++;
  });

  const chartData = stages.map((s, i) => ({
    name:  s.label,
    value: stageCount[s.id] || 0,
    color: STAGE_COLORS[i % STAGE_COLORS.length],
  }));

  const stageLabelMap = new Map(stages.map((s) => [s.id, s.label]));
  const tableData = tasks.map((t) => ({
    id:            t._id,
    taskName:      t.title,
    project:       selectedProject?.projectName || "—",
    assigneeNames: (t.assignees || []).map((a) => a.fullName || "").filter(Boolean),
    dueDate:       fmtDate(t.endDate),
    status:        stageLabelMap.get(t.status) || t.status,
  }));

  // ── Export ────────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportData: () => {
      if (!selectedProject) return;

      const doc = createReportDoc("Task Completion Report", selectedProject.projectName);

      const uniqueAssignees = new Set(
        tasks.flatMap((t) => (t.assignees || []).map((a) => a._id))
      ).size;

      let y = addSummaryCards(doc, [
        { label: "Total Tasks",  value: tasks.length },
        { label: "Stages",       value: stages.length },
        { label: "Assignees",    value: uniqueAssignees },
      ]);

      y = addReportTable(doc, {
        head: ["Stage", "Task Count"],
        body: chartData.map((c) => [c.name, String(c.value)]),
        startY: y,
      });

      addReportTable(doc, {
        head: ["Task", "Assignees", "Due Date", "Status"],
        body: tableData.map((t) => [
          t.taskName,
          t.assigneeNames.length ? t.assigneeNames.join(", ") : "Unassigned",
          t.dueDate,
          t.status,
        ]),
        startY: y + 8,
      });

      const safeName = selectedProject.projectName.replace(/\s+/g, "-").toLowerCase();
      savePdf(doc, `task-completion-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Filter
          mode="task_completion"
          projects={projects}
          onFilterChange={(f) => {
            const proj = f.project ? projects.find((p) => p._id === f.project) : null;
            setSelectedProject(proj);
          }}
        />
      </Box>

      {!selectedProject ? (
        <SelectProjectEmptyState loading={loadingProjects} />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, height: "100%" }}>
              <TaskStatusBreakdownChart data={chartData} loading={loading} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
              <PaginatedTable
                tableHeader={tableHeader}
                tableData={tableData}
                displayRows={displayRows}
                isLoading={loading}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
});

export default TaskCompletionTab;