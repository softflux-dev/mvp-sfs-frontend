import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddEmployee        from "./addEmployee";
import { useEmployee }    from "../../../hooks/employee";       
import { useDepartment } from "../../../hooks/department";
import { useRole }       from "../../../hooks/role";

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
  "employee_details",
  "email",
  "department",
  "joiningDate",
  "emp_role",
  "emp_type",
  "emp_status",
  "actions_menu",
];

const Employees = () => {
  const navigate = useNavigate();
  const { departments, fetchDepartments } = useDepartment();
  const { roles,       fetchRoles }       = useRole();


  const {
    employees,
    loading,
    actionLoading,
    error,
    pagination,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  } = useEmployee();

  const [openModal,   setOpenModal]   = useState(false);
  const [editingEmp,  setEditingEmp]  = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  // ── Map API shape → table row shape ───────────────────────────────────────
  const tableData = employees.map((emp) => ({
    id:          emp._id,
    empId:       emp.empId,
    machineId:     emp.machineId || "", 
    name:        emp.fullName,
    avatar:      emp.avatar || "",
    email:       emp.email,
    department:  emp.department?.name || "—",
    departmentId:emp.department?._id  || "",
    designation: emp.designation      || "—",
    joiningDate: emp.joiningDate
      ? new Date(emp.joiningDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    role:        emp.role?.roleName   || "—",
    roleId:      emp.role?._id        || "",
    type:        emp.employmentType   || "—",
    status:      emp.isActive ? "Active" : "Inactive",
    // detail page fields
    phone:         emp.phone,
    workingHours:  emp.workingHours,
    monthlySalary: emp.monthlySalary,
    mustChangePassword: emp.mustChangePassword,
  }));

  // ── Dynamic menu per row ──────────────────────────────────────────────────
  const menuOptions = (row) => [
    { value: "view",   label: "View Profile"  },
    { value: "edit",   label: "Edit Profile"  },
    {
      value: row.status === "Active" ? "deactivate" : "activate",
      label: row.status === "Active" ? "Deactivate" : "Activate",
    },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  useEffect(() => {
  fetchDepartments({ limit: 100 });
  fetchRoles({ limit: 100 });
}, []);

  const handleMenuAction = async (action, row) => {
    if (action === "view") {
      navigate(`/employees/${row.id}`, { state: { employee: row } });
    }

    if (action === "edit") {
      setEditingEmp(row);
      setOpenModal(true);
    }

    if (action === "activate" || action === "deactivate") {
      const result = await toggleEmployeeStatus(row.id);
      if (result.success) {
        setSuccessMsg(result.message);
        setShowSuccess(true);
      } else {
        setApiError(result.message);
      }
    }

    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Employee?",
        description: `"${row.name}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteEmployee(row.id);
          if (result.success) {
            setSuccessMsg(result.message);
            setShowSuccess(true);
          } else {
            setApiError(result.message);
          }
        },
      });
    }
  };

  const handleSave = async (formData) => {
  let result;

  if (editingEmp) {
    result = await updateEmployee(editingEmp.id, formData);
  } else {
    result = await createEmployee(formData);
  }

  if (result.success) {
    // Check if email was delivered
    const emailSent = result.data?.emailSent ?? true;

    setSuccessMsg(
      emailSent
        ? result.message
        : "Employee created, but the welcome email could not be delivered. Please verify their email address."
    );
    setShowSuccess(true);
    setOpenModal(false);
    setEditingEmp(null);
    setApiError("");
  } else {
    setApiError(result.message);
  }
};

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingEmp(null);
    setApiError("");
  };

  return (
    <>
      {/* Header */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Employees"
            subtitle="Manage all employee records and profiles"
          />
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

      {/* API error banner */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {/* Filter */}
        <Filter
        mode="employees"
        departments={departments}
        roles={roles}
        onFilterChange={(filterValues) => {
          handleFilterChange({
            search:     filterValues.search     || "",
            department: filterValues.department || "",
            role:       filterValues.role       || "",
            status:     filterValues.status     || "",
          });
        }}
      />

      {/* Table */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={loading}
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          totalCount={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      {/* Add / Edit dialog */}
      <AddEmployee
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingEmployee={editingEmp}
        loading={actionLoading}
        apiError={apiError}
      />

      {/* Confirm delete */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* Success popup */}
      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default Employees;