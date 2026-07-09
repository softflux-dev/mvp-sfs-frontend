// src/app/empPortal/myTasks/myTasks.jsx — 
import { useState, useEffect }   from "react";
import { Box, Grid, Typography }  from "@mui/material";
import { useNavigate }            from "react-router-dom";

import HeaderText     from "../../../components/headerText";
import CustomButton   from "../../../components/customButton";
import Filter         from "../../../components/filterBar/filter";
import TaskKanbanView from "./taskKanbanView";
import TaskListView   from "../../shared/taskDetail/TaskListView";
import { useMyTasks } from "../../../hooks/task";
import { getProjectByIdApi } from "../../../api/modules/project";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const MyTasks = () => {
  const navigate = useNavigate();

  const [view,            setView]            = useState("kanban");
  const [selectedProject, setSelectedProject] = useState("");
  const [stages,          setStages]          = useState(DEFAULT_STAGES);

  // ── Cache full project list — never shrinks on filter ─────────────────────
  const [allProjects, setAllProjects] = useState([]);

  const { tasks, loading, error, handleFilterChange, fetchTasks, projectStagesMap } = useMyTasks();

  // ── Build project list from initial unfiltered tasks ──────────────────────
  // Only update when we have tasks AND no project is selected yet
  // (so it doesn't re-derive to a single project after filtering)
  useEffect(() => {
    if (!selectedProject && tasks.length) {
      const derived = Array.from(
        new Map(
          tasks
            .filter((t) => t.projectName && t.projectName !== "—")
            .map((t) => [
              t.projectId || t.projectName,
              { _id: t.projectId || t.projectName, projectName: t.projectName },
            ])
        ).values()
      );
      if (derived.length > allProjects.length) {
        setAllProjects(derived);
      }
    }
  }, [tasks, selectedProject]);

  useEffect(() => {
  if (!selectedProject) {
    setStages(DEFAULT_STAGES);
    return;
  }
  const s = projectStagesMap[selectedProject];
  if (s?.length) {
    setStages(s);
  } else {
    setStages(DEFAULT_STAGES);
  }
}, [projectStagesMap, selectedProject]);

  // ── Filter tasks to selected project for display ──────────────────────────
  const displayTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject || t.project === selectedProject)
    : tasks;

  return (
    <>
      {/* Header */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="My Tasks" subtitle="View and track your assigned tasks" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton
              btnLabel="Kanban"
              variant={view === "kanban" ? "gradient" : "button"}
              handlePressBtn={() => setView("kanban")}
              startIcon={<img src={KanbanIcon} alt="kanban" style={{ width: 16, height: 16, filter: view === "kanban" ? "brightness(0) invert(1)" : "none" }} />}
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
              btnLabel="List"
              variant={view === "list" ? "gradient" : "button"}
              handlePressBtn={() => setView("list")}
              startIcon={<img src={ListIcon} alt="list" style={{ width: 16, height: 16, filter: view === "list" ? "brightness(0) invert(1)" : "none" }} />}
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Filter */}
      <Filter
        mode="emp_my_tasks"
        projects={allProjects}   // ← always full list, never shrinks
        stages={stages}
        onFilterChange={(f) => {
  setSelectedProject(f.project || "");
  handleFilterChange({
    search:   f.search   || "",
    status:   f.status   || "",
    priority: f.priority || "",
    project:  f.project  || "",
  });
}}
      />

      {/* Content */}
      {!selectedProject ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <Typography fontSize="14px" color="text.secondary">
            Please select a project to view tasks.
          </Typography>
        </Box>
      ) : view === "kanban"
        ? <TaskKanbanView
            tasks={displayTasks}
            loading={loading}
            stages={stages}
            onTaskStatusUpdated={fetchTasks}
          />
        : <TaskListView
            role="employee"
            tasks={displayTasks}
            loading={loading}
            stages={stages}
            onViewClick={(row) =>
              navigate(`/emp/tasks/${row._id || row.id}`, {
                state: { task: row, role: "employee" },
              })
            }
          />
      }
    </>
  );
};

export default MyTasks;