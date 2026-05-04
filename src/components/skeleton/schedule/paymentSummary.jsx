import { Box, Grid, Typography, Skeleton } from '@mui/material'
import React from 'react'

const PaymentSummarySkeleton = () => {
    return (
        <Box bgcolor={"background.dark"} borderRadius={"20px"} p={2} mt={2}>
            {/* Title Skeleton */}
            <Skeleton
                variant="text"
                width={200}
                height={32}
                sx={{ borderRadius: '8px' }}
            />
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {[1, 2, 3, 4, 5].map((item) => (
                    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }} key={item}>
                        <Box
                            sx={{
                                borderRadius: '12px',
                                p: 2,
                                bgcolor: 'background.paper',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            {/* Title / Amount Skeleton */}
                            <Skeleton
                                variant="text"
                                width={'60%'}
                                height={45}
                                sx={{ borderRadius: '6px' }}
                            />

                            {/* Description Skeleton */}
                            <Skeleton
                                variant="text"
                                width={'85%'}
                                height={22}
                                sx={{ borderRadius: '6px' }}
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default PaymentSummarySkeleton