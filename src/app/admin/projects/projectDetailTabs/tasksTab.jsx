import { useState, useRef, useEffect } from "react";
import { Box, Typography }             from "@mui/material";
import { useNavigate }                 from "react-router-dom";

import CustomButton       from "../../../../components/customButton";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import AddTask            from "./addTask";
import { useTask }        from "../../../../hooks/task";
import { useModule }      from "../../../../hooks/module";
import { useDepartment }  from "../../../../hooks/department";
import { getProjectTeamApi } from "../../../../api/modules/project";
import { uploadTaskAttachmentUrlApi } from "../../../../api/modules/task";

const tableHeader = [
  { id: "task",       label: "Task"        },
  { id: "module",     label: "Module"      },
  { id: "assignees",  label: "Assignees"   },
  { id: "priority",   label: "Priority"    },
  { id: "startDate",  label: "Start Date"  },
  { id: "endDate",    label: "End Date"    },
  { id: "status",     label: "Task Status" },  // ← renamed from "Pipeline"
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "task",
  "module",
  "task_assignees",
  "task_priority",
  "task_start_date",
  "task_end_date",
  "project_status",  // ← this now resolves stage id → label via stages prop
  "actions_menu",
];

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const EmptyGuard = ({ title, subtitle }) => (
  <Box
    display="flex" flexDirection="column" alignItems="center"
    justifyContent="center" py={8} gap={1}
    sx={{ backgroundColor: "#fff", borderRadius: "25px" }}
  >
    <Typography fontSize={15} fontWeight={600} color="text.primary">{title}</Typography>
    <Typography fontSize={13} color="text.secondary">{subtitle}</Typography>
  </Box>
);

const TasksTab = ({
  project     = {},
  role        = "admin",
  stages      = DEFAULT_STAGES,
  teamMembers = [],
}) => {
  const navigate = useNavigate();
  const isAdmin  = role === "admin";

  const {
    tasks, loading, actionLoading, error,
    createTask, updateTask, deleteTask, handleFilterChange, fetchTasks,
  } = useTask(project.id);

  const { modules, loading: modulesLoading } = useModule(project.id);
  const { departments, fetchDepartments }    = useDepartment();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  // ── Live team — fetch if parent hasn't passed it yet ─────────────────────
  const [liveTeam,     setLiveTeam]     = useState(teamMembers);
  const [teamLoading,  setTeamLoading]  = useState(false);
  const [teamFetched,  setTeamFetched]  = useState(false);

  useEffect(() => {
    if (teamMembers.length) {
      setLiveTeam(teamMembers);
      setTeamFetched(true);
      return;
    }
    if (!project.id) return;
    setTeamLoading(true);
    getProjectTeamApi(project.id)
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setLiveTeam(res.data.data.team || []);
        }
      })
      .finally(() => {
        setTeamLoading(false);
        setTeamFetched(true);
      });
  }, [project.id, teamMembers]);

  useEffect(() => { fetchDepartments({ limit: 100 }); }, []);

  // ── Derive dept + employee options from team ──────────────────────────────
  const teamDeptIds = [...new Set(
    liveTeam.map((m) => m.departmentId).filter(Boolean)
  )];

  const teamDepts = departments.filter((d) => teamDeptIds.includes(d._id));

  const teamEmployees = liveTeam.map((m) => ({
    _id:          m._id,
    fullName:     m.fullName || m.name,
    avatar:       m.avatar       || "",
    designation:  m.role         || "",
    departmentId: m.departmentId || "",
  }));

  // ── Guards — only evaluated after both team + modules have loaded ─────────
  const isStillLoading = loading || modulesLoading || teamLoading || !teamFetched;
  const hasTeam        = liveTeam.length > 0;
  const hasModules     = modules.length > 0;

  const confirmDialogRef = useRef();

  // ── Table data — keep status raw (stage id) for chip resolution ───────────
  const tableData = tasks.map((t) => ({
    id:           t._id,
    projectId:    project.id,   
    task:         t.title,
    module:       t.module?.title || "—",
    moduleId:     t.module?._id   || "",
    assignees:    (t.assignees || []).map((a) => a.fullName || "").join(", ") || "—",
    assigneeIds:  (t.assignees || []).map((a) => a._id),
    assigneeNames:(t.assignees || []).map((a) => a.fullName || ""),
    assigneeAvatars: (t.assignees || []).map((a) => a.avatar || ""),
    priority:     t.priority
      ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "—",
    startDate:    t.startDate
      ? new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    endDate:      t.endDate
      ? new Date(t.endDate).toLocaleDateString("en-US",   { month: "short", day: "numeric", year: "numeric" }) : "—",
    startDateRaw: t.startDate || null,
    endDateRaw:   t.endDate   || null,
    status:       t.status    || "",    // ← raw stage id, resolved in table via stages prop
    taskStatus:   t.taskStatus
      ? t.taskStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—",
    departmentId: t.department?._id || "",
    description:  t.description    || "",
    link:         t.link            || "",
  }));

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit"                     },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  const handleMenuAction = (action, row) => {
      if (action === "view") {
      const route = isAdmin ? `/projects/tasks/${row.id}` : `/pm-tasks/${row.id}`;
      navigate(route, { state: { task: { ...row, projectId: project.id }, canEdit: true, role } });
    }
    if (action === "edit")  { setEditingTask(row); setModalOpen(true); }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Task?",
        description: `"${row.task}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteTask(row.id);
          if (result.success) { setSuccessMsg(result.message); setShowSuccess(true); }
          else setApiError(result.message);
        },
      });
    }
  };

const handleSave = async (formData) => {
  const payload = {
    title:       formData.title,
    module:      formData.module      || null,
    department:  formData.department  || null,
    assignees:   formData.assigneeIds || [],
    priority:    formData.priority    || "medium",
    status:      formData.status      || stages[0]?.id || "stage_1",
    startDate:   formData.startDate   || null,
    endDate:     formData.endDate     || null,
    description: formData.description || "",
    link:        formData.link        || "",
  };
 
  const result = editingTask
    ? await updateTask(editingTask.id, payload)
    : await createTask(payload);
 
  if (result.success) {
    // ── Upload Cloudinary attachments after task save ────────────────────
    const attachments = formData.attachments || [];
    if (attachments.length > 0) {
            const taskId = editingTask?.id || result.data?.task?._id;

      if (taskId) {
        for (const att of attachments) {
          try {
            await uploadTaskAttachmentUrlApi(project.id, taskId, {
              fileName: att.fileName,
              url:      att.url,
              publicId: att.publicId,
              fileSize: att.fileSize,
            });
          } catch (err) {
            console.error("Failed to save attachment:", err.message);
          }
        }
        await fetchTasks();
      }
    }
 
    setSuccessMsg(result.message);
    setShowSuccess(true);
    setModalOpen(false);
    setEditingTask(null);
    setApiError("");
  } else {
    setApiError(result.message);
  }
};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box flex={1}>
          <Filter
            mode="tasks"
            employees={teamEmployees}
            stages={stages}
            onFilterChange={(f) => {
              handleFilterChange({
                search:   f.search   || "",
                status:   f.status   || "",
                priority: f.priority || "",
                assignee: f.assignee || "",
              });
            }}
          />
        </Box>
        <CustomButton
          btnLabel="+ Add Task"
          variant="gradient"
          handlePressBtn={() => { setEditingTask(null); setModalOpen(true); }}
          disabled={!hasTeam || !hasModules}
        />
      </Box>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isStillLoading ? (
        // Show table skeleton while loading — prevents flash of empty guards
        <Box bgcolor="#fff" borderRadius="25px" p={1}>
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={[]}
            displayRows={displayRows}
            menuOptions={menuOptions}
            onMenuAction={handleMenuAction}
            isLoading={true}
            stages={stages}
          />
        </Box>
      ) : !hasTeam ? (
        <EmptyGuard
          title="No team assigned yet"
          subtitle='Go to the "Team" tab and add team members before creating tasks.'
        />
      ) : !hasModules ? (
        <EmptyGuard
          title="No modules created yet"
          subtitle='Go to the "Modules" tab and create at least one module before adding tasks.'
        />
      ) : (
        <Box bgcolor="#fff" borderRadius="25px" p={1}>
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={tableData}
            displayRows={displayRows}
            menuOptions={menuOptions}
            onMenuAction={handleMenuAction}
            isLoading={loading}
            stages={stages}   // ← passed so project_status chip resolves stage id → label
          />
        </Box>
      )}

      {/* ── Add / Edit Task dialog ────────────────────────────────────────── */}
      <AddTask
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); setApiError(""); }}
        onSave={handleSave}
        editingTask={editingTask}
        loading={actionLoading}
        apiError={apiError}
        moduleOptions={modules}
        departmentOptions={teamDepts}
        teamEmployees={teamEmployees}
        stages={stages}
        projectStartDate={project.startDate}
        projectEndDate={project.endDate}
      />

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default TasksTab;