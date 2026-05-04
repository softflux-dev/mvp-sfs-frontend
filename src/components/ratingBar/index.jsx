import React from "react";
import { Box } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const RatingBar = ({ rating = 0, onChange, maxRating = 5, size = 24, readOnly = false }) => {
  const handleClick = (newRating) => {
    if (!readOnly && onChange) {
      onChange(newRating);
    }
  };

  return (
    <Box display="flex" gap={0.5}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Box
            key={index}
            onClick={() => handleClick(starValue)}
            sx={{
              cursor: readOnly ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {starValue <= rating ? (
              <StarIcon
                sx={{
                  fontSize: size,
                  color: "#F97316",
                  transition: "all 0.2s",
                  "&:hover": !readOnly && {
                    transform: "scale(1.1)",
                  },
                }}
              />
            ) : (
              <StarBorderIcon
                sx={{
                  fontSize: size,
                  color: "#E0E0E0",
                  transition: "all 0.2s",
                  "&:hover": !readOnly && {
                    color: "#F97316",
                    transform: "scale(1.1)",
                  },
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default RatingBar;