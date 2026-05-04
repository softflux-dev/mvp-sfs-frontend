import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddEmployee        from "./addEmployee";

import { MoreVerticalIcon } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockEmployees = [
  { id: 1,  empId: "EMP001", name: "Ali Hassan",    avatar: "", email: "alihassan@company.com",    department: "Engineering", designation: "Senior Developer",    joiningDate: "Jan 15, 2023", role: "Developer",       type: "Full-time", status: "Active"   },
  { id: 2,  empId: "EMP001", name: "Sara Ahmed",    avatar: "", email: "alihassan@company.com",    department: "Engineering", designation: "Project Manager",     joiningDate: "Jan 15, 2023", role: "Project Manager", type: "Full-time", status: "Inactive" },
  { id: 3,  empId: "EMP001", name: "Omar Farooq",   avatar: "", email: "alihassan@company.com",    department: "Design",      designation: "UI/UX Designer",      joiningDate: "Jan 15, 2023", role: "Designer",        type: "Contract",  status: "Active"   },
  { id: 4,  empId: "EMP001", name: "Fatima Khan",   avatar: "", email: "alihassan@company.com",    department: "QA",          designation: "QA Lead",             joiningDate: "Jan 15, 2023", role: "QA Tester",       type: "Full-time", status: "Active"   },
  { id: 5,  empId: "EMP001", name: "Bilal Raza",    avatar: "", email: "alihassan@company.com",    department: "Engineering", designation: "Junior Developer",    joiningDate: "Jan 15, 2023", role: "HR Manager",      type: "Contract",  status: "Active"   },
  { id: 6,  empId: "EMP001", name: "Ayesha Malik",  avatar: "", email: "alihassan@company.com",    department: "HR",          designation: "HR Manager",          joiningDate: "Jan 15, 2023", role: "Developer",       type: "Full-time", status: "Active"   },
  { id: 7,  empId: "EMP001", name: "Ali Hassan",    avatar: "", email: "alihassan@company.com",    department: "Engineering", designation: "Full Stack Developer", joiningDate: "Jan 15, 2023", role: "Designer",        type: "Full-time", status: "Inactive" },
  { id: 8,  empId: "EMP001", name: "Fatima Khan",   avatar: "", email: "alihassan@company.com",    department: "QA",          designation: "QA Lead",             joiningDate: "Jan 15, 2023", role: "QA Tester",       type: "Full-time", status: "Active"   },
  { id: 9,  empId: "EMP001", name: "Bilal Raza",    avatar: "", email: "alihassan@company.com",    department: "Engineering", designation: "Junior Developer",    joiningDate: "Jan 15, 2023", role: "HR Manager",      type: "Contract",  status: "Active"   },
  { id: 10, empId: "EMP001", name: "Ayesha Malik",  avatar: "", email: "alihassan@company.com",    department: "HR",          designation: "HR Manager",          joiningDate: "Jan 15, 2023", role: "Developer",       type: "Full-time", status: "Active"   },
];

const tableHeader = [
  { id: "empId",       label: "ID"           },
  { id: "name",        label: "Employee"     },
  { id: "email",       label: "Email"        },
  { id: "department",  label: "Department"   },
 
  { id: "joiningDate", label: "Joining Date" },
  { id: "role",        label: "Role"         },
  { id: "type",        label: "Type"         },
  { id: "status",      label: "Status"       },
  { id: "actions",     label: "Actions"      },
];

const displayRows = [
  "empId",
  "employee_details",   // avatar + name
  "email",
  "department",
 
  "joiningDate",
  "emp_role",           // role chip
  "emp_type",           // type chip
  "emp_status",         // status chip
  "actions_menu",
];

const Employees = () => {
  const navigate = useNavigate();

  const [employees,     setEmployees]     = useState(mockEmployees);
  const [filters,       setFilters]       = useState({});
  const [openModal,     setOpenModal]     = useState(false);
  const [editingEmp,    setEditingEmp]    = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  // ── Dynamic menu options based on row status ──────────────────────────────
  const menuOptions = (row) => [
    { value: "view",   label: "View Profile"                      },
    { value: "edit",   label: "Edit Profile"                      },
    {
      value: row.status === "Active" ? "deactivate" : "activate",
      label: row.status === "Active" ? "Deactivate" : "Activate",
    },
    { value: "delete", label: "Delete", color: "#FF0000"          },
  ];

  const handleMenuAction = (action, row) => {
    if (action === "view") {
      navigate(`/employees/${row.id}`, { state: { employee: row } });
    }
    if (action === "edit") {
      setEditingEmp(row);
      setOpenModal(true);
    }
    if (action === "activate" || action === "deactivate") {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === row.id
            ? { ...e, status: e.status === "Active" ? "Inactive" : "Active" }
            : e
        )
      );
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Employee?",
        description: "This action cannot be undone.",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: () => {
            setEmployees((prev) => prev.filter((e) => e.id !== row.id));
            setDeleteSuccess(true);
        },
        });
    }
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Employees" subtitle="Manage all employee records and profiles" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="+ Add New Employee"
              handlePressBtn={() => { setEditingEmp(null); setOpenModal(true); }}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ───────────────────────────────────────────────────────── */}
      <Filter mode="employees" onFilterChange={(f) => setFilters(f)} />

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={employees}
          displayRows={displayRows}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
        />
      </Box>

      {/* ── Add / Edit Employee dialog ────────────────────────────────────── */}
      <AddEmployee
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingEmp(null); }}
        onSave={(data) => console.log("Save:", data)}
        editingEmployee={editingEmp}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Employee deleted"   
        autoClose
        autoCloseDelay={2000}
        />
    </>
  );
};

export default Employees;