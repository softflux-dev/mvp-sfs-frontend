import { useState } from "react";
import { Box } from "@mui/material";
import WeeklyMiniStats from "./weeklyMiniStats";
import WeeklyBreakdown from "./weeklyBreakdown";
import DailyHoursChart from "./dailyHoursChart";


const mockWeeks = [
  {
    label: "Mar 2 – Mar 8, 2026",
    stats: { present: 1, absent: 3, late: 1, leave: 1, worked: "21.4h" },
    breakdown: [
      { id: "d1", day: "Monday",    date: "2026-03-02", checkIn: "08:19 AM", checkOut: "05:34 PM", hours: "9.4h", status: "Present" },
      { id: "d2", day: "Tuesday",   date: "2026-03-03", checkIn: "08:41 AM", checkOut: "05:34 PM", hours: "9.4h", status: "Present" },
      { id: "d3", day: "Wednesday", date: "2026-03-04", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Absent"  },
      { id: "d4", day: "Thursday",  date: "2026-03-05", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Leave"   },
      { id: "d5", day: "Friday",    date: "2026-03-06", checkIn: "08:35 AM", checkOut: "05:34 PM", hours: "9.4h", status: "Present" },
      { id: "d6", day: "Saturday",  date: "2026-03-07", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Weekend" },
      { id: "d7", day: "Sunday",    date: "2026-03-08", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Weekend" },
    ],
  },
  {
    label: "Mar 9 – Mar 15, 2026",
    stats: { present: 4, absent: 0, late: 1, leave: 0, worked: "37.6h" },
    breakdown: [
      { id: "d8",  day: "Monday",    date: "2026-03-09", checkIn: "09:00 AM", checkOut: "05:34 PM", hours: "8.5h", status: "Present" },
      { id: "d9",  day: "Tuesday",   date: "2026-03-10", checkIn: "09:15 AM", checkOut: "05:34 PM", hours: "8.3h", status: "Late"    },
      { id: "d10", day: "Wednesday", date: "2026-03-11", checkIn: "08:50 AM", checkOut: "05:34 PM", hours: "8.7h", status: "Present" },
      { id: "d11", day: "Thursday",  date: "2026-03-12", checkIn: "08:30 AM", checkOut: "05:34 PM", hours: "9.0h", status: "Present" },
      { id: "d12", day: "Friday",    date: "2026-03-13", checkIn: "08:45 AM", checkOut: "05:34 PM", hours: "8.8h", status: "Present" },
      { id: "d13", day: "Saturday",  date: "2026-03-14", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Weekend" },
      { id: "d14", day: "Sunday",    date: "2026-03-15", checkIn: "–",        checkOut: "–",        hours: "–",    status: "Weekend" },
    ],
  },
];

const WeeklyAttendanceView = () => {
  const [weekIdx, setWeekIdx] = useState(0);
  const week = mockWeeks[weekIdx];

  return (
    <Box>
      <WeeklyMiniStats
        week={week}
        weekIdx={weekIdx}
        totalWeeks={mockWeeks.length}
        onPrev={() => setWeekIdx((i) => i - 1)}
        onNext={() => setWeekIdx((i) => i + 1)}
      />
      <WeeklyBreakdown breakdown={week.breakdown} />
      <DailyHoursChart breakdown={week.breakdown} />
     
    </Box>
  );
};

export default WeeklyAttendanceView;