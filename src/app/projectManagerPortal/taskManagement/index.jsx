import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import KanbanView         from "./kanbanView";
import ListView           from "./listView";
import AddTaskDialog      from "./addTaskDialog";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import { mockTasks }      from "./mockTasks";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const TaskManagement = () => {
  const [view,         setView]         = useState("kanban");
  const [filters,      setFilters]      = useState({});
  const [tasks,        setTasks]        = useState(mockTasks);
  const [taskOpen,     setTaskOpen]     = useState(false);
  const [editingTask,  setEditingTask]  = useState(null);
  const [deleteSuccess,setDeleteSuccess]= useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  const confirmRef = useRef();

  const filteredTasks = tasks.filter((t) => {
    const search   = filters.search?.toLowerCase()   || "";
    const project  = filters.project                 || "";
    const priority = filters.priority                || "";
    const status   = filters.status                  || "";
    const matchSearch   = !search   || t.title.toLowerCase().includes(search);
    const matchProject  = !project  || t.project.toLowerCase().replace(/ /g, "_").includes(project);
    const matchPriority = !priority || t.priority.toLowerCase() === priority;
    const matchStatus   = !status   || t.status.toLowerCase().replace(/ /g, "_") === status;
    return matchSearch && matchProject && matchPriority && matchStatus;
  });

  const handleMenuAction = (action, row) => {
    if (action === "edit") {
      setEditingTask(row);
      setTaskOpen(true);
    }
    if (action === "delete") {
      confirmRef.current?.open({
        title:       "Delete Task?",
        description: "This action cannot be undone.",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: () => {
          setTasks((prev) => prev.filter((t) => t.id !== row.id));
          setDeleteSuccess(true);
        },
      });
    }
    if (action === "view") console.log("View:", row);
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Task Management" subtitle="Manage and track all your tasks" />
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
                  filter: view === "kanban" ? "brightness(0) invert(1)" : "none"
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
                  filter: view === "list" ? "brightness(0) invert(1)" : "none"
                }} />
              }
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
              btnLabel="+ Add New Task"
              variant="gradient"
              handlePressBtn={() => { setEditingTask(null); setTaskOpen(true); }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <Filter mode="task_management" onFilterChange={setFilters} />

      {/* ── View ───────────────────────────────────────────────────────── */}
      {view === "kanban"
        ? <KanbanView tasks={filteredTasks} />
        : <ListView   tasks={filteredTasks} onMenuAction={handleMenuAction} />
      }

      {/* ── Add / Edit Task dialog ──────────────────────────────────────── */}
      <AddTaskDialog
        open={taskOpen}
        onClose={() => { setTaskOpen(false); setEditingTask(null); }}
        onSave={(data) => {
          console.log("Save task:", data);
          setSaveSuccess(true);
        }}
        editingTask={editingTask}
      />

      {/* ── Delete confirmation ─────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmRef} />

      {/* ── Success popups ──────────────────────────────────────────────── */}
      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message={editingTask ? "Task updated successfully" : "Task added successfully"}
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Task Deleted"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default TaskManagement;