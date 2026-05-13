import { useState } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText    from "../../../components/headerText";
import CustomButton  from "../../../components/customButton";
import Filter        from "../../../components/filterBar/filter";
import TaskKanbanView from "./taskKanbanView";
import TaskListView   from "./taskListView";
import { empMockTasks } from "./empMockTasks";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const MyTasks = () => {
  const navigate = useNavigate();
  const [view,    setView]    = useState("kanban");
  const [filters, setFilters] = useState({});

  const filteredTasks = empMockTasks.filter((t) => {
    const search   = filters.search?.toLowerCase() || "";
    const status   = filters.status                || "";
    const priority = filters.priority              || "";
    const project  = filters.project              || "";

    const matchSearch   = !search   || t.title.toLowerCase().includes(search);
    const matchStatus   = !status   || t.status.toLowerCase().replace(/ /g, "_") === status;
    const matchPriority = !priority || t.priority.toLowerCase() === priority;
    const matchProject  = !project  || t.project.toLowerCase().replace(/ /g, "_").includes(project);

    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
              startIcon={
                <img src={KanbanIcon} alt="kanban" style={{
                  width: 16, height: 16,
                  filter: view === "kanban" ? "brightness(0) invert(1)" : "none",
                }} />
              }
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
              btnLabel="List"
              variant={view === "list" ? "gradient" : "button"}
              handlePressBtn={() => setView("list")}
              startIcon={
                <img src={ListIcon} alt="list" style={{
                  width: 16, height: 16,
                  filter: view === "list" ? "brightness(0) invert(1)" : "none",
                }} />
              }
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <Filter mode="emp_my_tasks" onFilterChange={setFilters} />

      {/* ── View ───────────────────────────────────────────────────────── */}
      {view === "kanban"
        ? <TaskKanbanView tasks={filteredTasks} />
        : <TaskListView
            tasks={filteredTasks}
            onViewClick={(row) => navigate(`/emp/tasks/${row.id}`, { state: { task: row } })}
          />
      }
    </>
  );
};

export default MyTasks;