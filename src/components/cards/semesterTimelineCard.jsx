import { Box, Typography, Chip } from "@mui/material";
import { CalendarDays } from "lucide-react";
import CustomButton from "../customButton";
import { Edit } from "lucide-react";
import { t } from "i18next";

const SemesterTimelineCard = ({
  level,
  term, // "First Term" or "Second Term"
  hijriYear,
  gregorianDateRange,
  status, // "Active", "Scheduled", etc.
  onExtend,
  onEditTimeline,
  cardBorderRadius = "12px",
}) => {
  const statusColors = {
    Active: {
      backgroundColor: "#EF53221A",
      color: "#EF5322",
    },
    Scheduled: {
      backgroundColor: "#75757533",
      color: "#757575",
    },
  };

  const currentStatusStyle = statusColors[status] || statusColors.Scheduled;

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxShadow: "none",
        border: status === "Active" ? "2px solid #EF5322" : "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          border: status === "Active" ? "2px solid #EF5322" : "1px solid #E0E0E0",
        },
      }}
    >
      {/* Header with Level Badge and Status */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Chip
          label={level}
          sx={{
            height: "28px",
            fontSize: "13px",
            fontWeight: 600,
            backgroundColor: status === "Active" ? "#F97316" : "#424242",
            color: "#fff",
            borderRadius: "8px",
          }}
        />

        <Chip
          label={status}
          sx={{
            height: "24px",
            fontSize: "12px",
            fontWeight: 500,
            ...currentStatusStyle,
            borderRadius: "12px",
          }}
        />
      </Box>

      {/* Term Title */}
      <Box>
        <Typography
          fontSize="18px"
          fontWeight={600}
          color="text.primary"
          mb={0.5}
        >
          {term}
        </Typography>
        <Typography
          fontSize="14px"
          fontWeight={400}
          color="text.secondary"
        >
          {hijriYear}
        </Typography>
      </Box>

      {/* Date Range */}
      <Box display="flex" alignItems="center" gap={1}>
        <CalendarDays size={18} color="#757575" />
        <Typography fontSize="14px" color="text.secondary">
          {gregorianDateRange}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box mt="auto" display="flex" justifyContent="flex-end" gap={1}>
        {/* Edit Timeline Button - Show for all semesters */}
        {onEditTimeline && (
          <CustomButton
            btnLabel={t("academicManagement.batches.batchDetail.buttons.editTimeline")}
            variant="gradient"
            fullWidth
            handlePressBtn={onEditTimeline}
            sx={{
              fontSize: "14px",
              height: "36px",
            }}
          />
        )}

        {/* Extend Button - Only show for Active status */}
        {status === "Active" && onExtend && (
          <CustomButton
            btnLabel={t("academicManagement.batches.batchDetail.buttons.extend")}
            variant="customGray"
            fullWidth
            handlePressBtn={onExtend}
            sx={{
              fontSize: "14px",
              height: "36px",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default SemesterTimelineCard;