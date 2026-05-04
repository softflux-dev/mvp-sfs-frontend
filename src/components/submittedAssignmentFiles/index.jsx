import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { FileText, Trash2 } from "lucide-react";

const SubmittedAssignmentFiles = ({ files = [], onRemove, title = "Submitted Assignment" }) => {
    if (!files?.length) return null;

    return (
        <Box>
            <Typography
                fontSize="14px"
                fontWeight={600}
                color="#030229"
                sx={{ mb: 1.5 }}
            >
                {title}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                {files.map((file, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                            padding: "12px 16px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            minWidth: 0,
                            flex: "1 1 auto",
                            maxWidth: { xs: "100%", sm: "calc(50% - 6px)" },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                backgroundColor: "#F973161A",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <FileText size={22} color="#F97316" strokeWidth={2} />
                        </Box>
                        <Typography
                            fontSize="13px"
                            fontWeight={500}
                            color="#6B7280"
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {file?.name || file?.fileName || "Untitled"}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => onRemove?.(index)}
                            sx={{
                                color: "#F97316",
                                padding: "6px",
                                "&:hover": {
                                    backgroundColor: "#F973161A",
                                },
                            }}
                        >
                            <Trash2 size={18} strokeWidth={2} />
                        </IconButton>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default SubmittedAssignmentFiles;
