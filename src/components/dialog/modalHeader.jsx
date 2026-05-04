import React from "react";
import { Box, Typography, IconButton } from "@mui/material";

const ModalHeader = ({
  title,
  subtitle,     
  duration,
  type,
  onClose,
  closeIcon,
  timeIcon,
  readingIcon,
  statusBadge, // NEW: Add this prop
}) => {
  return (
    <Box mb={2}>
      {/* Title + Close */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h5">{title}</Typography>
            {statusBadge && statusBadge} {/* NEW: Add status badge next to title */}
          </Box>

          {/* Subtitle */}
          {subtitle && (
            <Typography fontSize={12} color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background:
              "linear-gradient(126.79deg, #FBD604 -5.59%, #EF5322 101.32%)",
            color: "#fff",
          }}
        >
          {closeIcon ? <img src={closeIcon} width={16} /> : "✕"}
        </IconButton>
      </Box>

      {/* Duration + Type */}
      <Box display="flex" gap={1} mt={1}>
        {duration && (
          <Box display="flex" alignItems="center" gap={0.8}>
            {timeIcon && <img src={timeIcon} width={12} />}
            <Typography fontSize={12} color="text.secondary">
              {duration}
            </Typography>
          </Box>
        )}

        {type && (
          <Box display="flex" alignItems="center" gap={0.8}>
            {readingIcon && <img src={readingIcon} width={12} />}
            <Typography fontSize={12} color="text.secondary">
              {type}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ModalHeader;