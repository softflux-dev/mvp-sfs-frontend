import React from "react";
import { Box, Typography } from "@mui/material";
import { FileText, Download } from "lucide-react";
import CustomButton from "../customButton";


const ResourceDownloadCard = ({
    title = "Database System Concepts - Silberschatz",
    typeLabel = "No materials uploaded yet.",
    onDownload,
    showDownloadButton = false,
    sx = {},
    downloadableLabel = "Downloadable",
    variant = "contained",
}) => {
    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                ...sx,
            }}
        >
            {/* Left: Orange icon box */}
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #FF7F50, #F97316)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <FileText size={24} color="#FFFFFF" strokeWidth={2} />
            </Box>

            {/* Middle: Title + type label */}
            <Box flex={1} minWidth={0}>
                <Typography
                    fontSize={16}
                    fontWeight={700}
                    color="#111827"
                    sx={{ lineHeight: 1.4 }}
                >
                    {title}
                </Typography>
                <Typography
                    fontSize={12}
                    fontWeight={500}
                    color="#6B7280"
                    sx={{ mt: 0.5 }}
                >
                    {typeLabel}
                </Typography>
            </Box>

            {/* Right: Download button ya Downloadable tag */}
            {showDownloadButton ? (
                <CustomButton
                    btnLabel="Download"
                    handlePressBtn={onDownload || (() => { })}
                    startIcon={<Download size={16} color="#374151" />}
                    sx={{
                        backgroundColor: "#E0E0E0",
                        color: "#111827",
                        fontWeight: 600,
                        flexShrink: 0,
                        "&:hover": { backgroundColor: "#D5D5D5" },
                    }}
                />
            ) : (
                <Box
                variant={variant}
                    sx={{
                        backgroundColor: "#E0E0E0",
                        color: "#111827",
                        fontSize: "14px",
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        borderRadius: "20px",
                        flexShrink: 0,

                    }}
                >
                    {downloadableLabel || "Downloadable"}
                </Box>
            )}
        </Box>
    );
};

export default ResourceDownloadCard;