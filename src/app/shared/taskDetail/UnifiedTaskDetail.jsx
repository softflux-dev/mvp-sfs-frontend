// src/shared/taskDetail/UnifiedTaskDetail.jsx — 
import { useState, useEffect } from "react";
import { Box, IconButton, Typography, Avatar, Grid, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton        from "../../../components/customButton";
import TextInput           from "../../../components/textInput";
import AttachmentCard      from "../../../components/cards/attachmentCard";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import EmpTaskDetailHeader from "../../empPortal/myTasks/empTaskDetailHeader";
import EmpTaskSidebar      from "../../empPortal/myTasks/empTaskSidebar";
import AddTask             from "../../admin/projects/projectDetailTabs/addTask";
import { useTaskDetail }   from "../../../hooks/task";
import { useModule }       from "../../../hooks/module";
import { useDepartment }   from "../../../hooks/department";
import { updateTaskApi }   from "../../../api/modules/task";
import { getProjectTeamApi, getProjectByIdApi, getPMProjectsApi } from "../../../api/modules/project";
import { downloadTaskAttachmentApi } from "../../../api/modules/task";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";
import editIcon from "../../../assets/icons/edit-icon.svg";

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const UnifiedTaskDetail = ({ backLabel = "Back" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const task    = location.state?.task    || {};
  const canEdit = location.state?.canEdit ?? false;
  const role    = location.state?.role    || "admin";
  const isAdmin = role === "admin";
  const isPM    = role === "pm";

  const taskId    = task?._id || task?.id;
  const projectId =
    task?.projectId      ||
    task?.project?._id   ||
    task?.project        ||
    "";

  // ── fetch task detail (stages come from backend now) ─────────────────────
  const {
    task: taskDetail, comments, activityLogs, submissions,
    stages: taskStages,                    
    loading, commentLoading, error,
    sendComment, updateStatus, submitWork, fetchDetail,
  } = useTaskDetail(taskId);

  // ── fetch supporting data for the edit dialog (admin/PM only) ────────────
  const { modules, loading: modulesLoading } = useModule(projectId);
  const { departments, fetchDepartments }    = useDepartment();
  const [teamMembers, setTeamMembers]        = useState([]);
  const [pmProjects,  setPmProjects]         = useState([]);
  const [editLoading, setEditLoading]        = useState(false);
  const [apiError,    setApiError]           = useState("");

  // Fallback stages for the edit dialog (admin/PM need these from project API)
  const [editStages, setEditStages] = useState(DEFAULT_STAGES);

  // ── Active stages — from task detail response (works for all roles) ───────
  const activeStages = taskStages?.length ? taskStages : editStages;

  useEffect(() => {
    if (!projectId || role === "employee") return;
    // Admin/PM: fetch team + project stages for the edit dialog
    Promise.all([
      getProjectTeamApi(projectId),
      getProjectByIdApi(projectId),
      fetchDepartments({ limit: 100 }),
    ]).then(([teamRes, projectRes]) => {
      if (teamRes?.status === 200 || teamRes?.status === 201) {
        setTeamMembers(teamRes.data.data.team || []);
      }
      if (projectRes?.status === 200 || projectRes?.status === 201) {
        const saved = projectRes.data.data.project?.stages;
        if (saved?.length) setEditStages(saved);
      }
    }).catch(() => {});
  }, [projectId, role]);

  useEffect(() => {
    if (!isPM) return;
    getPMProjectsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setPmProjects(res.data.data.projects || []);
      }
    });
  }, [isPM]);

  const teamEmployees = (Array.isArray(teamMembers) ? teamMembers : []).map((m) => ({
    _id:          m._id,
    fullName:     m.fullName || m.name,
    avatar:       m.avatar       || "",
    designation:  m.designation  || m.role || "",
    departmentId: m.departmentId || "",
  }));

  const teamDeptIds = [...new Set(teamMembers.map((m) => m.departmentId).filter(Boolean))];
  const teamDepts   = departments.filter((d) => teamDeptIds.includes(d._id));

  const createdLog = Array.isArray(activityLogs)
    ? activityLogs.find((l) => l.action?.toLowerCase().includes("task created"))
    : null;

  // ── displayTask ──────────────────────────────────────────────────────────
  const displayTask = {
    ...(task       || {}),
    ...(taskDetail || {}),
    module:      taskDetail?.module?.title        || taskDetail?.module || task?.module || "—",
    projectName: taskDetail?.project?.projectName || task?.projectName  || "—",
    startDate:   taskDetail?.startDate
      ? new Date(taskDetail.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : task?.startDate || "—",
    endDate:     taskDetail?.endDate
      ? new Date(taskDetail.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : task?.endDate || "—",
    deadline:    taskDetail?.endDate
      ? new Date(taskDetail.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : task?.deadline || task?.endDate || "—",
    startDateRaw: taskDetail?.startDate || task?.startDate || null,
    endDateRaw:   taskDetail?.endDate   || task?.endDate   || null,
    moduleId:     taskDetail?.module?._id  || task?.moduleId  || "",
    projectId:    taskDetail?.project?._id || task?.projectId || projectId,
    assigneeIds:    (Array.isArray(taskDetail?.assignees) ? taskDetail.assignees : Array.isArray(task?.assignees) ? task.assignees : []).map((a) => a._id || a),
    assigneeNames:  (Array.isArray(taskDetail?.assignees) ? taskDetail.assignees : Array.isArray(task?.assignees) ? task.assignees : []).map((a) => a.fullName || a.name || ""),
    assigneeAvatars:(Array.isArray(taskDetail?.assignees) ? taskDetail.assignees : Array.isArray(task?.assignees) ? task.assignees : []).map((a) => a.avatar || ""),
    departmentId: taskDetail?.department?._id || task?.departmentId || "",
    createdBy:
      taskDetail?.createdBy ||
      task?.createdBy ||
      (createdLog?.performedByName && createdLog.performedByName !== "System"
        ? { fullName: createdLog.performedByName }
        : null),
  };

  // ── Compute overdue live — don't rely solely on the cron-set isOverdue
  //    flag, since that only updates once daily and can lag behind reality.
  const isTaskOverdue = displayTask.taskStatus !== "completed"
    && displayTask.endDateRaw
    && new Date(displayTask.endDateRaw) < new Date()
    && !displayTask.deadlineExtended;

  const handleEditSave = async (formData) => {
    setEditLoading(true);
    setApiError("");
    try {
      const payload = {
        title:       formData.title,
        module:      formData.module      || null,
        department:  formData.department  || null,
        assignees:   formData.assigneeIds || [],
        priority:    formData.priority    || "medium",
        status:      formData.status      || activeStages[0]?.id || "stage_1",
        startDate:   formData.startDate   || null,
        endDate:     formData.endDate     || null,
        description: formData.description || "",
        link:        formData.link        || "",
      };
      const res = await updateTaskApi(projectId, taskId, payload);
      if (res?.status === 200 || res?.status === 201) {
        setSaveSuccess(true);
        setEditOpen(false);
        fetchDetail();
      } else {
        setApiError(res?.data?.message || "Failed to update task.");
      }
    } catch {
      setApiError("Something went wrong.");
    } finally {
      setEditLoading(false);
    }
  };

  const [editOpen,    setEditOpen]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [comment,     setComment]     = useState("");

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    await sendComment(comment.trim());
    setComment("");
  };

  if (loading && !taskDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Back */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography fontSize="14px" fontWeight={500} color="text.secondary" sx={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          {backLabel}
        </Typography>
      </Box>

      {/* Header — passes activeStages so stage chip resolves correctly */}
      <Box sx={{ position: "relative" }}>
        <EmpTaskDetailHeader task={displayTask} stages={activeStages} />
        {canEdit && (
          <Box sx={{ position: "absolute", top: 20, right: 24 }}>
            <CustomButton
              btnLabel="Edit Task"
              variant="gradientText"
              handlePressBtn={() => setEditOpen(true)}
              disabled={false}
              startIcon={<img src={editIcon} alt="edit" style={{ width: 15, height: 15 }} />}
            />
          </Box>
        )}
      </Box>

 {isTaskOverdue && canEdit && (
        <Box sx={{
          backgroundColor: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: "12px",
          p: 2, mb: 2, mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
        }}>
          <Typography fontSize="13px" color="#B45309" fontWeight={500}>
            This task is overdue. You can extend the deadline anytime by editing the task.
          </Typography>
          <CustomButton
            btnLabel="Extend Deadline"
            variant="gradientText"
            handlePressBtn={() => setEditOpen(true)}
          />
        </Box>
      )}


      {/* Main layout */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Description */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Description</Typography>
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
              <Typography fontSize="13px" color="text.secondary" lineHeight={1.7}>
                {displayTask.description || "No description provided."}
              </Typography>
            </Box>
          </Box>

          {/* Attachments */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1.5}>Attachments</Typography>
            {!displayTask.attachments?.length ? (
              <Typography fontSize="13px" color="text.secondary">No attachments yet.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1.5}>
                {displayTask.attachments.map((att) => {
                  const uploaderName =
                    att.uploadedBy?.fullName ||
                    att.uploadedBy?.name     ||
                    displayTask.createdBy?.fullName ||
                    displayTask.createdBy?.name     ||
                    "Unknown";
                  const uploaderRole = att.uploadedBy?.role ? ` (${att.uploadedBy.role.replace(/_/g, " ")})` : "";
                  const uploadedAt   = att.uploadedAt
                    ? new Date(att.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "";
                  return (
                    <Box key={att._id || att.id} sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}>
                      <AttachmentCard
                        fileName={att.fileName || att.name}
                        fileSize={att.fileSize || att.size}
                        onDownload={() => {
                          if (att.url) { window.open(att.url, "_blank"); return; }
                          const url = downloadTaskAttachmentApi(displayTask.projectId || displayTask.project, taskId, att._id || att.id);
                          window.open(url, "_blank");
                        }}
                      />
                      <Typography fontSize="11px" color="text.secondary" mt={0.5} ml={0.5}>
                        Uploaded by{" "}
                        <Typography component="span" fontSize="11px" fontWeight={600} color="text.primary">
                          {uploaderName}{uploaderRole}
                        </Typography>
                        {uploadedAt && ` · ${uploadedAt}`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Comments */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Comments & Discussion</Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
              {comments.length === 0 && (
                <Typography fontSize="13px" color="text.secondary">No comments yet.</Typography>
              )}
              {comments.map((c, idx) => (
                <Box key={c._id || c.id || idx} sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={c.authorAvatar || c.author?.avatar || ""}
                        sx={{ width: 32, height: 32, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}
                      >
                        {(c.authorName || c.author?.name || "?").charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography fontSize="13px" fontWeight={600} color="text.primary">
                        {c.authorName || c.author?.name || c.author}
                      </Typography>
                    </Box>
                    <Typography fontSize="11px" color="text.secondary">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : c.date}
                    </Typography>
                  </Box>
                  <Typography fontSize="12px" color="text.secondary" ml={5}>{c.text}</Typography>
                </Box>
              ))}
            </Box>
            <TextInput
              placeholder="Write a comment..." value={comment}
              onChange={(e) => setComment(e.target.value)}
              inputBgColor="#F5F5F5" fullWidth multiline rows={3}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
            />
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <CustomButton btnLabel={commentLoading ? "Sending..." : "Send"} variant="gradient"
                handlePressBtn={handleSendComment} disabled={commentLoading} startIcon={<Send size={14} />}
              />
            </Box>
          </Box>

          {/* Activity Log */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Activity Log</Typography>
            {activityLogs.length === 0 && (
              <Typography fontSize="13px" color="text.secondary">No activity yet.</Typography>
            )}
            <Box display="flex" flexDirection="column" gap={1}>
              {activityLogs.map((item, idx) => (
                <Box key={item._id || item.id || idx}
                  sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #AA2493, #022179)", flexShrink: 0, mt: 0.5 }} />
                    <Box>
                      <Typography fontSize="13px" fontWeight={500}>{item.text || item.action}</Typography>
                      <Typography fontSize="11px" color="text.secondary">{item.by || item.performedByName || "System"}</Typography>
                    </Box>
                  </Box>
                  <Typography fontSize="11px" color="text.secondary" whiteSpace="nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EmpTaskSidebar
            task={displayTask}
            onStatusUpdate={updateStatus}
            role={role}
            stages={activeStages}
            onSubmitSuccess={fetchDetail}
          />
        </Grid>
      </Grid>

      {canEdit && (
        <AddTask
          open={editOpen}
          onClose={() => { setEditOpen(false); setApiError(""); }}
          onSave={handleEditSave}
          editingTask={displayTask}
          loading={editLoading}
          apiError={apiError}
          role={role}
          projectId={isAdmin ? projectId : undefined}
          moduleOptions={modules}
          departmentOptions={teamDepts}
          teamEmployees={teamEmployees}
          stages={activeStages}
          projects={isPM ? pmProjects : undefined}
        />
      )}

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Task updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default UnifiedTaskDetail;