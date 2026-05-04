import React from "react";
import { Box, Skeleton, Grid } from "@mui/material";

const FeeCollectionSkeleton = () => {
  return (
    <Box>
      {/* Student Information Skeleton */}
      <Box bgcolor={"background.dark"} borderRadius={"25px"} p={2.5} mt={2}>
        <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
        <Grid container spacing={1}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item size={{ xs: 12, md: 6 }} key={index} sx={{ mt: 2 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={24} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Registration Fee Skeleton */}
      <Box mt={2}>
        <Skeleton variant="text" width="30%" height={22} sx={{ mb: 1 }} />
        <Box bgcolor={"#fff"} p={1} borderRadius={"30px"} mt={2}>
          <Box p={2}>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item size={{xs : 12 , sm  :6 , md : 2}} key={index}>
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rectangular" width="100% " height="100%" sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Admission Fee Skeleton */}
      <Box mt={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Skeleton variant="text" width="25%" height={22} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Box>
        <Box bgcolor={"#fff"} p={1} borderRadius={"30px"} mt={1.5}>
          <Box p={2}>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item size={{xs : 12 , sm  :6 , md : 2}} key={index}>
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Installment/Semester Payments Skeleton */}
      <Box mt={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 2 }} />
        </Box>
        <Box bgcolor={"#fff"} p={1} borderRadius={"30px"} mt={2}>
          <Box p={2}>
            {/* Table Header Skeleton */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {Array.from({ length: 9 }).map((_, index) => (
                <Grid item size={{xs : 12 , sm  :6 , md : 1.3}} key={index}>
                  <Skeleton variant="text" width="90%" height={20} />
                </Grid>
              ))}
            </Grid>
            {/* Table Rows Skeleton */}
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <Box key={rowIndex} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #E5E7EB" , width: "100%" }}>
                <Grid container spacing={2}>
                  {Array.from({ length: 9 }).map((_, colIndex) => (
                      <Grid item size={{xs : 12 , sm  :6 , md : 1.3}} key={colIndex}>
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height="100%" 
                        sx={{ borderRadius: colIndex === 8 ? "20px" : 1 }} 
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FeeCollectionSkeleton;
