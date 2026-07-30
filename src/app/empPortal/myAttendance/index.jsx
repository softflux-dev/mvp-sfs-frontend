// src/app/empPortal/myAttendance/index.jsx — Phase 1 (Leave Management Enhancement)
// Added: useMyLeaveBalance shared instance, passed to MyLeaveRequests (popup)
// and ApplyLeaveDialog (toggle/inline). Balance refetches after a submit.

import { useState, useEffect } from "react";
import { Box, Grid, IconButton, Typography, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

import HeaderText            from "../../../components/headerText";
import CustomButton          from "../../../components/customButton";
import CustomTabs            from "../../../components/tabs";
import StatsCard             from "../../../components/cards/statsCard";
import WeeklyAttendanceView  from "./weeklyAttendanceView";
import MonthlyAttendanceView from "./monthlyAttendanceView";
import AnnualAttendanceView  from "./annualAttendanceView";
import MyLeaveRequests       from "./myLeaveRequests";
import ApplyLeaveDialog      from "./applyLeaveDialog";
import { useMyLeaves, useMyLeaveBalance } from "../../../hooks/leave";
import {
  useDefaultPeriod,
  useMonthStats,
  useWeeklyAttendance,
  useAnnualAttendance,
} from "../../../hooks/employeeAttendance";

import presentIcon  from "../../../assets/icons/attendance-icon.svg";
import absentIcon   from "../../../assets/icons/overdue-time.svg";
import lateIcon     from "../../../assets/icons/overdue-time.svg";
import leaveIcon    from "../../../assets/icons/tasks.svg";
import percentIcon  from "../../../assets/icons/attendance-icon.svg";
import WeeklyIcon   from "../../../assets/icons/kanban-active.svg";
import MonthlyIcon  from "../../../assets/icons/tasks-inactive.svg";
import AnnualIcon   from "../../../assets/icons/report-inactive.svg";

const MAIN_TABS = [
  { id: 1, label: "Attendance" },
  { id: 2, label: "My Leaves"  },
];

const EmpAttendance = () => {
  const [mainTab,         setMainTab]         = useState(1);
  const [attendanceView,  setAttendanceView]  = useState("monthly");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const { period, loading: periodLoading } = useDefaultPeriod();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear,  setSelectedYear]  = useState(null);

  useEffect(() => {
    if (period) {
      setSelectedMonth(period.month);
      setSelectedYear(period.year);
    }
  }, [period]);

  const { leaves, loading: leavesLoading, actionLoading, createLeave, cancelLeave } = useMyLeaves();
  const { balance, loading: balanceLoading, fetchBalance } = useMyLeaveBalance();

  const handleLeaveSubmit = async (payload) => {
    const result = await createLeave(payload);
    // Refresh balance so pending days reflect the new request immediately.
    if (result?.success) fetchBalance();
    return result;
  };

  const { stats: monthStats }  = useMonthStats(selectedMonth, selectedYear);
  const weekly                 = useWeeklyAttendance(selectedMonth, selectedYear);
  const { totals: yearTotals } = useAnnualAttendance(selectedYear);

  let displayStats;
  if (attendanceView === "weekly") {
    const ws = weekly.weekStats;
    const totalMarked = ws.present + ws.absent + ws.leave;
    const percent = totalMarked > 0 ? Math.round((ws.present / totalMarked) * 100) : 0;
    displayStats = { present: ws.present, absent: ws.absent, late: ws.late, leave: ws.leave, percent: `${percent}%` };
  } else if (attendanceView === "annual") {
    const totalMarked = yearTotals.present + yearTotals.absent + yearTotals.leave;
    const percent = totalMarked > 0 ? Math.round((yearTotals.present / totalMarked) * 100) : 0;
    displayStats = { present: yearTotals.present, absent: yearTotals.absent, late: yearTotals.late, leave: yearTotals.leave, percent: `${percent}%` };
  } else {
    displayStats = monthStats;
  }

  const summaryStats = [
    { id: 1, title: "Present Days", value: displayStats.present, icon: presentIcon },
    { id: 2, title: "Absent Days",  value: displayStats.absent,  icon: absentIcon  },
    { id: 3, title: "Late Days",    value: displayStats.late,    icon: lateIcon    },
    { id: 4, title: "Leave Days",   value: displayStats.leave,   icon: leaveIcon   },
    { id: 5, title: "Attendance %", value: displayStats.percent, icon: percentIcon },
  ];

  if (periodLoading || selectedMonth === null) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress size={32} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <>
      <Box mb={3}>
        <HeaderText title="My Attendance & Leaves" subtitle="Track your attendance, check-ins, and work hours" />
      </Box>

      <CustomTabs tabs={MAIN_TABS} activeTab={mainTab} onTabChange={setMainTab} />

      {mainTab === 1 && (
        <Box bgcolor="#fff" borderRadius="25px" p={2} mt={2}>
          <Box display="flex" justifyContent="flex-end" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconButton
                size="small"
                onClick={() => {
                  const d = new Date(selectedYear, selectedMonth - 1, 1);
                  setSelectedMonth(d.getMonth());
                  setSelectedYear(d.getFullYear());
                }}
                sx={{ bgcolor: "#F5F5F5", borderRadius: "8px", width: 32, height: 32, "&:hover": { bgcolor: "#E0E0E0" } }}
              >
                <ChevronLeft size={16} />
              </IconButton>
              <Box sx={{ px: 2.5, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px" }}>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">
                  {new Date(selectedYear, selectedMonth, 1).toLocaleString("default", { month: "long" })} {selectedYear}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  const d = new Date(selectedYear, selectedMonth + 1, 1);
                  setSelectedMonth(d.getMonth());
                  setSelectedYear(d.getFullYear());
                }}
                sx={{ background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)", borderRadius: "8px", width: 32, height: 32, "&:hover": { opacity: 0.9 } }}
              >
                <ChevronRight size={16} color="#fff" />
              </IconButton>
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1.5} mb={2.5}>
            {["weekly", "monthly", "annual"].map((view) => (
              <CustomButton
                key={view}
                btnLabel={view.charAt(0).toUpperCase() + view.slice(1)}
                variant={attendanceView === view ? "gradient" : "button"}
                handlePressBtn={() => setAttendanceView(view)}
                startIcon={
                  <img
                    src={view === "weekly" ? WeeklyIcon : view === "monthly" ? MonthlyIcon : AnnualIcon}
                    alt=""
                    style={{ width: 16, height: 16, filter: attendanceView === view ? "brightness(0) invert(1)" : "none" }}
                  />
                }
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
              />
            ))}
          </Box>

          <Grid container spacing={2} mb={2.5}>
            {summaryStats.map((stat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={stat.id}>
                <StatsCard title={stat.title} value={stat.value} icon={stat.icon} />
              </Grid>
            ))}
          </Grid>

          {attendanceView === "weekly" && <WeeklyAttendanceView weekly={weekly} />}
          {attendanceView === "monthly" && (
            <MonthlyAttendanceView selectedMonth={selectedMonth} selectedYear={selectedYear} />
          )}
          {attendanceView === "annual" && (
            <AnnualAttendanceView selectedYear={selectedYear} onYearChange={(y) => setSelectedYear(y)} />
          )}
        </Box>
      )}

      {mainTab === 2 && (
        <Box mt={2}>
          <MyLeaveRequests
            leaves={leaves}
            loading={leavesLoading}
            cancelLeave={cancelLeave}
            actionLoading={actionLoading}
            onRequestLeave={() => setLeaveDialogOpen(true)}
            balance={balance}
            balanceLoading={balanceLoading}
          />
        </Box>
      )}

      <ApplyLeaveDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onSubmit={handleLeaveSubmit}
        loading={actionLoading}
        balance={balance}
        balanceLoading={balanceLoading}
      />
    </>
  );
};

export default EmpAttendance;