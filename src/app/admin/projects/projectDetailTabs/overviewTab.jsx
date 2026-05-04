import { Box, Typography, Grid } from "@mui/material";
import StatsCard from "../../../../components/cards/statsCard";

import taskIcon     from "../../../../assets/icons/tasks.svg";
import completeIcon from "../../../../assets/icons/complete-active.svg";
import progressIcon from "../../../../assets/icons/time-icon.svg";
import overdueIcon  from "../../../../assets/icons/overdue-time.svg";


const OverviewTab = ({ project = {} }) => {
  const infoFields = [
    { label: "Start Date",     value: project.startDate || "Jan 15, 2026"  },
    { label: "End Date",       value: project.endDate   || "Jun 30, 2026"  },
    { label: "Days Remaining", value: "110"                                  },
    { label: "Budget",         value: project.budget    || "$150,000"       },
  ];

   const statsData = [
    { id: 1, title: "Total Tasks", value: "12", icon: taskIcon                        },
    { id: 2, title: "Completed",   value: "3",  icon: completeIcon, isHighlighted: true },
    { id: 3, title: "In Progress", value: "2",  icon: progressIcon                    },
    { id: 4, title: "Overdue",     value: "0",  icon: overdueIcon                     },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

         {/* ── Stats cards ──────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 2 }}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              isHighlighted={stat.isHighlighted}
            />
          </Grid>
        ))}
      </Grid>

      {/* Info grid card */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #F0F0F0",
          p: "16px 24px",
        }}
      >
        <Grid container spacing={3}>
          {infoFields.map((f) => (
            <Grid item size={{ xs: 6, sm: 3 }} key={f.label}>
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

      {/* Description card */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #F0F0F0",
          p: "16px 24px",
        }}
      >
        <Typography fontSize="16px" color="text.darkGray" fontWeight={600} mb={0.8}>
          Description
        </Typography>
        <Typography fontSize="14px" color="text.primary" lineHeight={1.7}>
          {project.description ||
            "Full-featured e-commerce platform with payment integration, inventory management, and analytics dashboard."}
        </Typography>
      </Box>

    </Box>
  );
};

export default OverviewTab;