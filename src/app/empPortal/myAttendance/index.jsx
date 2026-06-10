// src/app/empPortal/myAttendance/index.jsx — FULL REPLACEMENT
import { useState }             from "react";
import { Box, Grid }            from "@mui/material";

import HeaderText            from "../../../components/headerText";
import CustomButton          from "../../../components/customButton";
import CustomTabs            from "../../../components/tabs";
import StatsCard             from "../../../components/cards/statsCard";
import WeeklyAttendanceView  from "./weeklyAttendanceView";
import MonthlyAttendanceView from "./monthlyAttendanceView";
import AnnualAttendanceView  from "./annualAttendanceView";
import MyLeaveRequests       from "./myLeaveRequests";
import ApplyLeaveDialog      from "./applyLeaveDialog";
import { useMyLeaves }       from "../../../hooks/leave";

import presentIcon  from "../../../assets/icons/attendance-icon.svg";
import absentIcon   from "../../../assets/icons/overdue-time.svg";
import lateIcon     from "../../../assets/icons/overdue-time.svg";
import leaveIcon    from "../../../assets/icons/tasks.svg";
import percentIcon  from "../../../assets/icons/attendance-icon.svg";
import WeeklyIcon   from "../../../assets/icons/kanban-active.svg";
import MonthlyIcon  from "../../../assets/icons/tasks-inactive.svg";
import AnnualIcon   from "../../../assets/icons/report-inactive.svg";
import calendarIcon from "../../../assets/icons/tasks.svg";

const summaryStats = [
  { id: 1, title: "Present Days", value: 12,    icon: presentIcon },
  { id: 2, title: "Absent Days",  value: 3,     icon: absentIcon  },
  { id: 3, title: "Late Days",    value: 2,     icon: lateIcon    },
  { id: 4, title: "Leave Days",   value: 0,     icon: leaveIcon   },
  { id: 5, title: "Attendance %", value: "80%", icon: percentIcon },
];

const MAIN_TABS = [
  { id: 1, label: "Attendance" },
  { id: 2, label: "My Leaves"  },
];

const EmpAttendance = () => {
  const [mainTab,         setMainTab]         = useState(1);
  const [attendanceView,  setAttendanceView]  = useState("weekly");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // ── Single hook instance — shared between dialog and table ────────────────
  const { leaves, loading, actionLoading, createLeave, cancelLeave } = useMyLeaves();

  const handleLeaveSubmit = async (payload) => {
    const result = await createLeave(payload);
    return result;
  };

  return (
    <>
      <Box mb={3}>
        <HeaderText
          title="My Attendance"
          subtitle="Track your attendance, check-ins, and work hours"
        />
      </Box>

      <CustomTabs tabs={MAIN_TABS} activeTab={mainTab} onTabChange={setMainTab} />

      {/* ── Attendance tab ─────────────────────────────────────────────── */}
      {mainTab === 1 && (
        <>
          <Grid container spacing={2} my={3}>
            {summaryStats.map((stat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={stat.id}>
                <StatsCard title={stat.title} value={stat.value} icon={stat.icon} />
              </Grid>
            ))}
          </Grid>

          <Box bgcolor="#fff" borderRadius="25px" p={2}>
            <Box display="flex" justifyContent="flex-end" gap={1.5} mb={2}>
              <CustomButton
                btnLabel="Weekly"
                variant={attendanceView === "weekly" ? "gradient" : "button"}
                handlePressBtn={() => setAttendanceView("weekly")}
                startIcon={<img src={WeeklyIcon}  alt="" style={{ width: 16, height: 16, filter: attendanceView === "weekly"  ? "brightness(0) invert(1)" : "none" }} />}
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
              />
              <CustomButton
                btnLabel="Monthly"
                variant={attendanceView === "monthly" ? "gradient" : "button"}
                handlePressBtn={() => setAttendanceView("monthly")}
                startIcon={<img src={MonthlyIcon} alt="" style={{ width: 16, height: 16, filter: attendanceView === "monthly" ? "brightness(0) invert(1)" : "none" }} />}
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
              />
              <CustomButton
                btnLabel="Annual"
                variant={attendanceView === "annual" ? "gradient" : "button"}
                handlePressBtn={() => setAttendanceView("annual")}
                startIcon={<img src={AnnualIcon}  alt="" style={{ width: 16, height: 16, filter: attendanceView === "annual"  ? "brightness(0) invert(1)" : "none" }} />}
                sx={{ minWidth: "100px", height: "40px", fontSize: "14px" }}
              />
            </Box>

            {attendanceView === "weekly"  && <WeeklyAttendanceView  />}
            {attendanceView === "monthly" && <MonthlyAttendanceView />}
            {attendanceView === "annual"  && <AnnualAttendanceView  />}
          </Box>
        </>
      )}

      {/* ── My Leaves tab ──────────────────────────────────────────────── */}
      {mainTab === 2 && (
        <Box mt={2}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <CustomButton
              btnLabel="Request Leave"
              variant="gradient"
              handlePressBtn={() => setLeaveDialogOpen(true)}
              startIcon={<img src={calendarIcon} alt="" style={{ width: 16, height: 16, filter: "brightness(0) invert(1)" }} />}
              sx={{ minWidth: "150px", height: "40px", fontSize: "14px" }}
            />
          </Box>
          <MyLeaveRequests
            leaves={leaves}
            loading={loading}
            cancelLeave={cancelLeave}
            actionLoading={actionLoading}
          />
        </Box>
      )}

      <ApplyLeaveDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onSubmit={handleLeaveSubmit}
        loading={actionLoading}
      />
    </>
  );
};

export default EmpAttendance;