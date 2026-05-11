import { useState } from "react";
import { Box, Typography, Chip, Avatar, AvatarGroup, IconButton } from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
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

const ModuleCard = ({
  title        = "Product Catalog",
  description  = "Product listing and detail pages",
  status       = "Planning",
  tasksLabel   = "8/12 tasks",
  progress     = 87,
  members      = [],
  onEdit,
  onDelete,
  showActions,   // kept for backward-compat but no longer needed
}) => {
  const [hovered, setHovered] = useState(false);
  const statusCfg = STATUS_CONFIG[status] || { bg: "#F5F5F5", color: "#757575" };

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
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
        },
      }}
    >
      {/* ── Title + Status chip ─────────────────────────────────────────── */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Typography fontSize="15px" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        <Chip
          label={status}
          sx={{
            height: "22px",
            fontSize: "11px",
            fontWeight: 500,
            px: 0.5,
            borderRadius: "8px",
            flexShrink: 0,
            backgroundColor: statusCfg.bg,
            color: statusCfg.color,
          }}
        />
      </Box>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <Typography fontSize="12px" color="text.secondary" lineHeight={1.5}>
        {description}
      </Typography>

      {/* ── Tasks label ─────────────────────────────────────────────────── */}
      <Typography fontSize="12px" fontWeight={500} color="text.secondary">
        {tasksLabel}
      </Typography>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <ProgressBar
        value={progress}
        showPercentage={true}
        percentage={`${progress}%`}
        height={6}
        sx={{ mb: 0 }}
      />

      {/* ── Members + Actions ───────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Member avatars */}
        <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "11px" } }}>
          {members.length > 0
            ? members.map((src, i) => (
                <Avatar key={i} src={src} sx={{ width: 28, height: 28 }} />
              ))
            : [1, 2, 3].map((i) => (
                <Avatar
                  key={i}
                  sx={{
                    width: 28,
                    height: 28,
                    background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </Avatar>
              ))}
        </AvatarGroup>

        {/* Edit / Delete — visible on card hover */}
        <Box
          display="flex"
          gap={0.5}
          sx={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ color: "#888", "&:hover": { color: "#AA2493", backgroundColor: "#AA24930F" } }}
          >
            <Edit2 size={15} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{ color: "#888", "&:hover": { color: "#FF0000", backgroundColor: "#FF00001A" } }}
          >
            <Trash2 size={15} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ModuleCard;