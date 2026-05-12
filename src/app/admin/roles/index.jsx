// app/admin/roles/index.jsx
import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddRoleDialog      from "./addRoleDialog";
import PermissionSummary  from "./permissionSummary";
import addIcon            from "../../../assets/icons/add-icon.svg";

// ── Mock data — replace with real API data ────────────────────────────────────
const mockRoles = [
  { id: 1, roleName: "Super Admin",     description: "Full access to all system features and settings",  employees: 1, pages: [] },
  { id: 2, roleName: "HR Manager",      description: "Manage employee records, attendance, and payroll", employees: 2, pages: [] },
  { id: 3, roleName: "Project Manager", description: "Manage projects, tasks, and team assignments",     employees: 1, pages: [] },
  { id: 4, roleName: "Employee",        description: "View assigned projects and manage own tasks",      employees: 2, pages: [] },
];

const tableHeader = [
  { id: "roleName",    label: "Role Name"   },
  { id: "description", label: "Description" },
  { id: "employees",   label: "Employees"   },
  { id: "actions",     label: "Actions"     },
];

const displayRows = [
  "role_name",
  "role_description",
  "role_employees",
  "actions_menu",
];

const Roles = () => {
  const [roles,         setRoles]         = useState(mockRoles);
  const [openModal,     setOpenModal]     = useState(false);
  const [editingRole,   setEditingRole]   = useState(null);
  const [viewingRole,   setViewingRole]   = useState(null);
  const [summaryOpen,   setSummaryOpen]   = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  const menuOptions = [
    { value: "view",   label: "View"                       },
    { value: "edit",   label: "Edit Role"                  },
    { value: "delete", label: "Delete", color: "#FF0000"   },
  ];

  const handleMenuAction = (action, row) => {
    if (action === "view") {
      setViewingRole(row);
      setSummaryOpen(true);
    }
    if (action === "edit") {
      setEditingRole(row);
      setOpenModal(true);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Role?",
        description: "This will remove the role definition.",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: () => {
          setRoles((prev) => prev.filter((r) => r.id !== row.id));
          setDeleteSuccess(true);
        },
      });
    }
  };

  const handleSave = (data) => {
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...data } : r))
      );
    } else {
      setRoles((prev) => [
        ...prev,
        { id: Date.now(), employees: 0, ...data },
      ]);
    }
    setEditingRole(null);
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid item size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Role Management"
            subtitle="Define roles and configure access permissions"
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Add New Role"
              variant="gradient"
              handlePressBtn={() => { setEditingRole(null); setOpenModal(true); }}
              startIcon={<img src={addIcon} alt="Add" />}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={roles}
          displayRows={displayRows}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
        />
      </Box>

      {/* ── Add / Edit Role dialog ────────────────────────────────────────── */}
      <AddRoleDialog
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingRole(null); }}
        onSave={handleSave}
        editingRole={editingRole}
      />

      {/* ── Permission Summary (View) dialog ──────────────────────────────── */}
      <PermissionSummary
        open={summaryOpen}
        onClose={() => { setSummaryOpen(false); setViewingRole(null); }}
        selectedRole={viewingRole}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Role Deleted"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default Roles;