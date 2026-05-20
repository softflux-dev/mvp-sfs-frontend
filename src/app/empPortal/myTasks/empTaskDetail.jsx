import { useState } from "react";
import { Box, IconButton, Typography, Avatar, Grid, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton        from "../../../components/customButton";
import TextInput           from "../../../components/textInput";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import EmpTaskDetailHeader from "./empTaskDetailHeader";
import EmpTaskSidebar      from "./empTaskSidebar";
import AttachmentCard      from "../../../components/cards/attachmentCard";
import { useTaskDetail }   from "../../../hooks/task";
import { downloadTaskAttachmentApi } from "../../../api/modules/task";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

const EmpTaskDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task     = location.state?.task || {};
  const taskId   = task?._id || task?.id;

  const {
    task:        taskDetail,
    comments,
    activityLogs,
    loading,
    commentLoading,
    error,
    sendComment,
    updateStatus,
  } = useTaskDetail(taskId);

  const displayTask = {
  ...(task || {}),        
  ...(taskDetail || {}),  
};

  const [comment,     setComment]     = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    const result = await sendComment(comment.trim());
    if (result?.success !== false) {
      setComment("");
      setSendSuccess(true);
    }
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
      {/* ── Back button ──────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography
          fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          Back to My Tasks
        </Typography>
      </Box>

      {/* ── Task header ───────────────────────────────────────────────────── */}
      <EmpTaskDetailHeader task={displayTask} />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* ── LEFT column ──────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* 1. Description */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Description
            </Typography>
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

          {/* 3. Comments & Discussion */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Comments & Discussion
            </Typography>
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
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); }
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

          {/* 4. Activity Log */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Activity Log
            </Typography>
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
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">
                        {item.text || item.action}
                      </Typography>
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

        {/* ── RIGHT column ────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <EmpTaskSidebar
            task={displayTask}
            onStatusUpdate={updateStatus}
          />
        </Grid>

      </Grid>

      {/* ── Success popups ──────────────────────────────────────────────── */}
      <SuccessPopup
        open={sendSuccess}
        onClose={() => setSendSuccess(false)}
        message="Comment sent"
        autoClose
        autoCloseDelay={1500}
      />
    </>
  );
};

export default EmpTaskDetail;