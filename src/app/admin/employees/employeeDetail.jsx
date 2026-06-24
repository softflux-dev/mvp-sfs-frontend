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
import { useEmployee } from "../../../hooks/employee";


const tabs = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Salary"        },
  //{ id: 3, label: "Attendance"    },
  { id: 3, label: "Tasks"         },
  { id: 4, label: "Documents"     },
];

const EmployeeDetail = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [employee, setEmployee] = useState(location.state?.employee || {});


  const [activeTab, setActiveTab] = useState(1);
  const [editOpen,  setEditOpen]  = useState(false);
  const { updateEmployee, actionLoading } = useEmployee();
  const [apiError, setApiError] = useState("");

  const handleSave = async (formData) => {
  const result = await updateEmployee(employee.id, formData);
  if (result.success) {
    // Merge updated fields back into local employee state so the header,
    // tabs, and all child components reflect the change immediately.
   setEmployee((prev) => ({
      ...prev,
      name:           formData.fullName        || prev.name,
      phone:          formData.phone           || prev.phone,
      // DON'T overwrite role/department with raw IDs from the form —
      // those are ObjectIds used by the edit dialog, not display labels.
      // The header shows prev.role (roleName string) and prev.department
      // (department name string) which are already correct.
      departmentId:   formData.department      || prev.departmentId,
      roleId:         formData.role            || prev.roleId,
      employmentType: formData.employmentType  || prev.employmentType,
      workingHours:   formData.workingHours    ?? prev.workingHours,
      monthlySalary:  formData.monthlySalary   ?? prev.monthlySalary,
      machineId:      formData.machineId       || prev.machineId,
      avatar: formData.avatarFile
        ? result.data?.employee?.avatar || prev.avatar
        : prev.avatar,
    }));
    setEditOpen(false);
    setApiError("");
  } else {
    setApiError(result.message);
  }
};

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
      {activeTab === 3 && <TasksTab employee={employee} />}
      {activeTab === 4 && <DocumentsTab employee={employee} />}

      {/* ── Edit Employee dialog ──────────────────────────────────────────── */}
      <AddEmployee
      open={editOpen}
      onClose={() => { setEditOpen(false); setApiError(""); }}
      onSave={handleSave}
      editingEmployee={employee}
      loading={actionLoading}
      apiError={apiError}
    />
    </>
  );
};

export default EmployeeDetail;