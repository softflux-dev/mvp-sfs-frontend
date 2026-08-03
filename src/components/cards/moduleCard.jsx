import { useState } from "react";
import { Box, Typography, Chip, Avatar, AvatarGroup, IconButton } from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProgressBar from "../progressBar";

// ── Status color map ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Completed:    { bg: "#04C3731A", color: "#04C373" },
  Planning:     { bg: "#2B6EFF1A", color: "#2B6EFF" },
  Development:  { bg: "#FF972F1A", color: "#FF972F" },
  Testing:      { bg: "#AA24931A", color: "#AA2493" },
  Review:       { bg: "#FF972F1A", color: "#FF972F" },
  "In Progress":{ bg: "#AA24931A", color: "#AA2493" },
};

// ── Plan status map ────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  none:            { bg: "#F5F5F5",   color: "#9CA3AF", label: "No plan yet"       },
  usecases_draft:  { bg: "#FEF3C7",   color: "#D97706", label: "Use cases drafted" },
  flowchart_ready: { bg: "#DBEAFE",   color: "#2563EB", label: "Flowchart ready"   },
  tasks_generated: { bg: "#04C3731A", color: "#04C373", label: "Tasks generated"   },
};

const ModuleCard = ({
  title        = "Product Catalog",
  description  = "Product listing and detail pages",
  status       = "Planning",
  tasksLabel   = "8/12 tasks",
  progress     = 87,
  members      = [],
  categoryLabel = "",
  planStatus   = "none",
  onEdit,
  onDelete,
  onViewDetail,
  showActions,
}) => {
  const [hovered, setHovered] = useState(false);
  const statusCfg = STATUS_CONFIG[status] || { bg: "#F5F5F5", color: "#757575" };
  const planCfg   = PLAN_CONFIG[planStatus] || PLAN_CONFIG.none;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        border: "1px solid #F0F0F0",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
      }}
    >
      {/* Title + Status chip */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Typography fontSize="15px" fontWeight={700} color="text.primary">{title}</Typography>
        <Chip
          label={status}
          sx={{ height: "22px", fontSize: "11px", fontWeight: 500, px: 0.5, borderRadius: "8px",
                flexShrink: 0, backgroundColor: statusCfg.bg, color: statusCfg.color }}
        />
      </Box>

      {/* Category + Plan status chips */}
      <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
        {categoryLabel && (
          <Chip label={categoryLabel}
            sx={{ height: "20px", fontSize: "10px", fontWeight: 500, px: 0.5, borderRadius: "8px",
                  backgroundColor: "#F3E8FB", color: "#AA2493" }} />
        )}
        <Chip label={planCfg.label}
          sx={{ height: "20px", fontSize: "10px", fontWeight: 500, px: 0.5, borderRadius: "8px",
                backgroundColor: planCfg.bg, color: planCfg.color }} />
      </Box>

      {/* Description */}
      <Typography fontSize="12px" color="text.secondary" lineHeight={1.5}>{description}</Typography>

      {/* Tasks label */}
      <Typography fontSize="12px" fontWeight={500} color="text.secondary">{tasksLabel}</Typography>

      {/* Progress bar */}
      <ProgressBar value={progress} showPercentage percentage={`${progress}%`} height={6} sx={{ mb: 0 }} />

      {/* Members + Actions */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {members.length > 0 ? (
          <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "11px" } }}>
            {members.map((src, i) => <Avatar key={i} src={src} sx={{ width: 28, height: 28 }} />)}
          </AvatarGroup>
        ) : (
          <Typography fontSize="11px" color="text.secondary">No assignees</Typography>
        )}

        <Box display="flex" gap={0.5} sx={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease" }}>
          <IconButton size="small" onClick={onEdit}
            sx={{ color: "#888", "&:hover": { color: "#AA2493", backgroundColor: "#AA24930F" } }}>
            <Edit2 size={15} />
          </IconButton>
          <IconButton size="small" onClick={onDelete}
            sx={{ color: "#888", "&:hover": { color: "#FF0000", backgroundColor: "#FF00001A" } }}>
            <Trash2 size={15} />
          </IconButton>
        </Box>
      </Box>

      {/* View detail link */}
      <Box
        onClick={onViewDetail}
        sx={{ mt: 0.5, pt: 1.25, borderTop: "1px solid #F0F0F0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3,
              cursor: "pointer", color: "#AA2493", fontSize: "13px", fontWeight: 600,
              "&:hover": { opacity: 0.8 } }}
      >
        View detail <ChevronRightIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  );
};

export default ModuleCard;