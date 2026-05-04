import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { GripVertical, Trash2 } from "lucide-react";
import { TextInput } from "..";

const QuestionCard = ({
    index = 1,
    questionText = "",
    tags = [],
    marks = 0,
    onMarksChange,
    onDelete,
    sx = {},
}) => {
    return (
        <Box
            sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                ...sx,
            }}
        >
            {/* Drag handle */}
            <Box sx={{ cursor: "grab", color: "#6B7280", flexShrink: 0 }}>
                <GripVertical size={20} />
            </Box>

            {/* Question number + text + tags */}
            <Box flex={1} minWidth={0}>
                <Typography fontSize={14} fontWeight={500} color="#374151" sx={{ lineHeight: 1.5 }}>
                    {index}. {questionText}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {tags.map((tag) => (
                        <Box
                            key={tag.label}
                            sx={{
                                bgcolor: tag.bg || "#E5E7EB",
                                color: tag.color || "#374151",
                                px: 1.5,
                                py: 0.25,
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 500,
                            }}
                        >
                            {tag.label}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Marks input */}
            <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                <TextInput
                    type="number"
                    fullWidth={false}
                    inputBgColor="#fff"
                    value={String(marks)}
                    onChange={(e) => onMarksChange?.(Number(e.target.value) || 0)}
                    sx={{
                        width: 56,
                        "& .MuiInputBase-input": { textAlign: "center", py: 0.75 },
                    }}
                />
                <Typography fontSize={14} fontWeight={500} color="#6B7280">
                    marks
                </Typography>
            </Box>

            {/* Delete icon */}
            <IconButton
                onClick={onDelete}
                size="small"
                sx={{
                    color: "#EF4444",
                    "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
                    flexShrink: 0,
                }}
            >
                <Trash2 size={20} strokeWidth={2} />
            </IconButton>
        </Box>
    );
};

export default QuestionCard;
