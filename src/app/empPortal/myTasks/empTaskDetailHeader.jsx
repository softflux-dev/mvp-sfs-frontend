// src/app/empPortal/myTasks/empTaskDetailHeader.jsx — FULL REPLACEMENT
import { Box, Typography, Chip, Grid } from "@mui/material";

const PRIORITY_CONFIG = {
  "high":   { label: "High",   bg: "#FF3B301A", color: "#FF3B30" },
  "medium": { label: "Medium", bg: "#AA24931A", color: "#AA2493" },
  "low":    { label: "Low",    bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const EmpTaskDetailHeader = ({ task = {}, stages = [] }) => {
  const rawPriority = task.priority?.toLowerCase() || "";
  const priorityCfg = PRIORITY_CONFIG[rawPriority] || { label: task.priority || "—", bg: "#F5F5F5", color: "#757575" };

  // Resolve pipeline stage label — use saved project stages
  const stageLabel = stages.find((s) => s.id === task.status)?.label || task.status || "—";

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

      {/* Project · Module · Priority chip · Stage chip */}
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={3}>
        <Typography fontSize="13px" color="text.secondary">
          {task.project?.projectName || task.project || "—"}
        </Typography>
        <Typography fontSize="13px" color="text.secondary">·</Typography>
        <Typography fontSize="13px" color="text.secondary">
          {task.module?.title || task.module?.moduleName || task.module || "—"}
        </Typography>

        {/* Priority */}
        <Chip
          label={priorityCfg.label}
          sx={{
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: priorityCfg.bg, color: priorityCfg.color,
          }}
        />

        {/* Pipeline Stage — replaces taskStatus */}
        <Chip
          label={stageLabel}
          sx={{
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: "#AA24931A", color: "#AA2493",
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