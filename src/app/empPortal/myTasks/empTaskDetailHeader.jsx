import { Box, Typography, Chip, Grid } from "@mui/material";

const STATUS_CONFIG = {
  "New":         { bg: "#2B6EFF1A", color: "#2B6EFF" },
  "Assigned":    { bg: "#AA24931A", color: "#AA2493" },
  "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
  "Review":      { bg: "#9E9E9E1A", color: "#9E9E9E" },
  "Completed":   { bg: "#04C3731A", color: "#04C373" },
  "Under Review":{ bg: "#9E9E9E1A", color: "#9E9E9E" },
};

const PRIORITY_CONFIG = {
  High:   { bg: "#FF3B301A", color: "#FF3B30" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const EmpTaskDetailHeader = ({ task = {} }) => {
  const statusCfg   = STATUS_CONFIG[task.status]     || { bg: "#F5F5F5", color: "#757575" };
  const priorityCfg = PRIORITY_CONFIG[task.priority] || { bg: "#F5F5F5", color: "#757575" };

  const metaFields = [
    { label: "Assigned By",  value: task.assignedBy  || "Sara Ahmad"   },
    { label: "Deadline",     value: task.deadline    || "Oct 1, 2025"  },
    { label: "Created Date", value: task.createdDate || "Created Date" },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 3 }}>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <Typography
        fontSize="24px"
        fontWeight={700}
        color="text.primary"
        mb={0.8}
        lineHeight={1.2}
      >
        {task.title || "Design CRM dashboard wireframes"}
      </Typography>

      {/* ── Project · Module · Chips row ────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={3}>
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
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: priorityCfg.bg, color: priorityCfg.color,
          }}
        />
        <Chip
          label={task.status || "In Progress"}
          sx={{
            height: "22px", fontSize: "11px", fontWeight: 500,
            px: 0.5, borderRadius: "12px",
            backgroundColor: statusCfg.bg, color: statusCfg.color,
          }}
        />
      </Box>

      {/* ── Meta info row ───────────────────────────────────────────────── */}
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