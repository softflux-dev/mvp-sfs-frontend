import { useState } from "react";
import { Box, IconButton, Typography, Chip, Avatar, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton    from "../../../components/customButton";
import TextInput       from "../../../components/textInput";
import AttachmentCard  from "../../../components/cards/attachmentCard";
import AddTaskDialog   from "./addTaskDialog";
import SuccessPopup    from "../../../components/popups/confirmationDialog";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";
import editIcon from "../../../assets/icons/edit-icon.svg";

// ── Status / Priority configs ─────────────────────────────────────────────
const STATUS_CONFIG = {
  "New":         { bg: "#2B6EFF1A", color: "#2B6EFF" },
  "Assigned":    { bg: "#AA24931A", color: "#AA2493" },
  "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
  "Review":      { bg: "#9E9E9E1A", color: "#9E9E9E" },
  "Completed":   { bg: "#04C3731A", color: "#04C373" },
};

const PRIORITY_CONFIG = {
  High:   { bg: "#04C3731A", color: "#04C373" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
};

// ── Mock attachments ──────────────────────────────────────────────────────
const mockAttachments = [
  { id: 1, fileName: "wireframe-v2.fig",    fileSize: "installation-guide.pdf" },
  { id: 2, fileName: "requirements.pdf",    fileSize: "installation-guide.pdf" },
];

// ── Mock activity log ─────────────────────────────────────────────────────
const mockActivity = [
  { id: 1, text: "Status changed to In Progress", by: "Priya Patel", date: "2026-03-18 09:30" },
  { id: 2, text: "Task assigned to Priya Patel",  by: "You",         date: "2026-03-18 09:30" },
  { id: 3, text: "Task created",                  by: "You",         date: "2026-03-18 09:30" },
];

// ── Mock comments ─────────────────────────────────────────────────────────
const mockComments = [
  { id: 1, author: "Priya Patel",  avatar: "", text: "Started working on the grid layout. Will share progress by EOD.", date: "2026-03-18 09:30" },
  { id: 2, author: "Sarah Chen",   avatar: "", text: "Make sure to include the quick-view modal.",                       date: "2026-03-18 09:30" },
];

const TaskDetail = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const task      = location.state?.task || {};

  const [editOpen,     setEditOpen]     = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [comment,      setComment]      = useState("");
  const [comments,     setComments]     = useState(mockComments);

  const statusCfg   = STATUS_CONFIG[task.status]     || { bg: "#F5F5F5", color: "#757575" };
  const priorityCfg = PRIORITY_CONFIG[task.priority] || { bg: "#F5F5F5", color: "#757575" };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id:     Date.now(),
        author: "You",
        avatar: "",
        text:   comment.trim(),
        date:   new Date().toISOString().slice(0, 16).replace("T", " "),
      },
    ]);
    setComment("");
  };

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
          Back to Projects
        </Typography>
      </Box>

      {/* ── Task header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          p: "20px 24px",
          mb: 3,
        }}
      >
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box>
            {/* Status chip */}
            <Chip
              label={task.status || "New"}
              sx={{
                height: "22px", fontSize: "11px", fontWeight: 500,
                px: 0.5, borderRadius: "6px", mb: 1,
                backgroundColor: statusCfg.bg, color: statusCfg.color,
              }}
            />
            <Typography fontSize="22px" fontWeight={700} color="text.primary" mb={0.5}>
              {task.title || "Design CRM dashboard wireframes"}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontSize="13px" color="text.secondary">
                {task.project || "CRM Dashboard"}
              </Typography>
              <Typography fontSize="13px" color="text.secondary">·</Typography>
              <Typography fontSize="13px" color="text.secondary">
                {task.module || "UI Design"}
              </Typography>
              <Chip
                label={task.priority || "Medium"}
                sx={{
                  height: "20px", fontSize: "11px", fontWeight: 500,
                  px: 0.5, borderRadius: "6px",
                  backgroundColor: priorityCfg.bg, color: priorityCfg.color,
                }}
              />
            </Box>
          </Box>

          <CustomButton
            btnLabel="Edit Task"
            variant="gradientText"
            handlePressBtn={() => setEditOpen(true)}
            startIcon={
              <img src={editIcon} alt="edit" style={{ width: 15, height: 15 }} />
            }
          />
        </Box>
      </Box>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* ── LEFT column ──────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Description */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Description
            </Typography>
            <Box
              sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: "12px",
                p: 2,
              }}
            >
              <Typography fontSize="13px" color="text.secondary" lineHeight={1.7}>
                {task.description || "Create a responsive product listing page with filters, sorting, and pagination. Must support grid and list views."}
              </Typography>
            </Box>
          </Box>

          {/* Attachments */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Attachments
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {mockAttachments.map((att) => (
                <AttachmentCard
                  key={att.id}
                  fileName={att.fileName}
                  fileSize={att.fileSize}
                  onDownload={() => console.log("Download:", att.fileName)}
                />
              ))}
            </Box>
          </Box>

          {/* Activity Log */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Activity Log
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {mockActivity.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                    px: 2, py: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box
                      sx={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        flexShrink: 0, mt: 0.5,
                      }}
                    />
                    <Box>
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">
                        {item.text}
                      </Typography>
                      <Typography fontSize="11px" color="text.secondary">
                        {item.by}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography fontSize="11px" color="text.secondary" whiteSpace="nowrap">
                    {item.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Discussion */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Discussion
            </Typography>

            {/* Comments list */}
            <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
              {comments.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                    px: 2, py: 1.5,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={c.avatar}
                        sx={{
                          width: 28, height: 28,
                          background: "linear-gradient(135deg, #AA2493, #022179)",
                          fontSize: "11px", fontWeight: 600,
                        }}
                      >
                        {c.author?.charAt(0)}
                      </Avatar>
                      <Typography fontSize="13px" fontWeight={600} color="text.primary">
                        {c.author}
                      </Typography>
                    </Box>
                    <Typography fontSize="11px" color="text.secondary">
                      {c.date}
                    </Typography>
                  </Box>
                  <Typography fontSize="12px" color="text.secondary" ml={4.5}>
                    {c.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Comment input */}
            <Box sx={{ position: "relative" }}>
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
                  btnLabel="Send"
                  variant="gradient"
                  handlePressBtn={handleSendComment}
                  startIcon={<Send size={14} />}
                />
              </Box>
            </Box>
          </Box>

        </Grid>

        {/* ── RIGHT column — Task Info ──────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              p: 3,
              position: "sticky",
              top: 24,
            }}
          >
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2.5}>
              Task Info
            </Typography>

            {[
              {
                label: "Assigned To",
                content: (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar
                      src={task.assigneeAvatar || ""}
                      sx={{
                        width: 24, height: 24,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        fontSize: "10px", fontWeight: 600,
                      }}
                    >
                      {(task.assigneeName || "S")?.charAt(0)}
                    </Avatar>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {task.assigneeName || "Sarah Johnson"}
                    </Typography>
                  </Box>
                ),
              },
              { label: "Deadline",     value: task.deadline    || "2026-04-05"  },
              { label: "Created By",   value: "You"                             },
              { label: "Created Date", value: "2026-03-16"                      },
              { label: "Module",       value: task.module      || "UI Design"   },
            ].map((item) => (
              <Box key={item.label} mb={2}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                  {item.label}
                </Typography>
                {item.content || (
                  <Typography fontSize="13px" fontWeight={600} color="text.primary">
                    {item.value}
                  </Typography>
                )}
              </Box>
            ))}

            {/* Priority chip */}
            <Box>
              <Typography fontSize="11px" color="text.secondary" mb={0.5}>
                Priority
              </Typography>
              <Chip
                label={task.priority || "Medium"}
                sx={{
                  height: "24px", fontSize: "12px", fontWeight: 500,
                  px: 1, borderRadius: "8px",
                  backgroundColor: priorityCfg.bg, color: priorityCfg.color,
                }}
              />
            </Box>
          </Box>
        </Grid>

      </Grid>

      {/* ── Edit Task dialog ─────────────────────────────────────────────── */}
      <AddTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => { console.log("Updated:", data); setSaveSuccess(true); }}
        editingTask={task}
      />

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

export default TaskDetail;