import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { BookOpen, Clock, Tag, MapPin } from "lucide-react";
import CustomButton from "../customButton";

const iconMap = {
    clock: Clock,
    book: BookOpen,
    tag: Tag,
    mapPin: MapPin,
};

/**
 * Reusable Course Info Card
 * @param {string} titleEn - Course title (English)
 * @param {string} titleAr - Course title (Arabic)
 * @param {string} batchTag - Batch tag e.g. "2025-A"
 * @param {Array} details - [{ label, value?, type?, icon?, tags? }]
 * @param {string} btnLabel - Button text
 * @param {function} onViewDetails - Button click handler
 */
const CourseInfoCard = ({
    titleEn = "Data Structures & Algorithms",
    titleAr = "هياكل البيانات والخوارزميات",
    batchTag = "2025-A",
    details = [
        {
            label: "Credits Hours",
            type: "tags",
            icon: "clock",
            tags: [
                { label: "Lecture: 3h", bg: "#E0F2F7", color: "#2563EB" },
                { label: "Lab: 2h", bg: "#FFEFE7", color: "#FF7F4C" },
            ],
        },
        { label: "Prerequisite", value: "Programming Fundamentals", icon: "book" },
        { label: "Subject code", value: "CS201", icon: "tag" },
        { label: "Branch", value: "Riyadh", icon: "mapPin" },
    ],
    btnLabel = "View Details",
    onViewDetails,
    sx = {},
}) => {
    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 3,
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-4px)",
                },
                ...sx,
            }}
        >
            {/* Top: Icon + Batch Tag */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "#F5F5F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <BookOpen size={24} color="orange" strokeWidth={2} />
                </Box>
                <Chip
                    label={batchTag}
                    sx={{
                        backgroundColor: "background.cardLight",
                        color: "text.lightColor",
                        fontSize: "14px",
                        height: "28px",
                        borderRadius: "20px",
                    }}
                />
            </Box>

            {/* Titles */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
                <Typography variant="primaryText" fontSize={21} fontWeight={700} sx={{ flex: 1 }}>
                    {titleEn}
                </Typography>
                <Typography fontSize={22} fontWeight={400} color="#00000080" sx={{ flex: 1, textAlign: "right" }}>
                    {titleAr}
                </Typography>
            </Box>

            {/* Details List */}
            <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
                {details.map((item, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            {item.icon && iconMap[item.icon] && (
                                <Box sx={{ display: "flex" }}>
                                    {React.createElement(iconMap[item.icon], { size: 16, color: "#F97316" })}
                                </Box>
                            )}
                            <Typography fontSize={14} fontWeight={500} color="#00000080">
                                {item.label}:
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" justifyContent="flex-end">
                            {item.type === "tags" && item.tags ? (
                                item.tags.map((tag, i) => (
                                    <Chip
                                        key={i}
                                        label={tag.label}
                                        size="small"
                                        sx={{
                                            backgroundColor: tag.bg,
                                            color: tag.color,
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            height: "24px",
                                            borderRadius: "20px",
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography fontSize={14} fontWeight={500} color="#00000080">
                                    {item.value}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* View Details Button */}
            <CustomButton
                btnLabel={btnLabel}
                variant="viewDetailsBtn"
                handlePressBtn={onViewDetails || (() => { })}
                btnTextColor="#fff"
            />
        </Box>
    );
};

export default CourseInfoCard;