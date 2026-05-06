import { Box, Typography, Chip, Stack, styled } from "@mui/material";
import ViewIcon from "../../../assets/icons/view.svg";
import ProgressBar from "../../../components/progressBar";

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
};

const mockProjects = [
  { id: 1, name: "E-Commerce Platform",  subtitle: "Due 2026-04-15", status: "In Progress", progress: 65 },
  { id: 2, name: "Design product listing page", subtitle: "Priya Patel · E-Commerce Platform", status: "In Progress", progress: 65 },
  { id: 3, name: "Patient records API",  subtitle: "Jake Morrison · Healthcare Portal",     status: "In Progress", progress: 65 },
  { id: 4, name: "Write unit tests for auth module", subtitle: "Emily Ross · Mobile Banking App", status: "In Progress", progress: 65 },
  { id: 5, name: "Setup CI/CD pipeline", subtitle: "David Kim · Healthcare Portal",         status: "In Progress", progress: 65 },
  { id: 6, name: "E-Commerce Platform",  subtitle: "Due 2026-04-15", status: "In Progress", progress: 65 },
  { id: 7, name: "Design product listing page", subtitle: "Priya Patel · E-Commerce Platform", status: "In Progress", progress: 65 },
  { id: 8, name: "Patient records API",  subtitle: "Jake Morrison · Healthcare Portal",     status: "In Progress", progress: 65 },
  { id: 9, name: "Write unit tests for auth module", subtitle: "Emily Ross · Mobile Banking App", status: "In Progress", progress: 65 },
  { id: 10, name: "Setup CI/CD pipeline", subtitle: "David Kim · Healthcare Portal",         status: "In Progress", progress: 65 },
];

const MyProjectsList = ({ onViewAll }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "25px",
        p: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary">
          My Projects
        </Typography>
       
      </Box>

      <ScrollContainer>
        <Stack spacing={1.5}>
          {mockProjects.map((proj) => {
            const cfg = STATUS_CONFIG[proj.status] || STATUS_CONFIG["Planning"];
            return (
              <Box
                key={proj.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: "12px 16px",
                  borderRadius: "14px",
                  bgcolor: "#F6F6F6",
                  gap: 2,
                }}
              >
                {/* Left */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography fontSize={13} fontWeight={600} color="text.primary" noWrap>
                      {proj.name}
                    </Typography>
                    <Chip
                      label={proj.status}
                      size="small"
                      sx={{
                        bgcolor: cfg.bg, color: cfg.color,
                        fontSize: 10, fontWeight: 600,
                        height: 20, flexShrink: 0,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    />
                  </Box>
                  <Typography fontSize={11} color="text.secondary" noWrap>
                    {proj.subtitle}
                  </Typography>
                </Box>

                {/* Progress + eye */}
                <Box display="flex" alignItems="center" gap={1.5} sx={{ flexShrink: 0 }}>
                  <Box sx={{ width: 80 }}>
                    <ProgressBar value={proj.progress} showPercentage={false} height={5} />
                  </Box>
                  <Typography fontSize={12} fontWeight={500} color="text.secondary">
                    {proj.progress}%
                  </Typography>
                 <img src={ViewIcon} alt="View" style={{ width: 16, height: 16, cursor: "pointer" }} />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </ScrollContainer>
    </Box>
  );
};

export default MyProjectsList;