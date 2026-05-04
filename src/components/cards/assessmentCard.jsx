import { Box, Typography } from "@mui/material";

const AssessmentCard = ({ 
    icon, 
    label, 
    mainValue, 
    convertedValue, 
    isTotal = false,
    points,
    flex = "1 1 150px",
    minWidth = "120px"
}) => {
    return (
        <Box 
            sx={{ 
                flex,
                minWidth,
                p: 2, 
                backgroundColor: isTotal ? "#F97316" : "#F9FAFB", 
                borderRadius: "8px", 
                border: isTotal ? "none" : "1px solid #E5E7EB",
                color: isTotal ? "#fff" : "inherit"
            }}
        >
            {!isTotal && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    {icon}
                    <Typography fontSize="12px" fontWeight={600} color="#6B7280">
                        {label}
                    </Typography>
                </Box>
            )}
            
            {isTotal && (
                <Typography fontSize="12px" fontWeight={600} mb={1}>
                    {label}
                </Typography>
            )}

            <Typography 
                fontSize={isTotal ? "18px" : "14px"} 
                fontWeight={700} 
                color={isTotal ? "#fff" : "#000"}
                mb={isTotal ? 0.5 : 0}
            >
                {mainValue}
            </Typography>

            {convertedValue && (
                <Typography fontSize="12px" color={isTotal ? "#fff" : "#6B7280"}>
                    {convertedValue}
                </Typography>
            )}

            {isTotal && points && (
                <Typography fontSize="12px" fontWeight={600} color="#fff">
                    {points}
                </Typography>
            )}
        </Box>
    );
};

export default AssessmentCard;
