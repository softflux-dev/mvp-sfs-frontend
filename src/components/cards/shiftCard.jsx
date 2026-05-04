// components/cards/shiftCard.jsx
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const ShiftCard = ({ 
  shiftName, 
  timeSlots, 
  days, 
  description, 
  onEdit,
  isCreateNew = false,
  onCreate 
}) => {
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const activeDays = days || ["MON", "TUE", "WED", "THU", "FRI"];

  // Create New Shift Card
  if (isCreateNew) {
    return (
      <Box
        onClick={onCreate}
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "280px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderRadius: "16px",
          p: 2.5,
          border: "2px dashed",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.lightOrange",
            "& .create-icon": {
              color: "primary.main",
              transform: "scale(1.1)",
            },
            "& .create-text": {
              color: "primary.main",
            },
          },
        }}
      >
        <AddCircleOutlineIcon
          className="create-icon"
          sx={{
            fontSize: 48,
            color: "text.secondary",
            mb: 1,
            transition: "all 0.3s ease",
          }}
        />
        <Typography
          className="create-text"
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            color: "text.secondary",
            transition: "color 0.3s ease",
          }}
        >
          {shiftName}
        </Typography>
      </Box>
    );
  }

  // Regular Shift Card
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "280px",
        bgcolor: "background.paper",
        borderRadius: "16px",
        p: 2.5,
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Edit Icon */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          cursor: "pointer",
          color: "text.secondary",
          transition: "color 0.3s ease",
          "&:hover": { color: "primary.main" },
        }}
        onClick={onEdit}
      >
        <EditIcon fontSize="small" />
      </Box>

      {/* Shift Name */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, pr: 4 }}>
        {shiftName}
      </Typography>

      {/* Time Slots */}
      <Box sx={{ mb: 2 }}>
        {timeSlots.map((slot, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#4285F4",
              }}
            />
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {slot}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Days */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {daysOfWeek.map((day) => (
          <Chip
            key={day}
            label={day}
            size="small"
            variant={activeDays.includes(day) ? "mainChip" : "default"}
            sx={{
              minWidth: "45px",
              fontSize: "11px",
              fontWeight: 500,
            }}
          />
        ))}
      </Box>

      {/* Description */}
      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
        {description}
      </Typography>
    </Box>
  );
};

export default ShiftCard;