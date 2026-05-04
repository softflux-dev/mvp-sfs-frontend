import React from "react";
import { Box, Typography, Chip, IconButton } from "@mui/material";
import CustomButton from "../customButton";
import { Edit, Trash2, Clock, Users, BookOpen } from "lucide-react";
import CustomSelect from "../customSelect";
import CustomSwitch from "../switch";

const ProgramCard = ({ program, onEdit, onDelete, onManageCurriculum , onStatusChange }) => {
    const getTrainingTypeColor = (type) => {
        switch (type) {
            case "cooperative":
                return "rgba(249, 116, 22, 0.57)"; // Blue
            case "practical":
                return "rgba(82, 249, 22, 0.57)"; // Green
            case "both":
                return "rgba(109, 22, 249, 0.57)"; // Blue
            default:
                return "rgba(133, 133, 134, 0.57)"; // Gray
        }
    };

    const getTrainingTypeLabel = (type) => {
        switch (type) {
            case "cooperative":
                return "Cooperative";
            case "practical":
                return "Practical";
            case "both":
                return "Both";
            default:
                return "";
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                p: 3,
                border: "1px solid #E5E7EB",
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        width={40}
                        height={40}
                        borderRadius="10px"
                        backgroundColor="#FFF7ED"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <BookOpen size={20} color="#F97316" />
                    </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                        label={program.programCode}
                        sx={{
                            backgroundColor: "#F97316",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "12px",
                            height: "28px",
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(program)}
                        sx={{
                            width: 32,
                            height: 32,
                            "&:hover": { backgroundColor: "#F3F4F6" },
                        }}
                    >
                        <Edit size={16} color="#6B7280" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(program)}
                        sx={{
                            width: 32,
                            height: 32,
                            "&:hover": { backgroundColor: "#FEE2E2" },
                        }}
                    >
                        <Trash2 size={16} color="#EF4444" />
                    </IconButton>
                </Box>
            </Box>

            {/* Program Title */}
            <Typography
                variant="h6"
                fontWeight={700}
                fontSize="18px"
                color="#000"
                mb={0.5}
            >
                {program.programNameEn}
            </Typography>
            <Typography
                variant="body2"
                fontSize="14px"
                color="#6B7280"
                mb={2}
            >
                {program.programNameAr}
            </Typography>

            {/* Program Details */}
            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1.5} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Clock size={16} color="#6B7280" />
                    <Typography variant="body2" fontSize="14px" color="#374151">
                        {program.duration} Months
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <BookOpen size={16} color="#6B7280" />
                    <Typography variant="body2" fontSize="14px" color="#374151">
                        {program.totalCreditHours} Credits
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <Users size={16} color="#6B7280" />
                    <Typography variant="body2" fontSize="14px" color="#374151">
                        {program.totalSemesters} Semesters
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <BookOpen size={16} color="#6B7280" />
                    <Typography variant="body2" fontSize="14px" color="#374151">
                        {program.totalSubjects || 0} Subjects
                    </Typography>
                </Box>
            </Box>

            {/* Feature Tags */}
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {program.summerTrainingRequired && program.summerTrainingType && (
                    <Chip
                        label={getTrainingTypeLabel(program.summerTrainingType)}
                        size="small"
                        sx={{
                            backgroundColor: getTrainingTypeColor(program.summerTrainingType),
                            color: "#fff",
                            fontSize: "11px",
                            height: "24px",
                            fontWeight: 500,
                        }}
                    />
                )}
                {program.summerAcceleration && (
                    <Chip
                        label="Acceleration"
                        size="small"
                        sx={{
                            backgroundColor: "#FBD604",
                            color: "#000",
                            fontSize: "11px",
                            height: "24px",
                            fontWeight: 500,
                        }}
                    />
                )}
                {program.curriculumSet && (
                    <Chip
                        label="Curriculum Set"
                        size="small"
                        sx={{
                            backgroundColor: "#10B981",
                            color: "#fff",
                            fontSize: "11px",
                            height: "24px",
                            fontWeight: 500,
                        }}
                    />
                )}
            </Box>


            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" fontSize="14px" color="#374151" fontWeight={500}>
                    Status:
                </Typography>
                <CustomSwitch
                    checked={program.status === "active" || program.status === "Active"}
                    onChange={(e) => {
                        if (onStatusChange) {
                            onStatusChange(program);
                        }
                    }}
                />
            </Box>


            {/* Manage Curriculum Button */}
            <CustomButton
                btnLabel="Manage Curriculum"
                variant="grayOutlined"
                handlePressBtn={() => onManageCurriculum && onManageCurriculum(program)}
                startIcon={<BookOpen size={16} />}
                width="100%"
            />
        </Box>
    );
};

export default ProgramCard;
