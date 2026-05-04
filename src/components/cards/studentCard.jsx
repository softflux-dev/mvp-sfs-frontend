import { Box, Typography, Chip, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const StudentCard = ({
  studentName,
  studentId,
  program,
  semester,
  credits,
  semGPA,
  overallGPA,
  academicStanding,
  onClick,
  isSelected = false
}) => {
  const { t } = useTranslation();

  const getStandingColor = (standing) => {
    const standingLower = standing?.toLowerCase() || "";
    if (standingLower.includes("good")) {
      return { bg: "#FFF4E6", color: "#FF6D00" };
    } else if (standingLower.includes("probation") || standingLower.includes("warning")) {
      return { bg: "#FFE5E5", color: "#FF5252" };
    }
    return { bg: "#F5F5F5", color: "#666" };
  };

  const standingColors = getStandingColor(academicStanding);

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: isSelected ? "2px solid #FF6D00" : "1px solid #F0F0F0",
        backgroundColor: isSelected ? "#FFF9F5" : "#fff",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        mb: 2,
        "&:hover": onClick ? {
          borderColor: "#FF6D00",
          backgroundColor: "#FFF9F5",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        } : {},
      }}
    >
      {/* Header with Name and Overall GPA */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box flex={1}>
          <Typography fontSize="16px" fontWeight={600} color="text.primary" mb={0.5}>
            {studentName}
          </Typography>
          {/* ID/Program/Semester in one line */}
          <Typography fontSize="12px" color="text.secondary">
            {studentId} • {program} • {semester}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography fontSize="20px" fontWeight={700} color="primary.main" lineHeight={1}>
            {overallGPA?.toFixed(2) || "0.00"}
          </Typography>
          <Typography fontSize="10px" color="text.secondary">
            {t("academicManagement.centralAttendance.gradsIntegration.studentCard.overallGPA")}
          </Typography>
        </Box>
      </Box>


      <Stack direction="row" gap={2} justifyContent="space-between">
        {/* Credits and Sem GPA */}
        <Box display="flex" gap={2} alignItems="center" mb={1.5}>
          <Box>
            <Typography fontSize="11px" color="text.secondary" mb={0.3}>
              {t("academicManagement.centralAttendance.gradsIntegration.studentCard.credits")}
            </Typography>
            <Typography fontSize="13px" fontWeight={500} color="text.primary">
              {credits}
            </Typography>
          </Box>
          <Box >
            <Typography fontSize="11px" color="text.secondary" mb={0.3}>
              {t("academicManagement.centralAttendance.gradsIntegration.studentCard.semGPA")}
            </Typography>
            <Typography fontSize="13px" fontWeight={500} color="text.primary">
              {semGPA?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
        </Box>

        {/* Academic Standing Chip */}
        {academicStanding && (
          <Chip
            label={academicStanding}
            sx={{
              backgroundColor: standingColors.bg,
              color: standingColors.color,
              fontWeight: 500,
              fontSize: "11px",
              height: "24px",
              borderRadius: "12px",
              border: "none",
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default StudentCard;
