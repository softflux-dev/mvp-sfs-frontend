import React from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import testIcon from "../../assets/icons/test.svg";

const DeadlinesCard = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      p={2}
      borderRadius={4}
      bgcolor={"background.cardLight"}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            background:
              "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
            borderRadius: "12px",
            width: 48,
            height: 48,
          }}
        >
          {data?.icon || testIcon}
        </Avatar>

        <Box>
          <Typography fontWeight={700} fontSize="0.95rem" paddingRight={2}>
            {/* {data?.title} */}
            {isMobile
              ? data.title?.length > 10
                ? data.title.slice(0, 10) + "..."
                : data.title
              : data.title}
          </Typography>
          <Typography variant="caption" color="text.light" paddingRight={2}>
            {data?.subject}
          </Typography>
        </Box>
      </Stack>

      <Box textAlign="right">
        <Chip
          label={data?.timeLeft}
          sx={{
            bgcolor: data?.urgent ? "#FF5252" : "#e0e0e0",
            color: data?.urgent ? "#fff" : "#000",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 20,
            mb: 0.3, // space between chip & date
          }}
        />

        <Typography variant="caption" color="text.light" display={"block"}>
          {data?.date}
        </Typography>
      </Box>
    </Box>
  );
};

export default DeadlinesCard;
