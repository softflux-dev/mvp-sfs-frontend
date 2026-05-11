import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

const AttendanceTimer = () => {
  const [now, setNow] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "25px",
        p: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        height: "472px",
      }}
    >
      <Box width="100%">
        <Typography fontSize="16px" fontWeight={700} color="text.primary">
          Attendance
        </Typography>
      </Box>

      {/* Live clock */}
      <Box textAlign="center" py={2} mt={9}>
        <Typography fontSize="13px" color="text.secondary" mb={1}>
          {formatDate(now)}
        </Typography>
        <Typography
          sx={{
            fontSize: "42px",
            fontWeight: 700,
            color: "text.primary",
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "2px",
          }}
        >
          {formatTime(now)}
        </Typography>
      </Box>

      {/* Check In / Check Out — using custom theme variants */}
      <Box display="flex" gap={2} width="100%" mt={10}>
        <Button
          variant="checkIn"
          fullWidth
          onClick={() => setCheckedIn(true)}
          disabled={checkedIn}
        >
          Check In
        </Button>
        <Button
          variant="checkOut"
          fullWidth
          onClick={() => setCheckedIn(false)}
          disabled={!checkedIn}
        >
          Check Out
        </Button>
      </Box>
    </Box>
  );
};

export default AttendanceTimer;