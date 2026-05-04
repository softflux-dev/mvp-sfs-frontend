import React from "react";
import { Box, Card, Stack, Switch, Typography } from "@mui/material";
import testIcon from "../../assets/icons/test.svg";
import CustomSwitch from "../../components/switch";

// Reusable Notification Card Component
const NotificationCard = ({
  icon,
  title,
  description,
  checked = true,
  onChange,
}) => {
  // console.log(icon,"Sdskjdskjdskjdskjds")

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "none !important",
        p: 2,
        bgcolor: "primary.lightGray",
        mb: 2,
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            width={40}
            height={40}
            borderRadius={2}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            bgcolor={"background.default"}
          >
            {<img src={icon} alt="icon" height={25} width={25} />}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>

        <CustomSwitch checked={checked} onChange={onChange} />
      </Box>
    </Card>
  );
};

export default NotificationCard;
