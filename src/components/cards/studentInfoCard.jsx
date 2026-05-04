import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Subject Info Card - Grid layout with label/value pairs
 * @param {Array} items - [{ label, value }] - 6 items for 3x2 grid
 * @param {Object} sx - Optional MUI sx override
 */
const SubjectInfoCard = ({
    items,
    sx = {},
}) => {
    return (
        <Box
            sx={{
                backgroundColor: "primary.lightGray",
                borderRadius: "16px",
                p: 2,
                ...sx,
            }}
        >
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
                gap={2}
            >
                {items.map((item, index) => (
                    <Box key={index} display="flex" flexDirection="column" gap={0.5}>
                        <Typography
                            fontSize={12}
                            fontWeight={500}
                            color="#6B7280"
                        >
                            {item.label}
                        </Typography>
                        <Typography
                            fontSize={16}
                            fontWeight={700}
                            color="#111827"
                        >
                            {item.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default SubjectInfoCard;