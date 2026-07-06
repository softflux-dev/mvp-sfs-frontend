// Reports.jsx — FULL REPLACEMENT
import { useRef, useState } from "react";
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
  const tabRefs = useRef({}); // { 1: ref, 2: ref, ... }

  const handleExport = () => {
    tabRefs.current[activeTab]?.exportData?.();
  };

  return (
    <>
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
              handlePressBtn={handleExport}
              variant="gradient"
              startIcon={<img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />}
            />
          </Box>
        </Grid>
      </Grid>

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <Box mt={2}>
        {activeTab === 1 && <EmployeeProductivityTab ref={(r) => (tabRefs.current[1] = r)} />}
        {activeTab === 2 && <TaskCompletionTab       ref={(r) => (tabRefs.current[2] = r)} />}
        {activeTab === 3 && <ProjectPerformanceTab   ref={(r) => (tabRefs.current[3] = r)} />}
        {activeTab === 4 && <AttendanceReportTab     ref={(r) => (tabRefs.current[4] = r)} />}
        {activeTab === 5 && <LeaveReportTab          ref={(r) => (tabRefs.current[5] = r)} />}
        {activeTab === 6 && <PayrollReportTab        ref={(r) => (tabRefs.current[6] = r)} />}
      </Box>
    </>
  );
};

export default Reports;