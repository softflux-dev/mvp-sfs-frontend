import { Box, Typography } from "@mui/material";

const InfoCard = ({ label, content }) => (
    <Box
        sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px",
            p: 2.5,
        }}
    >
        <Typography
            sx={{
                fontSize: "14px",
                fontWeight: 400,
                color: "#67768B",
                mb: 1,
            }}
        >
            {label}
        </Typography>
        <Typography
            sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#000000",
                lineHeight: 1.5,
            }}
        >
            {content}
        </Typography>
    </Box>
);
export default InfoCard;