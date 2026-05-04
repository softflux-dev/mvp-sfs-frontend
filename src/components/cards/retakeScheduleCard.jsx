// components/cards/RetakeScheduleCard.jsx
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { CustomButton } from "../../components";

const RetakeScheduleCard = ({
  retakeNumber,
  status,
  examDate,
  examTime,
  duration,
  location,
  enrolled,
  maxStudents,
  onComplete,
  onCancel,
  t,
}) => {
  const isCompleted = status === t("academicManagement.grading.retake.scheduleCard.completed");
  const isScheduled = status === t("academicManagement.grading.retake.scheduleCard.scheduled");

  const getStatusChipStyles = () => {
    if (isCompleted) {
      return {
        bgcolor: "#E8F5E9",
        color: "#2E7D32",
        border: "1px solid #A5D6A7",
      };
    }
    return {
      bgcolor: "#E3F2FD",
      color: "#1976D2",
      border: "1px solid #90CAF9",
    };
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #F5F5F5",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header Row - Title & Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {retakeNumber}
        </Typography>

        <Chip
          label={status}
          size="small"
          sx={{
            ...getStatusChipStyles(),
            fontSize: "12px",
            fontWeight: 500,
            height: "24px",
          }}
        />
      </Box>

      {/* Details Row - Date, Time, Location, Enrollment */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {/* Date */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Calendar size={16} color="#757575" />
          <Typography variant="body2" color="text.secondary">
            {examDate}
          </Typography>
        </Box>

        {/* Time */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Clock size={16} color="#757575" />
          <Typography variant="body2" color="text.secondary">
            {examTime} ({duration} {t("academicManagement.grading.retake.scheduleCard.min")})
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MapPin size={16} color="#757575" />
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        </Box>

        {/* Enrollment */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Users size={16} color="#757575" />
          <Typography variant="body2" color="text.secondary">
            {enrolled}/{maxStudents}
          </Typography>
        </Box>
      </Box>

      {/* Center Message - No students enrolled */}
      {enrolled === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 2,
            borderTop: "1px solid #F5F5F5",
            borderBottom: "1px solid #F5F5F5",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("academicManagement.grading.retake.scheduleCard.noStudentsEnrolled")}
          </Typography>
        </Box>
      )}

      {/* Action Buttons - Only for Scheduled */}
      {isScheduled && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            pt: enrolled === 0 ? 0 : 2,
            borderTop: enrolled === 0 ? "none" : "1px solid #F5F5F5",
          }}
        >
          {onCancel && (
            <CustomButton
              btnLabel={t("academicManagement.grading.retake.buttons.cancel")}
              variant="customGray"
              handlePressBtn={onCancel}
            />
          )}

          {onComplete && (
            <CustomButton
              btnLabel={t("academicManagement.grading.retake.buttons.complete")}
              variant="gradient"
              handlePressBtn={onComplete}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default RetakeScheduleCard;