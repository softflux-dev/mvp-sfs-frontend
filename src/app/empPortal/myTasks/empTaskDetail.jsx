import { useState } from "react";
import { Box, IconButton, Typography, Avatar, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton         from "../../../components/customButton";
import TextInput            from "../../../components/textInput";
import SuccessPopup         from "../../../components/popups/confirmationDialog";
import EmpTaskDetailHeader  from "./empTaskDetailHeader";
import EmpSubmitWork        from "./empSubmitWork";
import EmpTaskSidebar       from "./empTaskSidebar";
import AttachmentCard from "../../../components/cards/attachmentCard";
import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

// ── Mock activity log ─────────────────────────────────────────────────────
const mockActivity = [
  { id: 1, text: "Status changed to In Progress", by: "Priya Patel", date: "2026-03-18 09:30" },
  { id: 2, text: "Task assigned to Priya Patel",  by: "You",         date: "2026-03-18 09:30" },
  { id: 3, text: "Task created",                  by: "You",         date: "2026-03-18 09:30" },
];

// ── Mock comments ─────────────────────────────────────────────────────────
const mockComments = [
  { id: 1, author: "Priya Patel", avatar: "", text: "Started working on the grid layout. Will share progress by EOD.", date: "2026-03-18 09:30" },
  { id: 2, author: "Sarah Chen",  avatar: "", text: "Make sure to include the quick-view modal.",                       date: "2026-03-18 09:30" },
];

const EmpTaskDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task     = location.state?.task || {};

  const [comment,      setComment]      = useState("");
  const [comments,     setComments]     = useState(mockComments);
  const [sendSuccess,  setSendSuccess]  = useState(false);
  const [submitSuccess,setSubmitSuccess]= useState(false);

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
    setSendSuccess(true);
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
          Back to My Tasks
        </Typography>
      </Box>

      {/* ── Task header (title + meta row) ───────────────────────────────── */}
      <EmpTaskDetailHeader task={task} />

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
                {task.description ||
                  "Create a responsive product listing page with filters, sorting, and pagination. Must support grid and list views."}
              </Typography>
            </Box>
          </Box>

          {/* 2. Attachments from PM */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1.5}>
              Attachments from PM
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <AttachmentCard
                fileName="wireframe-v2.fig"
                fileSize="installation-guide.pdf"
                onDownload={() => console.log("Download wireframe")}
              />
              <AttachmentCard
                fileName="requirements.pdf"
                fileSize="installation-guide.pdf"
                onDownload={() => console.log("Download requirements")}
              />
            </Box>
          </Box>

          {/* 3. Comments & Discussion */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Comments & Discussion
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
              {comments.map((c) => (
                <Box key={c.id} sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={c.avatar}
                        sx={{
                          width: 32, height: 32,
                          background: "linear-gradient(135deg, #AA2493, #022179)",
                          fontSize: "13px", fontWeight: 600,
                        }}
                      >
                        {c.author?.charAt(0)}
                      </Avatar>
                      <Typography fontSize="13px" fontWeight={600} color="text.primary">
                        {c.author}
                      </Typography>
                    </Box>
                    <Typography fontSize="11px" color="text.secondary">{c.date}</Typography>
                  </Box>
                  <Typography fontSize="12px" color="text.secondary" ml={5}>{c.text}</Typography>
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
                btnLabel="Send"
                variant="gradient"
                handlePressBtn={handleSendComment}
                startIcon={<Send size={14} />}
              />
            </Box>
          </Box>

          {/* 4. Activity Log */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Activity Log
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {mockActivity.map((item) => (
                <Box
                  key={item.id}
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
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">{item.text}</Typography>
                      <Typography fontSize="11px" color="text.secondary">{item.by}</Typography>
                    </Box>
                  </Box>
                  <Typography fontSize="11px" color="text.secondary" whiteSpace="nowrap">{item.date}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

        </Grid>

        {/* ── RIGHT column — Status + Time Tracker + Manual Entry + Logs ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <EmpTaskSidebar
            task={task}
            onStatusUpdate={(status) => console.log("Status updated:", status)}
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
      <SuccessPopup
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
        message="Work submitted successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default EmpTaskDetail;