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
import rightArrow from "../../assets/icons/rightArrow.svg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ProgressBarCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const coursesData = [
    { subject: t("dashboard.courses.mathematics"), score: 75 },
    { subject: t("dashboard.courses.chemistry"), score: 60 },
    { subject: t("dashboard.courses.physics"), score: 45 },
  ];

  return (
    <Box>
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              lineHeight={1.2}
              color="primary.text"
            >
              {t("dashboard.courses.title")}
            </Typography>
            <Typography variant="caption" fontWeight={"500"} color="text.light">
              {t("dashboard.courses.subtitle")}
            </Typography>
          </Box>

          <Typography
            onClick={() => navigate("/my-courses")}
            color="gradient.primary"
            display={"flex"}
            alignItems={"center"}
            fontSize={"0.8rem"}
            fontWeight={"600"}
            sx={{
              background:
                "linear-gradient(291.77deg, #FBD604 -17.46%, #EF5322 92.52%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              gap: "8px",
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
            {t("dashboard.courses.viewAll")} <img src={rightArrow} />
          </Typography>
        </Box>

        {/* Progress Bars Section */}
        <Stack spacing={3} mt={4}>
          {coursesData.map((item, index) => (
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
    </Box>
  );
};

export default ProgressBarCard;
