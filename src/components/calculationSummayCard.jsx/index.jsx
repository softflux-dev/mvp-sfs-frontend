import { Box, Typography } from '@mui/material'
import React from 'react'

const CalulationStats = ({ tittle, description, isSelected, onClick, tittleFontSize, descriptionFontSize, tittleFontWeight, descriptionfontWeight }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                background: isSelected
                    ? "linear-gradient(to right, #FBD604, #EF5322 , #EF5322)"
                    : "#F6F6F6",
                p: 2,
                borderRadius: "20px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                color: isSelected ? "#fff" : "#000",

                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    background:
                        "linear-gradient(to right, #FBD604, #EF5322 , #EF5322)",
                    "& .calc-text": {
                        color: "#fff",
                    }
                }
            }}
        >
            <Typography
                className="calc-text"
                fontWeight={tittleFontWeight || 700}
                fontSize={tittleFontSize || "25px"}
                color={isSelected ? "#fff" : "text.primary"}
            >
                {tittle}
            </Typography>

            <Typography
                className="calc-text"
                fontSize={descriptionFontSize || "16px"}
                color={isSelected ? "#fff" : "#000000E5"}
                fontWeight={descriptionfontWeight}
            >
                {description}
            </Typography>
        </Box>
    )
}

export default CalulationStats
