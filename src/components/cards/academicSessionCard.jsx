import React from "react";
import { Box, Typography } from "@mui/material";

const AcademicSessionCard = ({
  // Content
  level,
  term,
  yearRange,
  monthYear,
  
  // State
  isActive = false,
  isCompleted = false,
  
  // Actions
  onClick,
  
  // Customization
  cardBorderRadius = "12px",
}) => {
  // Determine card style based on state
  const getCardStyle = () => {
    if (isActive) {
      return {
        backgroundColor: "#fff",
        border: "2px solid #EF5322",
        boxShadow: "0px 2px 8px rgba(239, 83, 34, 0.15)",
      };
    }
    
    if (isCompleted) {
      return {
        backgroundColor: "#fff",
        border: "1px solid #E0E0E0",
        opacity: 0.7,
      };
    }
    
    return {
      backgroundColor: "#F5F5F5",
      border: "1px solid #E0E0E0",
    };
  };

  const cardStyle = getCardStyle();

  return (
    <Box
      sx={{
        ...cardStyle,
        borderRadius: cardBorderRadius,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        minHeight: "100px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        "&:hover": onClick ? {
          transform: "translateY(-2px)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        } : {},
      }}
      onClick={onClick}
    >
      {/* Level */}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          color: isActive ? "#EF5322" : "text.primary",
          mb: 0.5,
        }}
      >
        {level}
      </Typography>

      {/* Term */}
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        {term}
      </Typography>

      {/* Year Range */}
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 400,
          color: "text.secondary",
          mt: 0.5,
        }}
      >
        {yearRange}
      </Typography>

       {/* Month Year (if provided) */}
      {monthYear && (
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 400,
            color: isActive ? "#EF5322" : "text.secondary",
            mt: "auto",
          }}
        >
          {monthYear}
        </Typography>
      )}
    </Box>
  );
};

export default AcademicSessionCard;