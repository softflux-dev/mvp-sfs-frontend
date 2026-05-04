import React from "react";
import { Box, Typography } from "@mui/material";

const HeaderSection = ({ title, subtitle, icon , onBack }) => {
    return (
        <Box display={"flex"} gap={"15px"} alignItems={"center"}>
            {icon && (
                <Box
                    onClick={onBack}
                    border={"2px solid #000000"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    p={1.5}
                    borderRadius={"10px"}
                    width={"50px"}
                    height={"50px"}
                >
                    <img src={icon} style={{ width: 25, height: 25 }} />
                </Box>
            )}
            <Box>
                <Typography variant="createTemplatesText">{title}</Typography>
                {subtitle && <Typography fontSize={"13px"} color="#00000080">{subtitle}</Typography>}
            </Box>
        </Box>
    );
};

export default HeaderSection;
