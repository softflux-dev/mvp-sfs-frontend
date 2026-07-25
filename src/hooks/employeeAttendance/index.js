// src/hooks/employeeAttendance.js 
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getDefaultMonthApi,
  getMonthStatsApi,
  getMonthlyCalendarApi,
  getWeekBreakdownApi,
  getAnnualSummaryApi,
} from "../../api/modules/employeeAttendance";

// Format a local Date as "YYYY-MM-DD" without going through toISOString(),
// which converts to UTC and shifts the day backwards for any timezone behind
// UTC — that produced a start date one day early and mismatched the backend.
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ── Helper: generate all Mon–Sun weeks overlapping a given month ────────────
const getWeeksForMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  const startMonday = new Date(firstDay);
  const dayOfWeek    = (firstDay.getDay() + 6) % 7; // 0=Mon
  startMonday.setDate(firstDay.getDate() - dayOfWeek);

  const weeks = [];
  let cursor = new Date(startMonday);

  while (cursor <= lastDay) {
    const weekStart = new Date(cursor);
    const weekEnd   = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      startDate: ymd(weekStart),
      endDate:   ymd(weekEnd),
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
};

const EMPTY_MONTH_STATS = {
  present: 0, absent: 0, late: 0, leave: 0, offDayWorked: 0, percent: "0%",
};

const EMPTY_WEEK_STATS = {
  present: 0, absent: 0, late: 0, leave: 0, offDayWorked: 0, worked: "0h 0m",
};

// ── useDefaultPeriod — resolves which month/year to auto-select on load ─────
export const useDefaultPeriod = () => {
  const [period,  setPeriod]  = useState(null); // { month, year } or null while loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDefaultMonthApi();
        if (res?.status === 200 || res?.status === 201) {
          setPeriod(res.data.data);
        } else {
          const now = new Date();
          setPeriod({ month: now.getMonth(), year: now.getFullYear() });
        }
      } catch {
        const now = new Date();
        setPeriod({ month: now.getMonth(), year: now.getFullYear() });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { period, loading };
};

// ── useMonthStats — stat-card numbers for one month ──────────────────────────
export const useMonthStats = (month, year) => {
  const [stats,   setStats]   = useState(EMPTY_MONTH_STATS);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (month === undefined || month === null || !year) return;
    setLoading(true);
    try {
      const res = await getMonthStatsApi(month, year);
      if (res?.status === 200 || res?.status === 201) {
        setStats({ ...EMPTY_MONTH_STATS, ...res.data.data });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};

// ── useMonthlyCalendar — day→status map for the calendar grid ───────────────
// `offDays` is the list of day-numbers that are NOT configured working days,
// so the grid can grey them from the real setting instead of assuming Sat/Sun.
export const useMonthlyCalendar = (month, year) => {
  const [dayMap,  setDayMap]  = useState({});
  const [offDays, setOffDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = useCallback(async () => {
    if (month === undefined || month === null || !year) return;
    setLoading(true);
    try {
      const res = await getMonthlyCalendarApi(month, year);
      if (res?.status === 200 || res?.status === 201) {
        setDayMap(res.data.data.dayMap  || {});
        setOffDays(res.data.data.offDays || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  return { dayMap, offDays, loading };
};

// ── useWeeklyAttendance — generates weeks for the month + fetches active week ─
export const useWeeklyAttendance = (month, year) => {
  const weeks = useMemo(
    () => (month === undefined || month === null || !year ? [] : getWeeksForMonth(year, month)),
    [month, year]
  );

  // Default to the last (most recent) week of the month
  const [weekIdx, setWeekIdx] = useState(0);
  useEffect(() => {
    setWeekIdx(Math.max(0, weeks.length - 1));
  }, [weeks.length, month, year]);

  const activeWeek = weeks[weekIdx] || null;

  const [breakdown, setBreakdown] = useState([]);
  const [weekStats, setWeekStats] = useState(EMPTY_WEEK_STATS);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!activeWeek) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getWeekBreakdownApi(activeWeek.startDate, activeWeek.endDate);
        if (res?.status === 200 || res?.status === 201) {
          setBreakdown(res.data.data.breakdown || []);
          setWeekStats({ ...EMPTY_WEEK_STATS, ...(res.data.data.stats || {}) });
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [activeWeek?.startDate, activeWeek?.endDate]);

  return {
    weeks, weekIdx, activeWeek, breakdown, weekStats, loading,
    goPrev: () => setWeekIdx((i) => Math.max(0, i - 1)),
    goNext: () => setWeekIdx((i) => Math.min(weeks.length - 1, i + 1)),
  };
};

// ── useAnnualAttendance — months with data + totals for one year ────────────
export const useAnnualAttendance = (year) => {
  const [months,  setMonths]  = useState([]);
  const [totals,  setTotals]  = useState({ present: 0, absent: 0, late: 0, leave: 0 });
  const [loading, setLoading] = useState(false);

  const fetchAnnual = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    try {
      const res = await getAnnualSummaryApi(year);
      if (res?.status === 200 || res?.status === 201) {
        setMonths(res.data.data.months || []);
        setTotals(res.data.data.totals || { present: 0, absent: 0, late: 0, leave: 0 });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [year]);

  useEffect(() => { fetchAnnual(); }, [fetchAnnual]);

  return { months, totals, loading };
};