import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Plus, Check } from "lucide-react";

const SelectableQuestionCard = ({
    questionText = "",
    questionType = "mcq",
    difficulty = "easy",
    marks = 0,
    usageCount = 0,
    selected = false,
    onSelect,
    onRemove,
    sx = {},
}) => {
    const difficultyColors = {
        easy: { bg: "#4B4B4B", color: "#fff" },
        medium: { bg: "#F97316", color: "#fff" },
        hard: { bg: "#DC2626", color: "#fff" },
    };
    const diffStyle = difficultyColors[difficulty?.toLowerCase()] || difficultyColors.easy;

    return (
        <Box
            sx={{
                backgroundColor: selected ? "#FFF7ED" : "#FFFFFF",
                border: `2px solid ${selected ? "#F97316" : "#E5E7EB"}`,
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 2,
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                ...sx,
            }}
        >
            {/* Action icon - top right: Plus (select) ya Checkmark (remove) */}
            <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                {selected ? (
                    <IconButton
                        size="small"
                        onClick={onRemove}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#F97316",
                            color: "#fff",
                            "&:hover": { bgcolor: "#EA580C" },
                        }}
                    >
                        <Check size={18} strokeWidth={2.5} />
                    </IconButton>
                ) : (
                    <IconButton
                        size="small"
                        onClick={onSelect}
                        sx={{
                            color: "#374151",
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                        }}
                    >
                        <Plus size={24} strokeWidth={2} />
                    </IconButton>
                )}
            </Box>

            {/* Question text */}
            <Typography
                fontSize={14}
                fontWeight={500}
                color="#374151"
                sx={{ lineHeight: 1.5, pr: 6 }}
            >
                {questionText}
            </Typography>

            {/* Tags row */}
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" sx={{ mt: 1.5 }}>
                <Box
                    sx={{
                        bgcolor: "#E5E7EB",
                        color: "#374151",
                        px: 1.5,
                        py: 0.25,
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                    }}
                >
                    {questionType}
                </Box>
                <Box
                    sx={{
                        bgcolor: diffStyle.bg,
                        color: diffStyle.color,
                        px: 1.5,
                        py: 0.25,
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                    }}
                >
                    {difficulty}
                </Box>
                <Typography fontSize={12} fontWeight={500} color="#6B7280">
                    {marks} marks
                </Typography>
                <Typography fontSize={12} fontWeight={500} color="#6B7280">
                    Used {usageCount}x
                </Typography>
            </Box>
        </Box>
    );
};

export default SelectableQuestionCard;
