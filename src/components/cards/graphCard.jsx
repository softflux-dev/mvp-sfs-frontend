import React from "react";
import { Box, Typography, Grid, Stack, Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const GraphCard = () => {
  const { t } = useTranslation();

  // chart data
  const data = [
    { name: "Present", value: 141, color: "url(#presentGradient)" },
    { name: "Absent", value: 9, color: "#FF5252" }, // Reddish color
  ];

  const total = data.reduce((acc, entry) => acc + entry.value, 0);
  const attendanceRate = Math.round((data[0].value / total) * 100);

  return (
    <Box container spacing={3}>
      <Card
        sx={{
          p: 3,
          borderRadius: "24px",
          boxShadow: "none",
          margin: "auto",
          width: "100%",
          height: {
            xs: 420,
            sm: 375,
          },
        }}
      >
        {/* Heading */}
        <Typography variant="h6" fontWeight={700} mb={4} align="left">
          {t("dashboard.attendanceGraph.title")}
        </Typography>

        {/* Container for the Chart and Center Text */}
        <Box sx={{ position: "relative", width: "100%", height: 230 }}>
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {/* Gradient for the 'Present' section */}
                <linearGradient
                  id="presentGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#FB8C00" />
                  <stop offset="100%" stopColor="#FFD600" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute positioned text in the center of the Donut */}
          <Box
            position={"absolute"}
            textAlign={"center"}
            sx={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography variant="body1" fontWeight={500} color="text.secondary">
              Attendance Rate
            </Typography>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              {attendanceRate}%
            </Typography>
          </Box>
        </Box>

        {/* Custom Legend using MUI */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          justifyContent="center"
          mt={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            dir="ltr"
            justifyContent="center"
          >
            <Box
              width={15}
              height={15}
              borderRadius={50}
              sx={{
                background: "linear-gradient(to right, #FB8C00, #FFD600)",
              }}
            />
            <Typography
              variant="caption"
              color="text.dark"
              fontSize={14}
              fontWeight={500}
            >
              Present: {data[0].value} Days
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            dir="ltr"
            justifyContent="center"
          >
            <Box
              width={15}
              height={15}
              borderRadius={50}
              sx={{
                backgroundColor: "#FF5252",
              }}
            />
            <Typography
              variant="caption"
              color="text.dark"
              fontSize={14}
              fontWeight={500}
            >
              Absent: {data[1].value} Days
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default GraphCard;
