import React from "react";
import { Box, Typography } from "@mui/material";
import {
    BarChart2,
    Building2,
    User,
    Calendar,
} from "lucide-react";

const QuestionBankCardSkeleton = () => {
    const fakeOptions = ["", "", "", ""]; // placeholder 4 options
    const fakeTags = ["", "", ""]; // placeholder tags

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
        >
            {/* Top row */}
            <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                {/* Selection circle */}
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "2px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 0.25,
                    }}
                >
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#E5E7EB" }} />
                </Box>

                {/* Difficulty, Type, Marks, Usage placeholders */}
                <Box display="flex" flexWrap="wrap" gap={1} flex={1}>
                    <Box sx={{ bgcolor: "#E5E7EB", width: 40, height: 18, borderRadius: 1 }} />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 60, height: 18, borderRadius: 1 }} />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 40, height: 18, borderRadius: 1 }} />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 60, height: 18, borderRadius: 1, display: "flex", alignItems: "center", px: 1 }}>
                        <BarChart2 size={12} color="#ccc" />
                    </Box>
                </Box>
            </Box>

            {/* Question text */}
            <Box sx={{ bgcolor: "#E5E7EB", height: 20, width: "80%", mb: 1.5, borderRadius: 1 }} />

            {/* MCQ options */}
            <Box display="flex" flexDirection="column" gap={1} mb={1.5}>
                {fakeOptions.map((_, index) => (
                    <Box key={index} sx={{ bgcolor: "#E5E7EB", height: 18, borderRadius: 1 }} />
                ))}
            </Box>

            {/* Topic tags */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
                {fakeTags.map((_, index) => (
                    <Box key={index} sx={{ bgcolor: "#E5E7EB", height: 18, width: 50, borderRadius: 1 }} />
                ))}
            </Box>

            {/* Footer */}
            <Box display="flex" gap={2} flexWrap="wrap" sx={{ pt: 1, borderTop: "1px solid #E5E7EB" }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Building2 size={14} color="#E5E7EB" />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 60, height: 12, borderRadius: 1 }} />
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <User size={14} color="#E5E7EB" />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 60, height: 12, borderRadius: 1 }} />
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Calendar size={14} color="#E5E7EB" />
                    <Box sx={{ bgcolor: "#E5E7EB", width: 50, height: 12, borderRadius: 1 }} />
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionBankCardSkeleton;