// app/projectManager/dashboard/myProjectsList.jsx — FULL REPLACEMENT
import { Box, Typography, Chip, Stack, CircularProgress, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../../components/progressBar";
import ViewIcon    from "../../../assets/icons/view.svg";

const ScrollContainer = styled(Box)({
  maxHeight: "400px",
  overflowY: "auto",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
});

const STATUS_CONFIG = {
  "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
  "Completed":   { bg: "#04C3731A", color: "#04C373" },
  "Planning":    { bg: "#AA24931A", color: "#AA2493" },
  "On Hold":     { bg: "#6B72801A", color: "#6B7280" },
};

const MyProjectsList = ({ projects = [], loading = false, onViewAll }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          My Projects
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress size={28} sx={{ color: "#AA2493" }} />
        </Box>
      ) : projects.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography fontSize={13} color="text.secondary">No projects assigned yet.</Typography>
        </Box>
      ) : (
        <ScrollContainer>
          <Stack spacing={1.5}>
            {projects.map((proj) => {
              const cfg = STATUS_CONFIG[proj.status] || STATUS_CONFIG["Planning"];
              return (
                <Box
                  key={proj.id}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    p: "12px 16px", borderRadius: "14px", bgcolor: "#F6F6F6", gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography fontSize={13} fontWeight={600} color="text.primary" noWrap>
                        {proj.name}
                      </Typography>
                      <Chip
                        label={proj.status}
                        size="small"
                        sx={{ bgcolor: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600, height: 20, flexShrink: 0 }}
                      />
                    </Box>
                    <Typography fontSize={11} color="text.secondary" noWrap>
                      {proj.projectType ? `${proj.projectType} · ` : ""}{proj.subtitle}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1.5} sx={{ flexShrink: 0 }}>
                    <Box sx={{ width: 80 }}>
                      <ProgressBar value={proj.progress} showPercentage={false} height={5} />
                    </Box>
                    <Typography fontSize={12} fontWeight={500} color="text.secondary">
                      {proj.progress}%
                    </Typography>
                    <img
                      src={ViewIcon} alt="View"
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                      onClick={() => navigate(`/pm-projects/${proj.id}`, { state: { project: proj } })}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </ScrollContainer>
      )}
    </Box>
  );
};

export default MyProjectsList;