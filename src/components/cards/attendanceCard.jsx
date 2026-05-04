import { Box, Typography, LinearProgress } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { Groups } from "@mui/icons-material";
import CustomButton from "../customButton";
import { useTranslation } from "react-i18next";

const AttendanceCard = ({
  // Department Info
  departmentName,
  departmentLabel,
  
  // Stats
  totalStaff,
  presentStaff,
  absentStaff,
  
  // Attendance Rate
  attendanceRate,
  
  // Action
  onViewAttendance,
  
  // Customization
  cardBorderRadius = "20px",
  gradientBg = "linear-gradient(126.79deg, #FBD604 -5.59%, #EF5322 101.32%)",
  
  // Icons
  totalIcon = Groups,
  presentIcon = Groups,
  absentIcon = Groups,
}) => {
  const TotalIcon = totalIcon;
  const PresentIcon = presentIcon;
  const AbsentIcon = absentIcon;
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        padding: "20px",
        boxShadow: "none",
        border: "1px solid #F5F5F5",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Header - Department Name & Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={0.5}>
            {departmentName}
          </Typography>
          {/* <Typography variant="caption" color="text.secondary">
            {departmentLabel}
          </Typography> */}
        </Box>

        {/* Icon with gradient background */}
        {/* <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: gradientBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Groups
            sx={{
              fontSize: 24,
              color: "#fff",
            }}
          />
        </Box> */}
      </Box>

      {/* Stats Row */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        {/* Total Staff */}
        {/* <Box
          sx={{
            flex: 1,
            backgroundColor: "#F5F5F5",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <TotalIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography fontSize="24px" fontWeight={700} color="text.primary">
            {totalStaff}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("hrDirector.attendanceManagement.departmentCard.totalStaff")}
          </Typography>
        </Box> */}

        {/* <Box
          sx={{
            flex: 1,
            backgroundColor: "#E8F5E9",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PresentIcon sx={{ fontSize: 18, color: "#4CAF50" }} />
          <Typography fontSize="24px" fontWeight={700} color="#4CAF50">
            {presentStaff}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("hrDirector.attendanceManagement.departmentCard.present")}
          </Typography>
        </Box> */}

        {/* <Box
          sx={{
            flex: 1,
            backgroundColor: "#FFEBEE",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <AbsentIcon sx={{ fontSize: 18, color: "#F44336" }} />
          <Typography fontSize="24px" fontWeight={700} color="#F44336">
            {absentStaff}
          </Typography>
          <Typography variant="caption" color="text.secondary">
           {t("hrDirector.attendanceManagement.departmentCard.absent")}
          </Typography>
        </Box> */}
      </Box>

      {/* Attendance Rate Progress */}
      {/* <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t("hrDirector.attendanceManagement.departmentCard.attendanceRate")}
          </Typography>
          <Typography variant="caption" fontWeight={600} color="text.primary">
            {attendanceRate}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={attendanceRate}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "#F5F5F5",
            "& .MuiLinearProgress-bar": {
              background: gradientBg,
              borderRadius: 3,
            },
          }}
        />
      </Box> */}

      {/* View Attendance Button */}
      {onViewAttendance && (
        <CustomButton
          btnLabel={t("hrDirector.attendanceManagement.buttons.viewAttendance")}
          handlePressBtn={onViewAttendance}
          variant="courseCard"
          startIcon={<Visibility />}
          
        />
      )}
    </Box>
  );
};

export default AttendanceCard;
