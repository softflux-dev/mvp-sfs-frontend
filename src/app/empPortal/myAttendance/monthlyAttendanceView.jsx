import { Box } from "@mui/material";
import MonthlyCalendarView from "./monthlyCalendarView";
import MyLeaveRequests     from "./myLeaveRequests";

const MonthlyAttendanceView = () => (
  <Box>
    <MonthlyCalendarView />
    <MyLeaveRequests />
  </Box>
);

export default MonthlyAttendanceView;