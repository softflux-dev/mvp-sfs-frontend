import React from "react";
import { Box, Card, Typography, Stack, IconButton } from "@mui/material";
import { Title } from "@mui/icons-material";

const MessageAlertCard = ({ title, subject, dueDate, icon, mt }) => {
    return (
        <Box
            display={"flex"}
            justifyContent={"space-between"}
            p={2}
            borderRadius={5}
            mt={mt || 2} // fallback to 0 if no mt provided
            bgcolor={"primary.lightGray"}
        >
            <Box>
                <Typography color="text.color" fontWeight={600} fontSize={18}>
                    {title}
                </Typography>
                <Typography fontSize={12} color="text.disabled" fontWeight={400}>
                    {subject}
                </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={0.5}>
                <Box>
                    <img src={icon} style={{ width: 12, height: 12 }} alt="Notification Icon" />
                </Box>
                <Box>
                    <Typography fontSize={12} fontWeight={500} color="#9CA3AF">
                        {dueDate}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default MessageAlertCard;
