import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText     from "../../../components/headerText";
import CustomButton   from "../../../components/customButton";
import Filter         from "../../../components/filterBar/filter";
import TaskKanbanView from "./taskKanbanView";
import TaskListView   from "../../../shared/taskDetail/TaskListView";
import { useMyTasks } from "../../../hooks/task";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const MyTasks = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("kanban");

  const { tasks, loading, error, handleFilterChange } = useMyTasks();

  // ── Derive unique projects from fetched tasks (no extra API call needed) ──
  const projects = Array.from(
    new Map(
      tasks
        .filter((t) => t.projectName && t.projectName !== "—")
        .map((t) => [t.projectId || t.projectName, { 
          _id: t.projectId || t.projectName, 
          projectName: t.projectName 
        }])
    ).values()
  );

  return (
    <>
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

      <Filter
        mode="emp_my_tasks"
        projects={projects}
        onFilterChange={(f) => handleFilterChange({
          search:     f.search   || "",
          taskStatus: f.status   || "",  
          priority:   f.priority || "",
          project:    f.project  || "",
        })}
      />

      {view === "kanban"
        ? <TaskKanbanView tasks={tasks} loading={loading} />
        : <TaskListView
            role="employee"
            tasks={tasks}
            loading={loading}
            onViewClick={(row) => navigate(`/emp/tasks/${row._id || row.id}`, { state: { task: row } })}
          />
      }
    </>
  );
};

export default MyTasks;