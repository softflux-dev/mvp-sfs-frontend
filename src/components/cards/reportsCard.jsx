import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { CustomButton } from "../../components";
import testIcon from "../../assets/icons/test.svg";
import ReportModal from "../../app/students/reports/reportModal";

const ReportsCard = ({ data, onView }) => {
  // 🔥 Modal State
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        p: 1,
      }}
    >
      <CardContent>
        {/* Header Section */}
        <Box display={"flex"} alignItems={"center"} mb={2}>
          {/* Icon Box */}
          <Box
            p={1}
            bgcolor={"primary.lightGray"}
            borderRadius={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mr={2}
          >
            {data?.icon || testIcon}
          </Box>

          <Typography
            variant="h6"
            paddingRight={2}
            fontWeight={700}
            flexGrow={1}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            {data?.title}
          </Typography>

          <Chip label={data?.chip} variant="success" />
        </Box>

        {/* Text Section */}
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {data?.description}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            {data?.paper}
          </Typography>
        </Box>
      </CardContent>

      <Divider sx={{ my: 2, opacity: 0.5 }} />

      {/* Buttons Section */}
      <Stack direction="row" gap={2}>
        <CustomButton
          btnBgColor={"primary.lightGray"}
          btnTextColor={"text.primary"}
          width={"100%"}
          btnLabel={t("reports.reportCard.view")}
          handlePressBtn={onView}
        />

        <CustomButton
          variant={"gradient"}
          width={"100%"}
          btnLabel={t("reports.reportCard.saveChanges")}
        />
      </Stack>
    </Card>
  );
};

export default ReportsCard;
