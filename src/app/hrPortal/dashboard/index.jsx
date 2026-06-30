// app/hrPortal/dashboard/index.jsx — 
import { useState, useEffect } from "react";
import { Grid, Box, Skeleton } from "@mui/material";
import { useNavigate }         from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import StatsCard          from "../../../components/cards/statsCard";
import AttendanceOverview from "./attendanceOverview";
import RecentLeaveRequests from "./recentLeaveRequests";
import UpcomingPayroll    from "./upcomingPayroll";

import {
  getHRDashboardStatsApi,
  getRecentLeavesApi,
  getPreviousPayrollApi,
} from "../../../api/modules/hrDashboard";

import employeesIcon from "../../../assets/icons/employees.svg";
import presentIcon   from "../../../assets/icons/complete-icon.svg";
import leaveIcon     from "../../../assets/icons/attendance-icon.svg";
import pendingIcon   from "../../../assets/icons/time-icon.svg";

const HRDashboard = () => {
  const navigate = useNavigate();

  const [stats,       setStats]       = useState(null);
  const [leaves,      setLeaves]      = useState([]);
  const [payroll,     setPayroll]     = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getHRDashboardStatsApi(),
      getRecentLeavesApi(10),
      getPreviousPayrollApi(),
    ]).then(([statsRes, leavesRes, payrollRes]) => {
      if (statsRes?.status === 200 || statsRes?.status === 201) {
        setStats(statsRes.data.data);
      }
      if (leavesRes?.status === 200 || leavesRes?.status === 201) {
        setLeaves(leavesRes.data.data.leaves || []);
      }
      if (payrollRes?.status === 200 || payrollRes?.status === 201) {
        setPayroll(payrollRes.data.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const statsData = [
    {
      id: 1, title: "Total Employees",
      value: String(stats?.totalEmployees ?? "0"),
      description: "Active employees",
      icon: employeesIcon,
      
    },
    {
      id: 2, title: "Present This Month",
      value: stats ? `${stats.presentCount} (${stats.presentPct}%)` : "0",
      description: "Employees present",
      icon: presentIcon,
    },
    {
      id: 3, title: "On Leave Today",
      value: String(stats?.onLeaveToday ?? "0"),
      description: "Approved leaves",
      icon: leaveIcon,
    },
    {
      id: 4, title: "Pending Requests",
      value: String(stats?.pendingLeaves ?? "0"),
      description: "Awaiting review",
      icon: pendingIcon,
      onClick: () => navigate("/leave-management"),
    },
  ];

  return (
    <>
      <HeaderText title="HR Dashboard" subtitle="Employee and HR operations overview" />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            {loading ? (
              <Box sx={{ backgroundColor: "#fff", borderRadius: "30px", p: 2, height: "130px" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Skeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="55%" height={16} />
              </Box>
            ) : (
              <StatsCard
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                onClick={stat.onClick}
              />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Main content row */}
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="flex-start">

        {/* LEFT: Attendance Overview + Previous Payroll stacked */}
        <Grid item size={{ xs: 12, md: 5 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <AttendanceOverview />
            <UpcomingPayroll
              payroll={payroll}
              loading={loading}
              onGoToPayroll={() => navigate("/payroll-management")}
            />
          </Box>
        </Grid>

        {/* RIGHT: Recent Leave Requests */}
        <Grid item size={{ xs: 12, md: 7 }}>
          <RecentLeaveRequests
            leaves={leaves}
            loading={loading}
            onRefresh={() =>
              getRecentLeavesApi(10).then((res) => {
                if (res?.status === 200 || res?.status === 201) {
                  setLeaves(res.data.data.leaves || []);
                }
              })
            }
          />
        </Grid>
      </Grid>
    </>
  );
};

export default HRDashboard;