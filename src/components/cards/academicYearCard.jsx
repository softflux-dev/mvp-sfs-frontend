import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


const AcademicYearCard = ({
  // Content
  hijriYear,
  gregorianYear,
  sessionsCount,
  configuredCount,
  status, // "Current" or "Past"
  
  // Actions
  onEdit,
  onDelete,
  onClick,
  isSelected = false,
  
  // Customization
  cardBorderRadius = "16px",
}) => {
  const statusColors = {
    Current: {
      backgroundColor: "#EF53221A",
      color: "#EF5322",
    },
    Past: {
      backgroundColor: "#75757533",
      color: "#757575",
    },
  };

  const currentStatusStyle = statusColors[status] || statusColors.Past;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "180px",
        bgcolor: "background.paper",
        borderRadius: cardBorderRadius,
        p: 2.5,
        position: "relative",
        border: isSelected ? "2px solid #EF5322" : "1px solid",
        borderColor: isSelected ? "#EF5322" : "divider",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
      onClick={onClick}
    >
      {/* Top Section: Icon & Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        {/* Calendar Icon */}
        <Box
          sx={{
            backgroundColor: "primary.lightGray",
            borderRadius: "10px",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CalendarTodayIcon
            sx={{
              fontSize: 20,
              color: "#EF5322",
            }}
          />
        </Box>

        {/* Status Badge & Action Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Status Chip */}
          <Chip
            label={status}
            sx={{
              ...currentStatusStyle,
              fontSize: "12px",
              fontWeight: 500,
              height: "24px",
              borderRadius: "12px",
            }}
          />

          {/* Edit Icon */}
          <Box
            sx={{
              cursor: "pointer",
              color: "text.secondary",
              transition: "color 0.3s ease",
              "&:hover": { color: "primary.main" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(239, 83, 34, 0.1)",
                color: "#EF5322",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <EditIcon fontSize="small" />
          </Box>

          {/* Delete Icon */}
          <Box
            sx={{
              cursor: "pointer",
              color: "text.secondary",
              transition: "color 0.3s ease",
              "&:hover": { color: "#FF0000" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(255, 0, 0, 0.1)",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <DeleteIcon fontSize="small" />
          </Box>
        </Box>
      </Box>

      {/* Hijri Year */}
      <Typography
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          color: "text.primary",
          mb: 0.5,
        }}
      >
        {hijriYear}
      </Typography>

      {/* Gregorian Year */}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 400,
          color: "text.secondary",
          mb: 2,
        }}
      >
        {gregorianYear}
      </Typography>

      {/* Sessions Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "text.primary",
          }}
        >
          {sessionsCount} Sessions{" "}
          <Typography
            component="span"
            sx={{
              fontSize: "13px",
              color: "text.secondary",
            }}
          >
            ({configuredCount} configured)
          </Typography>
        </Typography>

        {/* Arrow Icon */}
        <ChevronRightIcon
          sx={{
            fontSize: 20,
            color: "text.secondary",
          }}
        />
      </Box>
    </Box>
  );
};

export default AcademicYearCard;