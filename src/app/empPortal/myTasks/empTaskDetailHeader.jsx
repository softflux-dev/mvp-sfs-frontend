import { Box, Typography, Chip, Grid } from "@mui/material";

const TASK_STATUS_CONFIG = {
  "new":          { label: "New",          bg: "#2B6EFF1A", color: "#2B6EFF" },
  "in_progress":  { label: "In Progress",  bg: "#FF972F1A", color: "#FF972F" },
  "under_review": { label: "Under Review", bg: "#9E9E9E1A", color: "#9E9E9E" },
  "completed":    { label: "Completed",    bg: "#04C3731A", color: "#04C373" },
};

const PRIORITY_CONFIG = {
  "high":   { label: "High",   bg: "#FF3B301A", color: "#FF3B30" },
  "medium": { label: "Medium", bg: "#AA24931A", color: "#AA2493" },
  "low":    { label: "Low",    bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const EmpTaskDetailHeader = ({ task = {} }) => {
  const rawPriority   = task.priority?.toLowerCase()   || "";
  const rawTaskStatus = task.taskStatus?.toLowerCase() || "";

  const priorityCfg   = PRIORITY_CONFIG[rawPriority]     || { label: task.priority   || "—", bg: "#F5F5F5", color: "#757575" };
  const taskStatusCfg = TASK_STATUS_CONFIG[rawTaskStatus] || { label: task.taskStatus || "—", bg: "#F5F5F5", color: "#757575" };

  // "Assigned By" — the creator (admin/PM) who created the task
  const assignedBy =
    task.createdBy?.name     ||
    task.createdBy?.fullName ||
    task.createdByName       ||
    "—";

  const metaFields = [
    {
      label: "Assigned By",
      value: assignedBy,
    },
    {
      label: "Deadline",
      value: task.endDate
        ? new Date(task.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : task.deadline
          ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "—",
    },
    {
      label: "Created Date",
      value: task.createdAt
        ? new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 3 }}>

      {/* Title */}
      <Typography fontSize="24px" fontWeight={700} color="text.primary" mb={0.8} lineHeight={1.2}>
        {task.title || "—"}
      </Typography>

      {/* Project · Module · Priority chip · Task Status chip */}
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={3}>
        <Typography fontSize="13px" color="text.secondary">
          {task.project?.projectName || task.project || "—"}
        </Typography>
        <Typography fontSize="13px" color="text.secondary">·</Typography>
        <Typography fontSize="13px" color="text.secondary">
          {task.module?.title || task.module?.moduleName || task.module || "—"}
        </Typography>

        {/* Priority — uses lowercase key lookup */}
        <Chip
          label={priorityCfg.label}
          sx={{
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: priorityCfg.bg, color: priorityCfg.color,
          }}
        />

        {/* Task Status — replaces pipeline status */}
        <Chip
          label={taskStatusCfg.label}
          sx={{
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: taskStatusCfg.bg, color: taskStatusCfg.color,
          }}
        />
      </Box>

      {/* Meta row */}
      <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
        <Grid container spacing={2}>
          {metaFields.map((f) => (
            <Grid item size={{ xs: 12, sm: 4 }} key={f.label}>
              <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
                {f.label}
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {f.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
};

export default EmpTaskDetailHeader;