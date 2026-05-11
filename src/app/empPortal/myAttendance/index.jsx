import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";

import HeaderText  from "../../../components/headerText";
import StatsCard   from "../../../components/cards/statsCard";
import CustomButton from "../../../components/customButton";
import WeeklyAttendanceView from "./weeklyAttendanceView";
import MonthlyAttendanceView from "./monthlyAttendanceView";
import AnnualAttendanceView from "./annualAttendanceView";
import CustomTabs from "../../../components/tabs";
import ApplyLeaveDialog from "./applyLeaveDialog";


import presentIcon  from "../../../assets/icons/attendance-icon.svg";
import absentIcon   from "../../../assets/icons/overdue-time.svg";
import lateIcon     from "../../../assets/icons/overdue-time.svg";
import leaveIcon    from "../../../assets/icons/tasks.svg";
import percentIcon  from "../../../assets/icons/attendance-icon.svg";
import calendarIcon from "../../../assets/icons/tasks.svg";
import WeeklyIcon   from "../../../assets/icons/kanban-active.svg";
import MonthlyIcon  from "../../../assets/icons/tasks-inactive.svg";
import AnnualIcon   from "../../../assets/icons/report-inactive.svg";

// ── Stats ─────────────────────────────────────────────────────────────────
const summaryStats = [
  { id: 1, title: "Present Days",  value: 12,    icon: presentIcon  },
  { id: 2, title: "Absent Days",   value: 3,     icon: absentIcon   },
  { id: 3, title: "Late Days",     value: 2,     icon: lateIcon     },
  { id: 4, title: "Leave Days",    value: 0,     icon: leaveIcon    },
  { id: 5, title: "Attendance %",  value: "80%", icon: percentIcon  },
];

// ── Component ─────────────────────────────────────────────────────────────
const EmpAttendance = () => {
  const [view, setView] = useState("weekly");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);


  return (
    <>
     {/* ── Header ───────────────────────────────────────────────────────── */}
        <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
            <HeaderText
            title="My Attendance"
            subtitle="Track your attendance, check-ins, and work hours"
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton
                btnLabel="Weekly"
                variant={view === "weekly" ? "gradient" : "button"}
                handlePressBtn={() => setView("weekly")}
                startIcon={
                <img src={WeeklyIcon} alt="weekly" style={{
                    width: 16, height: 16,
                    filter: view === "weekly" ? "brightness(0) invert(1)" : "none",
                }} />
                }
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
                btnLabel="Monthly"
                variant={view === "monthly" ? "gradient" : "button"}
                handlePressBtn={() => setView("monthly")}
                startIcon={
                <img src={MonthlyIcon} alt="monthly" style={{
                    width: 16, height: 16,
                    filter: view === "monthly" ? "brightness(0) invert(1)" : "none",
                }} />
                }
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
                btnLabel="Annual"
                variant={view === "annual" ? "gradient" : "button"}
                handlePressBtn={() => setView("annual")}
                startIcon={
                <img src={AnnualIcon} alt="annual" style={{
                    width: 16, height: 16,
                    filter: view === "annual" ? "brightness(0) invert(1)" : "none",
                }} />
                }
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
            />
            <CustomButton
                btnLabel="Leaves Request"
                variant="gradient"
                handlePressBtn={() => setLeaveDialogOpen(true)}
                startIcon={
                <img src={calendarIcon} alt="" style={{
                    width: 16, height: 16,
                    filter: "brightness(0) invert(1)",
                }} />
                }
                sx={{ minWidth: "150px", height: "40px", fontSize: "14px" }}
            />
            </Box>
        </Grid>
        </Grid>

      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {summaryStats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={stat.id}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          </Grid>
        ))}
      </Grid>

     

      {/* ── View content ─────────────────────────────────────────────────── */}
      <Box bgcolor="#fff" borderRadius="25px" p={2}>
        {view === "weekly"  && <WeeklyAttendanceView />}
       {view === "monthly" && <MonthlyAttendanceView />}
       {view === "annual" && <AnnualAttendanceView />}

      </Box>
      <ApplyLeaveDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onSubmit={(data) => console.log("Leave submitted:", data)}
        />
    </>
  );
};

export default EmpAttendance;