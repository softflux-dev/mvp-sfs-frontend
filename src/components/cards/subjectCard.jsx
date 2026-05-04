import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import CheckIcon from "../../assets/icons/check-icon.svg";

const SubjectCard = ({
  code,
  name,
  credits,
  isSelected = false,
  onToggle,
  cardBorderRadius = "12px",
}) => {
  return (
    <Box
      onClick={onToggle}
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        boxShadow: "none",
        border: isSelected ? "2px solid #EF5322" : "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          border: isSelected ? "2px solid #EF5322" : "1px solid #E0E0E0",
        },
      }}
    >
      {/* Checkbox Icon */}
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: !isSelected ? "transparent" : {CheckIcon},
          border: isSelected ? "none" : "2px solid #E0E0E0",
          transition: "all 0.3s ease",
          flexShrink: 0,
        }}
      >
        {isSelected && (
          <Box
            component="img"
            src={CheckIcon}
            alt="selected"
            sx={{ width: 15, height: 15 }}
          />
        )}
      </Box>

      {/* Subject Info */}
      <Box flex={1} minWidth={0}>
        <Typography
          fontSize="14px"
          fontWeight={600}
          color="text.primary"
          noWrap
        >
          {code}
        </Typography>
        <Typography
          fontSize="13px"
          fontWeight={400}
          color="text.secondary"
          noWrap
        >
          {name}
        </Typography>
      </Box>

      {/* Credits Badge */}
      <Chip
        label={`${credits} CH`}
        sx={{
          height: "24px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: isSelected ? "#424242" : "#F5F5F5",
          color: isSelected ? "#fff" : "text.secondary",
          borderRadius: "8px",
          flexShrink: 0,
        }}
      />
    </Box>
  );
};

export default SubjectCard;