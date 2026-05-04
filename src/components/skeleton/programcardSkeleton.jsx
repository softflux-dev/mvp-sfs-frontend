import React from "react";
import { Box, Skeleton, Chip } from "@mui/material";

const ProgramCardSkeleton = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        p: 3,
        border: "1px solid #E5E7EB",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Skeleton variant="rounded" width={40} height={40} />
        <Box display="flex" gap={1}>
          <Skeleton variant="rounded" width={60} height={28} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>

      {/* Title */}
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />

      {/* Program details */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} display="flex" alignItems="center" gap={1}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={80} height={18} />
          </Box>
        ))}
      </Box>

      {/* Tags */}
      <Box display="flex" gap={1} mb={2}>
        <Skeleton variant="rounded" width={70} height={24} />
        <Skeleton variant="rounded" width={90} height={24} />
        <Skeleton variant="rounded" width={100} height={24} />
      </Box>

      {/* Status */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Skeleton variant="text" width={50} height={20} />
        <Skeleton variant="rounded" width={36} height={20} />
      </Box>

      {/* Button */}
      <Skeleton variant="rounded" width="100%" height={40} />
    </Box>
  );
};

export default ProgramCardSkeleton;
