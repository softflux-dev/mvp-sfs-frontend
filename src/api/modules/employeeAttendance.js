// src/api/modules/employeeAttendance.js
import ENDPOINTS from "../endpoints";
import api       from "../index";

// All scoped to the logged-in employee server-side (req.user._id) — no employeeId param needed

export const getDefaultMonthApi = () =>
  api(ENDPOINTS.empAttendanceDefaultMonth, null, "get");

export const getMonthStatsApi = (month, year) =>
  api(`${ENDPOINTS.empAttendanceStats}?month=${month}&year=${year}`, null, "get");

export const getMonthlyCalendarApi = (month, year) =>
  api(`${ENDPOINTS.empAttendanceMonthly}?month=${month}&year=${year}`, null, "get");

export const getWeekBreakdownApi = (startDate, endDate) =>
  api(`${ENDPOINTS.empAttendanceWeek}?startDate=${startDate}&endDate=${endDate}`, null, "get");

export const getAnnualSummaryApi = (year) =>
  api(`${ENDPOINTS.empAttendanceAnnual}?year=${year}`, null, "get");