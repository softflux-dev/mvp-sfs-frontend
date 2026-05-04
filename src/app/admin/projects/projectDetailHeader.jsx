import { Box, Typography, Chip, Grid } from "@mui/material";
import CustomButton from "../../../components/customButton";
import editIcon from "../../../assets/icons/edit-icon.svg";

const STATUS_CONFIG = {
  Completed:    { bg: "#04C3731A", color: "#04C373" },
  Planning:     { bg: "#AA24931A", color: "#AA2493" },
  Development:  { bg: "#FF972F1A", color: "#FF972F" },
  Testing:      { bg: "#2B6EFF1A", color: "#2B6EFF" },
  Review:       { bg: "#FF972F1A", color: "#FF972F" },
  "In Progress":{ bg: "#AA24931A", color: "#AA2493" },
};

const ProjectDetailHeader = ({ project = {}, onEditClick }) => {
  const statusCfg = STATUS_CONFIG[project.status] || { bg: "#F5F5F5", color: "#757575" };

  const metaRow1 = [
    { label: "Client",          value: project.client         || "RetailCorp"   },
    { label: "Project Manager", value: project.projectManager || "Sara Ahmad"   },
    { label: "Progress",        value: `${project.progress    ?? 87}%`          },
  ];
  const metaRow2 = [
    { label: "Start Date", value: project.startDate || "Oct 1, 2025"  },
    { label: "End Date",   value: project.endDate   || "Jun 30, 2026" },
    { label: "Budget",     value: project.budget    || "$ 2,500,000"  },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "16px",
    
        p: "20px 24px",
        mb: 3,
      }}
    >
      {/* ── Title row ──────────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography fontSize="22px" fontWeight={700} color="text.primary">
            {project.projectName || "E-Commerce Platform"}
          </Typography>
          <Chip
            label={project.status || "Completed"}
            sx={{
              height: "26px",
              fontSize: "12px",
              fontWeight: 500,
              px: 1,
              borderRadius: "8px",
              backgroundColor: statusCfg.bg,
              color: statusCfg.color,
            }}
          />
        </Box>

        {/* ── Edit button using CustomButton with gradientText variant ─── */}
        <CustomButton
          btnLabel="Edit Project"
          variant="gradientText"
          handlePressBtn={onEditClick}
          startIcon={
            <img src={editIcon} alt="edit" style={{ width: 15, height: 15 }} />
          }
        />
      </Box>

<Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
  {/* Row 1 */}
  <Grid container spacing={2} mb={2}>
    {metaRow1.map((f) => (
      <Grid item size={{ xs: 4 }} key={f.label}>
        <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
          {f.label}
        </Typography>
        <Typography fontSize="14px" fontWeight={700} color="text.primary">
          {f.value}
        </Typography>
      </Grid>
    ))}
  </Grid>



  {/* Row 2 */}
  <Grid container spacing={2}>
    {metaRow2.map((f) => (
      <Grid item size={{ xs: 4 }} key={f.label}>
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

export default ProjectDetailHeader;