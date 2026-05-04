// employees/employeeDetail.jsx
import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import CustomTabs           from "../../../components/tabs";
import AddEmployee          from "./addEmployee";
import EmployeeDetailHeader from "./employeeDetailHeader";
import PersonalInfoTab      from "./employeeDetailTabs/personalInfoTab";
import SalaryTab            from "./employeeDetailTabs/salaryTab";
import AttendanceTab        from "./employeeDetailTabs/attendanceTab";
import TasksTab             from "./employeeDetailTabs/tasksTab";
import DocumentsTab         from "./employeeDetailTabs/documentsTab";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

const tabs = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Salary"        },
  { id: 3, label: "Attendance"    },
  { id: 4, label: "Tasks"         },
  { id: 5, label: "Documents"     },
];

const EmployeeDetail = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const employee  = location.state?.employee || {};

  const [activeTab, setActiveTab] = useState(1);
  const [editOpen,  setEditOpen]  = useState(false);

  return (
    <>
      {/* ── Back button ──────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography
          fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          Back to Employees
        </Typography>
      </Box>

      {/* ── Header card ───────────────────────────────────────────────────── */}
      <EmployeeDetailHeader
        employee={employee}
        onEditClick={() => setEditOpen(true)}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === 1 && <PersonalInfoTab employee={employee} />}
      {activeTab === 2 && <SalaryTab employee={employee} />}
      {activeTab === 3 && <AttendanceTab employee={employee} />}
      {activeTab === 4 && <TasksTab employee={employee} />}
      {activeTab === 5 && <DocumentsTab employee={employee} />}

      {/* ── Edit Employee dialog ──────────────────────────────────────────── */}
      <AddEmployee
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => { console.log("Updated:", data); setEditOpen(false); }}
        editingEmployee={employee}
      />
    </>
  );
};

export default EmployeeDetail;