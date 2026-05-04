import { Card, Box, Typography } from "@mui/material";


const SecondaryAlertCard = ({ title, value, onClick, isSelected = false }) => {
    return (
        <Card 
            onClick={onClick}
            sx={{
                borderRadius: "16px",
                height: "100%",
                border: isSelected ? "2px solid #F97316" : "1px solid #ffcccc",
                boxShadow: isSelected ? "0 4px 12px rgba(249, 115, 22, 0.2)" : "none",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    border: "2px solid #F97316",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Box display="flex" flexDirection="column" gap={1}>
                <Typography fontSize="16px" fontWeight={500} color="text.black">{value}</Typography>
                <Typography fontSize="12px" color="text.black">{title}</Typography>

            </Box>
        </Card>
    );
};

export default SecondaryAlertCard;