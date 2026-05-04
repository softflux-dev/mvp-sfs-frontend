import React from "react";
import { Box, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CourseIcon from "../../assets/icons/assignments-active.svg";

const ClassScheduleCard = ({
  courseName,
  day,
  time,
  location,
  batch,
  isLab = false,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        "&:hover": {
          border: "1px solid #E0E0E0",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: "primary.lightGray",
          borderRadius: "10px",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img
          src={CourseIcon}
          alt={courseName}
          style={{ width: 20, height: 20 }}
        />
      </Box>

      {/* Course Details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "text.primary",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {courseName}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            color: "text.secondary",
          }}
        >
          {day} • {time}
        </Typography>
      </Box>

      {/* Right Side - Location and Batch */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <LocationOnOutlinedIcon
            sx={{ fontSize: 16, color: "text.secondary" }}
          />
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: "text.secondary",
            }}
          >
            {location}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <GroupsOutlinedIcon
            sx={{ fontSize: 16, color: "text.secondary" }}
          />
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 400,
              color: "text.secondary",
            }}
          >
            {batch}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleCard;
