import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import ViewPayslipDialog from "./viewPayslipDialog";
import EditPayrollDialog from "./editPayrollDialog";

import ExportIcon from "../../../assets/icons/download-icon-white.svg";
import { MoreVerticalIcon } from "lucide-react";

const mockPayroll = [
  { id: 1, empId: "EMP001", name: "Sarah Johnson", designation: "Software Engineer", avatar: "", department: "Engineering", working: 22, present: 20, leave: 2, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 2, empId: "EMP001", name: "James Chen",    designation: "Product Manager",   avatar: "", department: "Design",       working: 22, present: 22, leave: 0, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 3, empId: "EMP001", name: "Aisha Patel",   designation: "UX Designer",       avatar: "", department: "QA",           working: 22, present: 21, leave: 1, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 4, empId: "EMP001", name: "Sarah Johnson", designation: "Data Analyst",      avatar: "", department: "HR",           working: 22, present: 20, leave: 2, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 5, empId: "EMP001", name: "James Chen",    designation: "QA Engineer",       avatar: "", department: "Engineering", working: 22, present: 19, leave: 3, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 6, empId: "EMP001", name: "James Chen",    designation: "DevOps Engineer",   avatar: "", department: "Design",       working: 22, present: 20, leave: 2, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 7, empId: "EMP001", name: "James Chen",    designation: "Marketing Lead",    avatar: "", department: "QA",           working: 22, present: 22, leave: 0, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
  { id: 8, empId: "EMP001", name: "James Chen",    designation: "Finance Analyst",   avatar: "", department: "HR",           working: 22, present: 22, leave: 0, baseSalary: 7395, bonus: 100, deductions: 94, netPay: 7745 },
];

const tableHeader = [
  { id: "checkbox",    label: ""            },
  { id: "empId",       label: "ID"          },
  { id: "name",        label: "Employee"    },
  { id: "department",  label: "Department"  },
  { id: "working",     label: "Working"     },
  { id: "present",     label: "Present"     },
  { id: "leave",       label: "Leave"       },
  { id: "baseSalary",  label: "Base Salary" },
  { id: "bonus",       label: "Bonus"       },
  { id: "deductions",  label: "Deductions"  },
  { id: "netPay",      label: "Net Pay"     },
  { id: "actions",     label: ""            },
];

const displayRows = [
  "payroll_checkbox",
  "payroll_emp_id",
  "payroll_employee",
  "payroll_department",
  "payroll_working",
  "payroll_present",
  "payroll_leave",
  "payroll_salary",
  "payroll_bonus_col",
  "payroll_deductions_col",
  "payroll_net",
  "actions_menu",
];

const menuOptions = [
  { value: "view_payslip", label: "View Payslip" },
  { value: "download",     label: "Download"     },
  { value: "edit",         label: "Edit"         },
];

const PayrollManagement = () => {
  const [payroll,  setPayroll]  = useState(mockPayroll);
  const [filters,  setFilters]  = useState({});
  const [success,  setSuccess]  = useState({ open: false, message: "" });
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const handleSelectRow = (id) => {
  setSelectedRows((prev) =>
    prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
  );
};

const handleSelectAll = () => {
  setSelectedRows((prev) =>
    prev.length === filteredData.length
      ? []
      : filteredData.map((r) => r.id)
  );
};

  const confirmRef = useRef();

  const handleMenuAction = (action, row) => {
  if (action === "view_payslip") { setSelectedPayroll(row); setViewOpen(true);  }
  if (action === "edit")         { setSelectedPayroll(row); setEditOpen(true);  }
  if (action === "download")     console.log("Download:", row);
};

  const filteredData = payroll.filter((row) => {
    const search = filters.search?.toLowerCase() || "";
    const dept   = filters.department || "";
    const matchSearch = !search || row.name.toLowerCase().includes(search);
    const matchDept   = !dept   || row.department.toLowerCase() === dept;
    return matchSearch && matchDept;
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Payroll Management"
            subtitle="Review and manage all employee Payroll"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Export PDF"
              variant="gradient"
              startIcon={
                <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
              }
              handlePressBtn={() => console.log("Export")}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="payroll_management" onFilterChange={setFilters} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={false}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      </Box>

      <ViewPayslipDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedPayroll(null); }}
        payroll={selectedPayroll || {}}
        />

        <EditPayrollDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedPayroll(null); }}
        payroll={selectedPayroll || {}}
        onSave={(data) => console.log("Saved:", data)}
        />

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={success.open}
        onClose={() => setSuccess({ open: false, message: "" })}
        message={success.message}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default PayrollManagement;