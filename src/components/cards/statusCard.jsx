import React from "react";
import {
  Card,
  Typography,
  Box,
  Avatar,
  Divider,
  styled,
} from "@mui/material";
import CustomButton from "../customButton/index";
import { useTranslation } from "react-i18next";

const FeeStatusCard = () => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "24px",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Card Title */}
        <Typography variant="h6" fontWeight={700} mb={3} color="text.primary" >
            {t("dashboard.feeStatus.title")}
        </Typography>

        {/* Content Row */}
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Avatar with initials */}
            <Avatar 
              sx={{
                bgcolor: "#f5f7f9",
                color: "#000",
                fontWeight: 700,
                width: 48,
                height: 48,
              }}
            >
                {t("dashboard.feeStatus.profileWord")}
            </Avatar>

            <Box>
              <Typography fontWeight={600} fontSize={16} lineHeight={1.2}
              >
                {t("dashboard.feeStatus.profileName")}
              </Typography>
              <Typography
                variant="body2" fontWeight={500} color="text.light" 
              >
                {t("dashboard.feeStatus.term")}
              </Typography>
            </Box>
          </Box>

          {/* Amount */}
          <Typography color="text.light" fontWeight={500} fontSize={14}
          >
            $4,500
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "#f0f0f0" }} />

      {/* Button Section */}
      <Box sx={{ p: 4 }}>
        <CustomButton
          variant={"gradient"}
          width={"100%"}
          btnLabel={t("dashboard.feeStatus.payBtn")}
        />
      </Box>
    </Card>
  );
};

export default FeeStatusCard;
