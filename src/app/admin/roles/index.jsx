import { useState, useRef } from "react";
import { Box, Grid, Typography } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddRoleDialog      from "./addRoleDialog";
import PermissionSummary  from "./permissionSummary";
import addIcon            from "../../../assets/icons/add-icon.svg";
import { useRole }        from "../../../hooks/role";             

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
  const {
    roles,
    loading,
    actionLoading,
    error,
    pagination,
    createRole,
    updateRole,
    deleteRole,
    handlePageChange,
    handleRowsPerPageChange,
  } = useRole();

  const [openModal,   setOpenModal]   = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  // ── Map API shape → table row shape ───────────────────────────────────────
  const tableData = roles.map((role) => ({
    id:            role._id,
    roleName:      role.roleName,
    description:   role.description || "—",
    employees:     role.employeeCount ?? 0,   // ← from model
    pages:         role.pages        || [],
    isSystem:      role.isSystem     || false,
    department:    role.department?._id || role.department || "",
  }));

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit Role"                },
    { value: "delete", label: "Delete", color: "#FF0000" },
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
      // block delete on system roles in UI as well
      if (row.isSystem) {
        setApiError("System roles cannot be deleted.");
        return;
      }
      confirmDialogRef.current?.open({
        title:       "Delete Role?",
        description: `"${row.roleName}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteRole(row.id);
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

  const handleSave = async ({ formData, pages }) => {
    const payload = { ...formData, pages };
    let result;

    if (editingRole) {
      result = await updateRole(editingRole.id, payload);
    } else {
      result = await createRole(payload);
    }

    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setOpenModal(false);
      setEditingRole(null);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingRole(null);
    setApiError("");
  };

  return (
    <>
      {/* Header */}
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

      {/* API error banner */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {/* Table */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
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

      {/* Add / Edit Role dialog */}
      <AddRoleDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingRole={editingRole}
        loading={actionLoading}
        apiError={apiError}
      />

      {/* Permission Summary (View) */}
      <PermissionSummary
        open={summaryOpen}
        onClose={() => { setSummaryOpen(false); setViewingRole(null); }}
        selectedRole={viewingRole}
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

export default Roles;