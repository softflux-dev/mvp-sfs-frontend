import { Card, CardContent, Box, Stack, Skeleton } from "@mui/material";

const AnnouncementCardSkeleton = () => {
    return (
        <Card
            sx={{
                mb: 2,
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
                borderRadius: "18px",
                boxShadow: "none",
                backgroundColor: "#fff",
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    <Box flex={1}>

                        {/* Title */}
                        <Skeleton variant="text" width="40%" height={20} />

                        {/* Meta */}
                        <Stack direction="row" spacing={2} mt={1} mb={2}>
                            <Skeleton variant="text" width={80} height={15} />
                            <Skeleton variant="text" width={100} height={15} />
                        </Stack>

                        {/* Description */}
                        <Skeleton variant="text" width="90%" height={15} />
                        <Skeleton variant="text" width="85%" height={15} />
                    </Box>

                    {/* Delete icon skeleton */}
                    <Skeleton
                        variant="circular"
                        width={30}
                        height={30}
                        sx={{ ml: 2 }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default AnnouncementCardSkeleton;