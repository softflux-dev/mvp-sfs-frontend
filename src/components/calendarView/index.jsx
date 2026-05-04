import React, { useState } from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const CalendarView = ({ 
  data = [], 
  renderDayContent, 
  getDataForDate,
  highlightToday = true 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return { startingDayOfWeek, daysInMonth, year, month };
  };

  const { startingDayOfWeek, daysInMonth, year, month } = getMonthData();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const generateCalendarWeeks = () => {
    const weeks = [];
    let currentDay = 1;
    let weekIndex = 0;

    while (currentDay <= daysInMonth) {
      const week = [];
      
      for (let i = 0; i < 7; i++) {
        if (weekIndex === 0 && i < startingDayOfWeek) {
          week.push(null);
        } else if (currentDay <= daysInMonth) {
          week.push(currentDay);
          currentDay++;
        } else {
          week.push(null);
        }
      }
      
      weeks.push(week);
      weekIndex++;
    }

    return weeks;
  };

  const weeks = generateCalendarWeeks();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: { xs: "12px", md: "25px" },
        p: { xs: 1.5, md: 3 },
        width: "100%",
        overflow: "auto",
      }}
    >
      {/* Calendar Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 1.5, md: 2 },
          pb: { xs: 1.5, md: 2 },
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        <IconButton 
          onClick={handlePrevMonth} 
          size="small"
          sx={{
            padding: { xs: "4px", md: "8px" },
            "&:hover": { backgroundColor: "#F5F5F5" },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: "18px", md: "24px" } }} />
        </IconButton>
        <Typography
          sx={{
            fontSize: { xs: "14px", md: "16px" },
            fontWeight: 600,
            color: "#000",
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {monthName}
        </Typography>
        <IconButton 
          onClick={handleNextMonth} 
          size="small"
          sx={{
            padding: { xs: "4px", md: "8px" },
            "&:hover": { backgroundColor: "#F5F5F5" },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: { xs: "18px", md: "24px" } }} />
        </IconButton>
      </Box>

      {/* Days of Week Header */}
      <Grid container sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
            }}>
        {daysOfWeek.map((day) => (
          <Grid item size={{xs:8.5, sm:13.5, md: 15.5 }} key={day}>
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 0.8, md: 1.5 },
                backgroundColor: "#F5F5F5",
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "9px", md: "11px" },
                  fontWeight: 600,
                  color: "#67768B",
                  letterSpacing: "0.5px",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Weeks */}
      {weeks.map((week, weekIndex) => (
        <Grid container key={weekIndex}
            sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            }}
        >
          {week.map((day, dayIndex) => {
            if (day === null) {
              return (
                <Grid item size={{ xs:8.5, sm:13.5, md: 15.5 }} key={`empty-${weekIndex}-${dayIndex}`}>
                  <Box
                    sx={{
                      minHeight: { xs: "60px", md: "120px" },
                      border: "1px solid #E0E0E0",
                      borderTop: "none",
                      backgroundColor: "#FAFAFA",
                    }}
                  />
                </Grid>
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = getDataForDate ? getDataForDate(dateStr, data) : [];
            const today = highlightToday && isToday(day);

            return (
              <Grid item size={{ xs:8.5, sm:13.5, md: 15.5 }} key={day}>
                <Box
                  sx={{
                    minHeight: { xs: "60px", md: "120px" },
                    border: "1px solid #E0E0E0",
                    borderTop: "none",
                    p: { xs: 0.5, md: 1.5 },
                    backgroundColor: today ? "#F973161A" : "#fff",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      backgroundColor: today ? "#F973161A" : "#FAFAFA",
                    },
                  }}
                >
                  {/* Date number */}
                  <Typography
                    sx={{
                      fontSize: { xs: "10px", md: "13px" },
                      fontWeight: today ? 600 : 500,
                      color: today ? "#F97316" : "#000",
                      mb: { xs: 0.3, md: 1 },
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {day}
                  </Typography>

                  {/* Custom content for each day */}
                  {renderDayContent && renderDayContent(day, dateStr, dayData, today)}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

export default CalendarView;