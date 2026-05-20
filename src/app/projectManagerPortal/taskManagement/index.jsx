import { useRef,useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import KanbanView         from "./kanbanView";
//import ListView           from "./listView";
import TaskListView from "../../../shared/taskDetail/TaskListView";
import AddTaskDialog      from "./addTaskDialog";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import { usePMTasks }     from "../../../hooks/task";
import { getEmployeesApi } from "../../../api/modules/employee";
import { getPMProjectsApi } from "../../../api/modules/project";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const TaskManagement = () => {
  const navigate = useNavigate();
  const [projects,  setProjects]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [view,          setView]          = useState("kanban");
  const [taskOpen,      setTaskOpen]      = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [saveSuccess,   setSaveSuccess]   = useState(false);

  const confirmRef = useRef();

   useEffect(() => {
    getPMProjectsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjects(res.data.data.projects || []);
      }
    });

    getEmployeesApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setEmployees(res.data.data.employees || []);
      }
    });
  }, []);

  const {
    tasks,
    loading,
    actionLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    handleFilterChange,
  } = usePMTasks();

 const handleSave = async (data) => {
  const payload = {
    title:       data.title,
    module:      data.module       || null,
    department:  data.department   || null,
    assignees:   data.assigneeIds  || [],
    priority:    data.priority     || "medium",
    status:      data.pipelineStatus || "planning",
    taskStatus:  data.taskStatus   || "new",
    startDate:   data.startDate    || null,
    endDate:     data.endDate      || null,
    description: data.description  || "",
  };

  let result;
  if (editingTask) {
    result = await updateTask(
      editingTask.projectId || editingTask.project,
      editingTask._id || editingTask.id,
      payload
    );
  } else {
    result = await createTask(data.project, payload);
  }

  if (result?.success) {
    setSaveSuccess(true);
    setTaskOpen(false);      
    setEditingTask(null);    
  }
};

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
        onConfirm: async () => {
          const result = await deleteTask(row.projectId || row.project, row._id || row.id);
          if (result?.success) setDeleteSuccess(true);
        },
      });
    }
    if (action === "view") {
      navigate(`/pm-tasks/${row.id || row._id}`, { state: { task: row, canEdit: true, role: "pm" } });
    }
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
            <CustomButton
              btnLabel="+ Add New Task"
              variant="gradient"
              handlePressBtn={() => { setEditingTask(null); setTaskOpen(true); }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <Filter mode="task_management" 
      projects={projects} 
      employees={employees}
      onFilterChange={(f) => handleFilterChange({
          search:     f.search     || "",
          taskStatus: f.status     || "",   
          priority:   f.priority   || "",
          project:    f.project    || "",
        })}
   />

      {/* ── View ───────────────────────────────────────────────────────── */}
      {view === "kanban"
        ? <KanbanView tasks={tasks} loading={loading} />
        : <TaskListView role="pm" tasks={tasks} loading={loading} onMenuAction={handleMenuAction} />
      }

      {/* ── Add / Edit Task dialog ──────────────────────────────────────── */}
      <AddTaskDialog
        open={taskOpen}
        onClose={() => { setTaskOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editingTask={editingTask}
        loading={actionLoading}
        projects={projects}
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