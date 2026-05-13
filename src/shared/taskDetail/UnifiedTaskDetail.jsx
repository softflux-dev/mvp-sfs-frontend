import { useState } from "react";
import { Box, IconButton, Typography, Avatar, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

import CustomButton        from "../../components/customButton";
import TextInput           from "../../components/textInput";
import AttachmentCard      from "../../components/cards/attachmentCard";
import SuccessPopup        from "../../components/popups/confirmationDialog";
import EmpTaskDetailHeader from "../../app/empPortal/myTasks/empTaskDetailHeader";
import EmpTaskSidebar from "../../app/empPortal/myTasks/empTaskSidebar";

import backIcon from "../../assets/icons/downlaod-back-btn.svg";
import editIcon from "../../assets/icons/edit-icon.svg";

const mockAttachments = [
  { id: 1, fileName: "wireframe-v2.fig",  fileSize: "installation-guide.pdf" },
  { id: 2, fileName: "requirements.pdf",  fileSize: "installation-guide.pdf" },
];
const mockActivity = [
  { id: 1, text: "Status changed to In Progress", by: "Priya Patel", date: "2026-03-18 09:30" },
  { id: 2, text: "Task assigned to Priya Patel",  by: "You",         date: "2026-03-18 09:30" },
  { id: 3, text: "Task created",                  by: "You",         date: "2026-03-18 09:30" },
];
const mockComments = [
  { id: 1, author: "Priya Patel", avatar: "", text: "Started working on the grid layout. Will share progress by EOD.", date: "2026-03-18 09:30" },
  { id: 2, author: "Sarah Chen",  avatar: "", text: "Make sure to include the quick-view modal.", date: "2026-03-18 09:30" },
];

/**
 * UnifiedTaskDetail
 *
 * Props injected via React Router location.state:
 *   task      — the task object
 *   canEdit   — boolean: show Edit Task button (admin/PM only)
 *   sidebar   — optional JSX: right-column content (emp passes EmpTaskSidebar, admin/PM pass TaskInfoSidebar)
 *   EditDialog — optional component: the Add/Edit dialog (admin/PM only)
 *   backLabel — optional string: back button label
 */
const UnifiedTaskDetail = ({
  EditDialog,
  backLabel = "Back",
}) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const task      = location.state?.task    || {};
  const canEdit   = location.state?.canEdit ?? false;

  const [editOpen,    setEditOpen]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [comment,     setComment]     = useState("");
  const [comments,    setComments]    = useState(mockComments);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, {
      id: Date.now(), author: "You", avatar: "",
      text: comment.trim(),
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
    }]);
    setComment("");
  };

  return (
    <>
      {/* Back */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          {backLabel}
        </Typography>
      </Box>

      {/* Header + optional Edit button */}
      <Box sx={{ position: "relative" }}>
        <EmpTaskDetailHeader task={task} />
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
                {task.description || "Create a responsive product listing page with filters, sorting, and pagination. Must support grid and list views."}
              </Typography>
            </Box>
          </Box>

          {/* Attachments */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={1.5}>Attachments from PM</Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {mockAttachments.map((att) => (
                <AttachmentCard key={att.id} fileName={att.fileName} fileSize={att.fileSize}
                  onDownload={() => console.log("Download:", att.fileName)} />
              ))}
            </Box>
          </Box>

          {/* Comments */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Comments & Discussion</Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
              {comments.map((c) => (
                <Box key={c.id} sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={c.avatar} sx={{ width: 32, height: 32, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600 }}>
                        {c.author?.charAt(0)}
                      </Avatar>
                      <Typography fontSize="13px" fontWeight={600}>{c.author}</Typography>
                    </Box>
                    <Typography fontSize="11px" color="text.secondary">{c.date}</Typography>
                  </Box>
                  <Typography fontSize="12px" color="text.secondary" ml={5}>{c.text}</Typography>
                </Box>
              ))}
            </Box>
            <TextInput placeholder="Write a comment..." value={comment}
              onChange={(e) => setComment(e.target.value)}
              inputBgColor="#F5F5F5" fullWidth multiline rows={3}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
            />
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <CustomButton btnLabel="Send" variant="gradient" handlePressBtn={handleSendComment}
                startIcon={<Send size={14} />} />
            </Box>
          </Box>

          {/* Activity Log */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
            <Typography fontSize="16px" fontWeight={700} mb={2}>Activity Log</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {mockActivity.map((item) => (
                <Box key={item.id} sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #AA2493, #022179)", flexShrink: 0, mt: 0.5 }} />
                    <Box>
                      <Typography fontSize="13px" fontWeight={500}>{item.text}</Typography>
                      <Typography fontSize="11px" color="text.secondary">{item.by}</Typography>
                    </Box>
                  </Box>
                  <Typography fontSize="11px" color="text.secondary" whiteSpace="nowrap">{item.date}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
        <EmpTaskSidebar
            task={task}
            onStatusUpdate={(status) => console.log("Status updated:", status)}
        />
        </Grid>


      </Grid>

      {/* Edit dialog — admin/PM only */}
      {canEdit && EditDialog && (
        <EditDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(data) => { console.log("Updated:", data); setSaveSuccess(true); setEditOpen(false); }}
          editingTask={task}
        />
      )}

      <SuccessPopup open={saveSuccess} onClose={() => setSaveSuccess(false)}
        message="Task updated successfully" autoClose autoCloseDelay={2000} />
    </>
  );
};

export default UnifiedTaskDetail;