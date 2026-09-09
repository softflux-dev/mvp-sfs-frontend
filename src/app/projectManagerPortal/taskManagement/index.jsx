// src/app/projectManagerPortal/taskManagement/taskManagement.jsx —
import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography }       from "@mui/material";
import { useNavigate }                 from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import KanbanView         from "./kanbanView";
import TaskListView       from "../../shared/taskDetail/TaskListView";
import AddTask            from "../../admin/projects/projectDetailTabs/addTask";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import { usePMTasks }     from "../../../hooks/task";
import { getPMProjectsApi, getPMProjectByIdApi, getProjectTeamApi } from "../../../api/modules/project";
import { uploadTaskAttachmentUrlApi }             from "../../../api/modules/task";

import KanbanIcon from "../../../assets/icons/kanban-active.svg";
import ListIcon   from "../../../assets/icons/tasks-inactive.svg";

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const TaskManagement = () => {
  const navigate = useNavigate();

  const [projects,        setProjects]        = useState([]);
  const [stages,          setStages]          = useState(DEFAULT_STAGES);
  const [selectedProject, setSelectedProject] = useState("");
  const [view,            setView]            = useState("kanban");
  const [taskOpen,        setTaskOpen]        = useState(false);
  const [editingTask,     setEditingTask]      = useState(null);
  const [deleteSuccess,   setDeleteSuccess]   = useState(false);
  const [saveSuccess,     setSaveSuccess]     = useState(false);
  const [apiError,        setApiError]        = useState("");
  const [projectTeamForFilter, setProjectTeamForFilter] = useState([]);


  const confirmRef = useRef();

  const {
    tasks, loading, actionLoading, error,
    fetchTasks, createTask, updateTask, deleteTask, handleFilterChange,
  } = usePMTasks();

  useEffect(() => {
    getPMProjectsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setProjects(res.data.data.projects || []);
      }
    });
  }, []);

  // ── Table data ────────────────────────────────────────────────────────────
  const tableData = tasks.map((t) => ({
    id:              t.id || t._id,
    taskId:          t.taskId || "", 
    task:            t.task,
    title:           t.title,
    projectName:     t.projectName,
    projectId:       t.projectId,
    module:          t.module,
    moduleId:        t.moduleId,
    assignees:       t.assignees,
    assigneeIds:     t.assigneeIds,
    assigneeNames:   t.assigneeNames,
    assigneeAvatars: t.assigneeAvatars || [],
    priority:        t.priority,
    startDate:       t.startDate,
    endDate:         t.endDate,
    startDateRaw:    t.startDateRaw,
    endDateRaw:      t.endDateRaw,
    status:          t.status,
    taskStatus:      t.taskStatus,
    description:     t.description,
    attachments:     t.attachments ?? 0,
    comments:        t.comments    ?? 0,
  }));

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setApiError("");
    const projectId = formData.project || editingTask?.projectId || editingTask?.project;

    const payload = {
      title:       formData.title,
      module:      formData.module      || null,
      department:  formData.department  || null,
      assignees:   formData.assigneeIds || [],
      priority:    formData.priority    || "medium",
      status:      formData.status      || stages[0]?.id || "stage_1",
      startDate:   formData.startDate   ? new Date(formData.startDate).toISOString() : null,
      endDate:     formData.endDate     ? new Date(formData.endDate).toISOString()   : null,
      description: formData.description || "",
      link:        formData.link        || "",
    };

    let result;
    if (editingTask) {
      result = await updateTask(projectId, editingTask._id || editingTask.id, payload);
    } else {
      result = await createTask(projectId, payload);
    }

    if (result?.success) {
      // Upload new Cloudinary attachments
      const newAtts = (formData.attachments || []).filter((a) => !a.isExisting && a.url);
      if (newAtts.length) {
        const taskId = editingTask?.id || editingTask?._id || result.data?.task?._id;
        if (taskId) {
          for (const att of newAtts) {
            try {
              await uploadTaskAttachmentUrlApi(projectId, taskId, {
                fileName: att.fileName,
                url:      att.url,
                publicId: att.publicId,
                fileSize: att.fileSize,
              });
            } catch (err) {
              console.error("Attachment upload failed:", err.message);
            }
          }
        }
      }
      setSaveSuccess(true);
      setTaskOpen(false);
      setEditingTask(null);
      setApiError("");
      fetchTasks();
    } else {
      setApiError(result?.message || "Failed to save task.");
    }
  };

  // ── Menu actions ──────────────────────────────────────────────────────────
  const handleMenuAction = (action, row) => {
    if (action === "view") {
      navigate(`/pm-tasks/${row.id || row._id}`, { state: { task: row, canEdit: true, role: "pm" } });
    }
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
  };

  return (
    <>
      {/* Header */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Task Management" subtitle="Manage and track all your tasks" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton
              btnLabel="Kanban" variant={view === "kanban" ? "gradient" : "button"}
              handlePressBtn={() => setView("kanban")}
              startIcon={<img src={KanbanIcon} alt="kanban" style={{ width: 16, height: 16, filter: view === "kanban" ? "brightness(0) invert(1)" : "none" }} />}
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
              btnLabel="List" variant={view === "list" ? "gradient" : "button"}
              handlePressBtn={() => setView("list")}
              startIcon={<img src={ListIcon} alt="list" style={{ width: 16, height: 16, filter: view === "list" ? "brightness(0) invert(1)" : "none" }} />}
              sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
              btnLabel="+ Add New Task" variant="gradient"
              handlePressBtn={() => { setEditingTask(null); setTaskOpen(true); }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Filters */}
      <Filter
        mode="task_management"
        projects={projects}
        employees={projectTeamForFilter}
        stages={stages}
        onFilterChange={(f) => {
          setSelectedProject(f.project || "");
         if (f.project) {
            getPMProjectByIdApi(f.project).then((res) => {
              if (res?.status === 200 || res?.status === 201) {
                const s = res.data.data.project?.stages;
                setStages(s?.length ? s : DEFAULT_STAGES);
              }
            });
            
            // Also fetch team for assignees filter
           getProjectTeamApi(f.project).then((res) => {
            if (res?.status === 200 || res?.status === 201) {
              const team = res.data.data.team || [];
              setProjectTeamForFilter(
                team.map((m) => ({
                  _id:      m._id,
                  fullName: m.fullName || m.name || "",  // ← handle both field names
                }))
              );
            }
          });
          } else {
            setStages(DEFAULT_STAGES);
            setProjectTeamForFilter([]);
          }
          handleFilterChange({
            search:     f.search   || "",
            status: f.status   || "",
            priority:   f.priority || "",
            project:    f.project  || "",
          });
        }}
      />

      {/* View */}
      {!selectedProject ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <Typography fontSize="14px" color="text.secondary">
            Please select a project to view tasks.
          </Typography>
        </Box>
      ) : view === "kanban"
        ? <KanbanView tasks={tableData} loading={loading} stages={stages} onTaskStatusUpdated={fetchTasks} />
        : <TaskListView role="pm" tasks={tableData} loading={loading} stages={stages} onMenuAction={handleMenuAction} />
      }

      {/* Add / Edit Task dialog — with project selector */}
      <AddTask
        open={taskOpen}
        onClose={() => { setTaskOpen(false); setEditingTask(null); setApiError(""); }}
        onSave={handleSave}
        editingTask={editingTask}
        loading={actionLoading}
        apiError={apiError}
        role="pm" 
        showProjectSelector={true}
        projects={projects}
      />

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message={editingTask ? "Task updated successfully" : "Task added successfully"}
        autoClose autoCloseDelay={2000}
      />
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Task Deleted"
        autoClose autoCloseDelay={2000}
      />
    </>
  );
};

export default TaskManagement;