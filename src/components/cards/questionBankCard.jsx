import React from "react";
import { Box, Typography } from "@mui/material";
import {
    BarChart2,
    Building2,
    User,
    Calendar,
    Check,
} from "lucide-react";
import ActionsButtons from "../dynamicTable/actionsButtons";
 
const QuestionBankCard = ({
    questionText = "",
    questionType = "mcq",
    difficulty = "easy",
    marks = 0,
    usageCount = 0,
    topicTags = [],
    mcqOptions = [],
    branch = "",
    createdBy = "",
    createdDate = "",
    selected = false,
    selectedOptionLabel = null,
    onSelect,
    onOptionClick,
    onViewDetails,
    onEdit,
    onDuplicate,
    onDelete,
    row,
    sx = {},
}) => {
    const difficultyColors = {
        easy: { bg: "#4B4B4B", color: "#fff" },
        medium: { bg: "#F97316", color: "#fff" },
        hard: { bg: "#DC2626", color: "#fff" },
    };
    const diffStyle = difficultyColors[difficulty?.toLowerCase()] || difficultyColors.easy;

    const questionTypeLabel = {
        mcq: "MCQ",
        short_answer: "Short Answer",
        long_answer: "Long Answer",
    }[questionType] || questionType;

    const questionRow = row || {
        id: null,
        questionText,
        questionType,
        difficulty,
        marks,
        usageCount,
        topicTags,
        mcqOptions,
        branch,
        createdBy,
        createdDate,
    };

    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 2,
                position: "relative",
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                border: selected ? "2px solid #F97316" : "2px solid transparent",
                ...sx,
            }}
        >
            {/* Top row: Selection circle + Tags + Menu */}
            <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                {/* Selection circle */}
                <Box
                    onClick={() => onSelect?.()}
                    sx={{
                        cursor: "pointer",
                        mt: 0.25,
                        border: `2px solid ${selected ? "#F97316" : "#9CA3AF"}`,
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        "&:hover": { borderColor: "#F97316", bgcolor: "rgba(249,115,22,0.08)" },
                    }}
                >
                    {selected && (
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: "#F97316",
                            }}
                        />
                    )}
                </Box>

                {/* Top tags */}
                <Box display="flex" flexWrap="wrap" gap={1} flex={1}>
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
                    <Box
                        sx={{
                            bgcolor: questionType === "mcq" ? "#fff" : "#E5E7EB",
                            color: "#374151",
                            border: questionType === "mcq" ? "1px solid #E5E7EB" : "none",
                            px: 1.5,
                            py: 0.25,
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                        }}
                    >
                        {questionTypeLabel}
                    </Box>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            color: "#374151",
                            border: "1px solid #E5E7EB",
                            px: 1.5,
                            py: 0.25,
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                        }}
                    >
                        {marks} marks
                    </Box>
                    <Box
                        sx={{
                            bgcolor: "#4B4B4B",
                            color: "#fff",
                            px: 1.5,
                            py: 0.25,
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                        }}
                    >
                        <BarChart2 size={12} />
                        Used {usageCount}x
                    </Box>
                </Box>

                {/* Actions - ActionsButtons */}
                <ActionsButtons
                    row={questionRow}
                    onViewDetails={!!onViewDetails}
                    onViewDetailsClick={(r) => onViewDetails?.(r)}
                    onEditQuestion={!!onEdit}
                    onEditQuestionClick={(r) => onEdit?.(r)}
                    onDuplicateQuestion={!!onDuplicate}
                    onDuplicateQuestionClick={(r) => onDuplicate?.(r)}
                    onDeleteQuestion={!!onDelete}
                    onDeleteQuestionClick={(r) => onDelete?.(r)}
                />
            </Box>

            {/* Question text */}
            <Typography fontSize={15} fontWeight={600} color="#111827" sx={{ lineHeight: 1.5, mb: 1.5 }}>
                {questionText}
            </Typography>

            {/* MCQ options */}
            {questionType === "mcq" && mcqOptions?.length > 0 && (
                <Box display="flex" flexDirection="column" gap={1} mb={1.5}>
                    {mcqOptions.map((opt) => {
                        const isUserSelected = selectedOptionLabel === opt.label;
                        const isCorrect = opt.isCorrect;
                        return (
                            <Box
                                key={opt.label}
                                onClick={() => onOptionClick?.(opt)}
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{
                                    py: 0.75,
                                    px: 1.5,
                                    borderRadius: "8px",
                                    cursor: onOptionClick ? "pointer" : "default",
                                    bgcolor: isUserSelected
                                        ? "rgba(249,115,22,0.12)"
                                        : isCorrect && !onOptionClick
                                            ? "rgba(34,197,94,0.08)"
                                            : "transparent",
                                    border: isUserSelected ? "2px solid #F97316" : "2px solid transparent",
                                    transition: "all 0.2s ease",
                                    "&:hover": onOptionClick
                                        ? { bgcolor: isUserSelected ? "rgba(249,115,22,0.18)" : "rgba(249,115,22,0.06)" }
                                        : {},
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        border: `2px solid ${isUserSelected ? "#F97316" : isCorrect && !onOptionClick ? "#22C55E" : "#9CA3AF"}`,
                                        bgcolor: isUserSelected ? "#F97316" : isCorrect && !onOptionClick ? "#22C55E" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {(isUserSelected || (isCorrect && !onOptionClick)) && (
                                        <Check size={10} color="#fff" strokeWidth={3} />
                                    )}
                                </Box>
                                <Typography
                                    fontSize={14}
                                    fontWeight={500}
                                    color={isUserSelected ? "#F97316" : isCorrect && !onOptionClick ? "#22C55E" : "#374151"}
                                >
                                    {opt.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Topic tags */}
            {(() => {
                const tagsArray = Array.isArray(topicTags) ? topicTags : (typeof topicTags === "string" ? [topicTags] : []);
                return tagsArray.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
                    {tagsArray.map((tag) => (
                        <Box
                            key={tag}
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
                            {tag}
                        </Box>
                    ))}
                </Box>
            );
            })()}

            {/* Footer */}
            <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                sx={{ pt: 1, borderTop: "1px solid #E5E7EB" }}
            >
                {branch && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Building2 size={14} color="#6B7280" />
                        <Typography fontSize={12} fontWeight={500} color="#6B7280">
                            {branch}
                        </Typography>
                    </Box>
                )}
                {createdBy && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <User size={14} color="#6B7280" />
                        <Typography fontSize={12} fontWeight={500} color="#6B7280">
                            {createdBy}
                        </Typography>
                    </Box>
                )}
                {createdDate && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Calendar size={14} color="#6B7280" />
                        <Typography fontSize={12} fontWeight={500} color="#6B7280">
                            {createdDate}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default QuestionBankCard;
