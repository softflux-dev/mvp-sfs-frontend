import React from "react";
import { Box, Skeleton } from "@mui/material";

const AcademicYearCardSkeleton = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "180px",
        bgcolor: "background.paper",
        borderRadius: "16px",
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
      }}
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
        {/* Calendar Icon Skeleton */}
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px" }} />

        {/* Status Badge & Action Icons Skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>

      {/* Hijri Year Skeleton */}
      <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />

      {/* Gregorian Year Skeleton */}
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />

      {/* Sessions Info Skeleton */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="circular" width={20} height={20} />
      </Box>
    </Box>
  );
};

export default AcademicYearCardSkeleton;
