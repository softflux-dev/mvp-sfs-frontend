// Reports.jsx
import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText  from "../../../components/headerText";
import CustomButton from "../../../components/customButton";
import CustomTabs  from "../../../components/tabs";
import ExportIcon  from "../../../assets/icons/download-icon-white.svg";

import EmployeeProductivityTab from "./tabs/employeeProductivityTab";
import TaskCompletionTab from "./tabs/taskCompletionTab";
import ProjectPerformanceTab from "./tabs/projectPerformanceTab";
import AttendanceReportTab from "./tabs/attendanceReportTab";
import LeaveReportTab from "./tabs/leaveReportTab";
import PayrollReportTab from "./tabs/payrollReportTab";

const tabs = [
  { id: 1, label: "Employee Productivity" },
  { id: 2, label: "Task Completion"       },
  { id: 3, label: "Project Performance"   },
  { id: 4, label: "Attendance"            },
  { id: 5, label: "Leave"                 },
  { id: 6, label: "Payroll"               },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Reports & Analytics"
            subtitle="Comprehensive reports across all modules"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
            
              btnLabel="Export Report"
              handlePressBtn={() => console.log("Export")}
              variant="gradient"
              startIcon={
                          <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
                        }
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <Box mt={2}>
        {activeTab === 1 && <EmployeeProductivityTab />}
        {activeTab === 2 && <TaskCompletionTab />}
        {activeTab === 3 && <ProjectPerformanceTab />}
        {activeTab === 4 && <AttendanceReportTab />}
        {activeTab === 5 && <LeaveReportTab />}
        {activeTab === 6 && <PayrollReportTab />}
      </Box>
    </>
  );
};

export default Reports;