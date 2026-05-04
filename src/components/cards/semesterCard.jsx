import React from "react";
import {
  Box,
  Typography,
  Card,
  LinearProgress,
  Stack,
  styled,
  linearProgressClasses,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import rightArrow from "../../assets/icons/rightArrow.svg";
import { useNavigate } from "react-router-dom";

// --- Custom Styled Progress Bar ---
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[100], // The background track
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    background: "linear-gradient(90deg, #FFB300 0%, #FF6D00 100%)",
  },
}));

const SemesterCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const summaryData = [
    { subject: t("attendance.summary.mathematics"), score: 82 },
    { subject: t("attendance.summary.chemistry"), score: 62 },
    { subject: t("attendance.summary.science"), score: 92 },
    { subject: t("attendance.summary.english"), score: 70 },
  ];

  return (
    <Card
      elevation={0}
      width={100}
      sx={{
        p: 3,
        borderRadius: "24px",
        border: "1px solid #f0f0f0",
        mt: 3,
      }}
    >
      {/* Header Section */}
      <Box
        mb={4}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            lineHeight={1.2}
            color="primary.text"
          >
            {t("attendance.summary.title")}
          </Typography>
          <Typography variant="caption" fontWeight={"500"} color="text.light">
            {t("attendance.summary.subtitle")}
          </Typography>
        </Box>

        <Typography
          onClick={() => navigate("/attendance/monthly")}
          display={"flex"}
          alignItems={"center"}
          fontSize={"0.8rem"}
          fontWeight={"600"}
          gap={2}
          sx={{
            background:
              "linear-gradient(291.77deg, #FBD604 -17.46%, #EF5322 92.52%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            cursor: "pointer",

            //  UNDERLINE
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: "-2px",
              width: "100%",
              height: "2px",
              background:
                "linear-gradient(291.77deg, #FBD604 -17.46%, #EF5322 92.52%)",
            },
          }}
        >
          {t("attendance.summary.viewMonth")} <img src={rightArrow} />
        </Typography>
      </Box>

      {/* Progress Bars Section */}
      <Stack spacing={3} mt={4}>
        {summaryData.map((item, index) => (
          <Box key={index}>
            {/* Label and Percentage Row */}
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              marginBottom={1}
            >
              <Typography
                variant="caption"
                color="text.light"
                fontWeight={"500"}
                fontSize={"0.75rem"}
              >
                {item.subject}
              </Typography>
              <Typography
                variant="caption"
                color="text.light"
                fontWeight={"500"}
                fontSize={"0.75rem"}
              >
                {item.score}%
              </Typography>
            </Box>

            {/* The Gradient Bar */}
            <BorderLinearProgress variant="determinate" value={item.score} />
          </Box>
        ))}
      </Stack>
    </Card>
  );
};

export default SemesterCard;
