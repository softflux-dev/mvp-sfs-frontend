import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import { Bell, Calendar } from "lucide-react";

const UpcomingDeadlines = ({ deadlines = [] }) => {
    console.log("fufhuhfurfgyrfrf", deadlines);

    // deadlines ko props se receive kiya ja raha hai
    // agar kuch nahi mile to default empty array use hoga

    return (
        <Card
            sx={{
                borderRadius: "16px",
                boxShadow: "none",
                backgroundColor: "#FFFFFF",
                height: "100%",
            }}
        >
            <CardContent sx={{ p: 1 }}>


                <Stack spacing={2}>
                    {deadlines.map((deadline) => (
                        <Box
                            key={deadline.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1.3,
                                borderRadius: "16px",
                                backgroundColor: "primary.lightGray",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #F97316 0%, #FBD604 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Bell size={22} color="#FFFFFF" strokeWidth={2} />
                            </Box>

                            <Box flex={1} minWidth={0}>
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-block",
                                        px: 1.5,
                                        py: 0.25,
                                        borderRadius: "20px",
                                        backgroundColor: deadline.category === "Assignment" ? "background.lightBlack" : deadline.category === "Meeting" ? "background.emeraldGreen" : deadline.category === "Exam" ? "background.lightRed" : "#F0F9FF",
                                        color: deadline.category === "Assignment" ? "text.color" : deadline.category === "Meeting" ? "#04C373" : deadline.category === "Exam" ? "#FF0000" : "#2563EB",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    {deadline.category}
                                </Box>
                                <Typography
                                    sx={{ display: "block", lineHeight: 1.4 }}
                                    variant="primaryText"
                                >
                                    {deadline.title}
                                </Typography>
                            </Box>

                            {/* Right: Calendar + Date */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                    color: "#9CA3AF",
                                    flexShrink: 0,
                                }}
                            >
                                <Calendar size={16} color="#9CA3AF" />
                                <Typography fontSize={12} fontWeight={500} color="#9CA3AF">
                                    {deadline.date}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default UpcomingDeadlines;