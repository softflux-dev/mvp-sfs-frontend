import { useState } from "react";
import { Box, IconButton, Typography, Avatar, Grid, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton        from "../../components/customButton";
import TextInput           from "../../components/textInput";
import AttachmentCard      from "../../components/cards/attachmentCard";
import SuccessPopup        from "../../components/popups/confirmationDialog";
import EmpTaskDetailHeader from "../../app/empPortal/myTasks/empTaskDetailHeader";
import EmpTaskSidebar      from "../../app/empPortal/myTasks/empTaskSidebar";
import AddTask       from "../../app/admin/projects/projectDetailTabs/addTask";
import AddTaskDialog from "../../app/projectManagerPortal/taskManagement/addTaskDialog";
import { useTaskDetail }   from "../../hooks/task";
import { downloadTaskAttachmentApi } from "../../api/modules/task";

import backIcon from "../../assets/icons/downlaod-back-btn.svg";
import editIcon from "../../assets/icons/edit-icon.svg";

/**
 * UnifiedTaskDetail
 *
 * Props injected via React Router location.state:
 *   task      — the task object (must include _id or id)
 *   canEdit   — boolean: show Edit Task button (admin/PM only)
 *   EditDialog — optional component: the Add/Edit dialog (admin/PM only)
 *   backLabel — optional string: back button label
 */
const UnifiedTaskDetail = ({ backLabel = "Back" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const task     = location.state?.task    || {};
  const canEdit  = location.state?.canEdit ?? false;
  const role = location.state?.role || "admin"; // "admin" | "pm"
  const EditDialog = role === "pm" ? AddTaskDialog : AddTask;


  const taskId = task?._id || task?.id;

  const {
    task:        taskDetail,
    comments,
    activityLogs,
    submissions,
    loading,
    commentLoading,
    statusLoading,
    submitLoading,
    error,
    sendComment,
    updateStatus,
    submitWork,
    fetchDetail,
  } = useTaskDetail(taskId);

 const displayTask = {
  ...(task || {}),       
  ...(taskDetail || {}), 
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
        <Typography
          fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          {backLabel}
        </Typography>
      </Box>

      {/* Header + optional Edit button */}
      <Box sx={{ position: "relative" }}>
        <EmpTaskDetailHeader task={displayTask} />
        {canEdit && (
          <Box sx={{ position: "absolute", top: 20, right: 24 }}>
            <CustomButton
              btnLabel="Edit Task"
              variant="gradientText"
              handlePressBtn={() => setEditOpen(true)}
              startIcon={<img src={editIcon} alt="edit" style={{ width: 15, height: 15 }} />}
            />
          </Box>
        )}
      </Box>

      {/* Main layout */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Description */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Description</Typography>
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
              <Typography fontSize="13px" color="text.secondary" lineHeight={1.7}>
                {displayTask.description ||
                  "Create a responsive product listing page with filters, sorting, and pagination. Must support grid and list views."}
              </Typography>
            </Box>
          </Box>

        
          {/* 2. Attachments */}
         {/* Attachments */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1.5}>
            Attachments
          </Typography>

          {!displayTask.attachments?.length ? (
            <Typography fontSize="13px" color="text.secondary">
              No attachments yet.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.5}>
              {displayTask.attachments.map((att) => {
                const uploaderName =
                  att.uploadedBy?.fullName ||
                  att.uploadedBy?.name     ||
                  "Unknown";

                const uploaderRole = att.uploadedBy?.role
                  ? ` (${att.uploadedBy.role.replace(/_/g, " ")})`
                  : "";

                const uploadedAt = att.uploadedAt
                  ? new Date(att.uploadedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })
                  : "";

                return (
                  <Box
                    key={att._id || att.id}
                    sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}
                  >
                    <AttachmentCard
                      fileName={att.fileName || att.name}
                      fileSize={att.fileSize || att.size}
                      onDownload={() => {
                        const url = downloadTaskAttachmentApi(
                          displayTask.projectId || displayTask.project,
                          taskId,
                          att._id || att.id
                        );
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
              <Box
                key={c._id || c.id || idx}
                sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5 }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={c.authorAvatar || c.author?.avatar || ""}
                      sx={{
                        width: 32, height: 32,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      {(c.authorName || c.author?.name || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {c.authorName || c.author?.name || c.author}
                    </Typography>
                  </Box>
                  <Typography fontSize="11px" color="text.secondary">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString()
                      : c.date}
                  </Typography>
                </Box>
                <Typography fontSize="12px" color="text.secondary" ml={5}>
                  {c.text}
                </Typography>
              </Box>
            ))}
            </Box>
            <TextInput
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              inputBgColor="#F5F5F5"
              fullWidth
              multiline
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <CustomButton
                btnLabel={commentLoading ? "Sending..." : "Send"}
                variant="gradient"
                handlePressBtn={handleSendComment}
                disabled={commentLoading}
                startIcon={<Send size={14} />}
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
                <Box
                  key={item._id || item.id || idx}
                  sx={{
                    backgroundColor: "#F5F5F5", borderRadius: "12px",
                    px: 2, py: 1.5, display: "flex",
                    alignItems: "flex-start", justifyContent: "space-between", gap: 2,
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box sx={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: "linear-gradient(135deg, #AA2493, #022179)",
                      flexShrink: 0, mt: 0.5,
                    }} />
                    <Box>
                      <Typography fontSize="13px" fontWeight={500}>{item.text || item.action}</Typography>
                      <Typography fontSize="11px" color="text.secondary">
                        {item.by || item.user?.name || "System"}
                      </Typography>
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
          />
        </Grid>
      </Grid>

      {canEdit && EditDialog && (
        <EditDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(data) => {
            setSaveSuccess(true);
            setEditOpen(false);
            fetchDetail();
          }}
          editingTask={displayTask}
          // PM dialog fetches projects internally; admin dialog needs these:
          moduleOptions={[]}
          departmentOptions={[]}
          deptEmployees={[]}
          allEmployees={[]}
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