import { Box, Typography, Chip, Avatar } from "@mui/material";
import calendarIcon    from "../../assets/icons/date-icon.svg";
import commentIcon     from "../../assets/icons/message-icon.svg";
import attachmentIcon  from "../../assets/icons/attach-icon.svg"; 

const PRIORITY_CONFIG = {
  High:   { bg: "#04C3731A", color: "#04C373" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const PipelineCard = ({
  title        = "Create UI Dashboard",
  priority     = "Low",
  deadline     = "march 16",
  comments     = 5,
  attachments,           // optional — only shown when passed
  assignee     = "",
  assigneeName = "",
  project      = "",
}) => {
  const pcfg = PRIORITY_CONFIG[priority] || { bg: "#F5F5F5", color: "#757575" };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #F0F0F0",
        p: 1.5,
        cursor: "grab",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
      }}
    >
      {/* ── Priority chip + Assignee avatar ──────────────────────────────── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Chip
          label={priority}
          sx={{
            height: "20px", fontSize: "11px", fontWeight: 600,
            px: 0.5, borderRadius: "10px",
            backgroundColor: pcfg.bg, color: pcfg.color,
          }}
        />
        <Avatar
          src={assignee}
          alt={assigneeName}
          sx={{
            width: 28, height: 28,
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            fontSize: "11px", fontWeight: 600,
          }}
        >
          {assigneeName?.charAt(0) || "A"}
        </Avatar>
      </Box>

      {/* ── Title ────────────────────────────────────────────────────────── */}
      <Typography
        fontSize="13px" fontWeight={600} color="text.primary"
        mb={0.5} sx={{ lineHeight: 1.4 }}
      >
        {title}
      </Typography>

      {/* ── Project subtitle ─────────────────────────────────────────────── */}
      {project && (
        <Typography fontSize="11px" color="text.secondary" mb={1.5}>
          {project}
        </Typography>
      )}

      {/* ── Deadline + Comments + Attachments ────────────────────────────── */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Deadline */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <img src={calendarIcon} alt="date" style={{ width: 12, height: 12 }} />
          <Typography fontSize="11px" color="text.secondary">
            {deadline}
          </Typography>
        </Box>

        {/* Comments + Attachments on right */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <img src={commentIcon} alt="comments" style={{ width: 12, height: 12 }} />
            <Typography fontSize="11px" color="text.secondary">
              {comments}
            </Typography>
          </Box>

          {attachments !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <img src={attachmentIcon} alt="attachments" style={{ width: 12, height: 12 }} />
              <Typography fontSize="11px" color="text.secondary">
                {attachments}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PipelineCard;