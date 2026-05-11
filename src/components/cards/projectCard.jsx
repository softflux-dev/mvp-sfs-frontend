import { Box, Typography, Chip, Avatar, AvatarGroup } from "@mui/material";
import { Calendar, FileText } from "lucide-react";
import ProgressBar from "../progressBar";
import CustomButton from "../customButton";
import DateIcon from "../../assets/icons/calendar-icon-gray.svg";
import FileIcon from "../../assets/icons/task-icon-gray.svg";

const STATUS_CONFIG = {
  "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
  "Planning":    { bg: "#2B6EFF1A", color: "#2B6EFF" },
  "On Hold":     { bg: "#9E9E9E1A", color: "#393535" },
  "Completed":   { bg: "#04C3731A", color: "#04C373" },
  "Development": { bg: "#AA24931A", color: "#AA2493" },
  "Testing":     { bg: "#FF972F1A", color: "#FF972F" },
  "Review":      { bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const ProjectCard = ({
  projectName   = "E-Commerce Platform",
  //client        = "RetailMax Inc.",
  status        = "In Progress",
  progress      = 87,
  dueDate       = "2026-04-15",
  taskCount     = 34,
  members       = [],
  isActive      = false,
  onViewDetails,
}) => {
  const statusCfg = STATUS_CONFIG[status] || { bg: "#F5F5F5", color: "#757575" };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        border: "1px solid #F0F0F0",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
      }}
    >
      {/* ── Title + Status ────────────────────────────────────────────── */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Box>
          <Typography fontSize="15px" fontWeight={700} color="text.primary">
            {projectName}
          </Typography>
       {/*    <Typography fontSize="12px" color="text.secondary" mt={0.25}>
            {client}
          </Typography> */}
        </Box>
        <Chip
          label={status}
          sx={{
            height: "24px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px", flexShrink: 0,
            backgroundColor: statusCfg.bg, color: statusCfg.color,
          }}
        />
      </Box>

      {/* ── Progress ──────────────────────────────────────────────────── */}
      <Box>
        <Typography fontSize="12px" color="text.secondary" >
          Progress
        </Typography>
        <ProgressBar
          value={progress}
          showPercentage={true}
          percentage={`${progress}%`}
          height={6}
          sx={{ mb: 0 }}
        />
      </Box>

      {/* ── Members + Meta ────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Avatars */}
        <AvatarGroup
          max={4}
          sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "10px" } }}
        >
          {members.length > 0
            ? members.map((src, i) => (
                <Avatar key={i} src={src} sx={{ width: 28, height: 28 }} />
              ))
            : [1, 2, 3].map((i) => (
                <Avatar
                  key={i}
                  sx={{
                    width: 28, height: 28,
                    background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                    fontSize: "10px", fontWeight: 600,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </Avatar>
              ))}
        </AvatarGroup>

        {/* Due date + task count */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <img src={DateIcon} alt="Due Date" style={{ width: 12, height: 12 }} />
            <Typography fontSize="11px" color="text.darkGray">
              {dueDate}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <img src={FileIcon} alt="Tasks" style={{ width: 12, height: 12 }} />
            <Typography fontSize="11px" color="text.darkGray">
              {taskCount}
            </Typography>
          </Box>
        </Box>
      </Box>

   {/* ── View Details button ────────────────────────────────────────── */}
    <Box
    onClick={onViewDetails}
    sx={{
        mt: 0.5,
        width: "100%",
        height: "45px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: "#F5F5F5",
        border: "1px solid #eee",
        "&:hover": {
        background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
        "& .btn-text": {
            WebkitTextFillColor: "#fff",
            color: "#fff",
            background: "none",
            WebkitBackgroundClip: "unset",
        },
        },
    }}
    >
    <Typography
        className="btn-text"
        fontSize="14px"
        fontWeight={700}
        sx={{
        background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        transition: "all 0.2s ease",
        }}
    >
        View Details
    </Typography>
    </Box>
    </Box>
  );
};

export default ProjectCard;