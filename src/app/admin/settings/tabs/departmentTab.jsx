import { useRef, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";

import CustomButton       from "../../../../components/customButton";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import AddDepartment   from "./addDepartment";
import addIcon            from "../../../../assets/icons/add-icon.svg";
import { useDepartment }  from "../../../../hooks/department";  

const tableHeader = [
  { id: "name",        label: "Department Name" },
  { id: "description", label: "Description"     },
  { id: "employees",     label: "Employees"       },
   { id: "status",      label: "Status"          },
  { id: "actions",     label: "Actions"         },
];

const displayRows = ["dept_name", "dept_description", "dept_employees","dept_status", "actions_menu"];

const menuOptions = [
  { value: "edit",   label: "Edit"                     },
  { value: "delete", label: "Delete", color: "#FF0000" },
];

const DepartmentTab = () => {
  const {
    departments,
    loading,
    actionLoading,
    error,
    pagination,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    handlePageChange,
    handleRowsPerPageChange,
  } = useDepartment();

  const [openModal,     setOpenModal]     = useState(false);
  const [editingDept,   setEditingDept]   = useState(null);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [apiError,      setApiError]      = useState("");

  const confirmDialogRef = useRef();

 // map API shape → table row shape
const tableData = departments.map((dept) => ({
  id:          dept._id,
  name:        dept.name,
  description: dept.description || "—",
  employees:   dept.employeeCount ?? 0,
  status:      dept.isActive === false ? "Inactive" : "Active",   
  isActive:    dept.isActive !== false,
}));

// ── Dynamic menu per row — Deactivate/Activate replaces a static list ──────
const menuOptions = (row) => [
  { value: "edit", label: "Edit" },
  {
    value: row.isActive ? "deactivate" : "activate",
    label: row.isActive ? "Deactivate" : "Activate",
  },
  { value: "delete", label: "Delete", color: "#FF0000" },
];

  const handleMenuAction = (action, row) => {
  if (action === "edit") {
    setEditingDept(row);
    setOpenModal(true);
  }

  // ── Deactivate / Activate — keeps the department (and its history)
  // in the system, just flips isActive so it stops showing up as an
  // option when assigning new employees. ─────────────────────────────────
  if (action === "deactivate" || action === "activate") {
    const nextActive = action === "activate";
    confirmDialogRef.current?.open({
      title:       nextActive ? "Activate Department?" : "Deactivate Department?",
      description: nextActive
        ? `"${row.name}" will become available again for assigning employees.`
        : `"${row.name}" will no longer be available when assigning new employees. Existing employees and historical data stay as they are.`,
      confirmText: nextActive ? "Yes, Activate" : "Yes, Deactivate",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await updateDepartment(row.id, { isActive: nextActive });
        if (result.success) {
          setSuccessMsg(nextActive ? "Department activated successfully." : "Department deactivated successfully.");
          setShowSuccess(true);
        } else {
          setApiError(result.message);
        }
      },
    });
  }

  if (action === "delete") {
    confirmDialogRef.current?.open({
      title:       "Delete Department?",
      description: `"${row.name}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm:   async () => {
        const result = await deleteDepartment(row.id);
        if (result.success) {
          setSuccessMsg(result.message);
          setShowSuccess(true);
        } else {
          setApiError(result.message);   // ← now shows the reassignment-required message
        }
      },
    });
  }
};

  const handleSave = async (formData) => {
    let result;

    if (editingDept) {
      result = await updateDepartment(editingDept.id, formData);
    } else {
      result = await createDepartment(formData);
    }

    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setOpenModal(false);
      setEditingDept(null);
    } else {
      setApiError(result.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingDept(null);
    setApiError("");
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      {/* Header */}
            <Grid container alignItems="center" spacing={1.5} mb={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography fontSize="18px" fontWeight={600} color="text.darkGray">
            Departments
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            Manage your company departments
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }} mt={{ xs: 1, md: 0 }}>
            <CustomButton
              btnLabel="Add Department"
              variant="gradient"
              handlePressBtn={() => { setEditingDept(null); setOpenModal(true); }}
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

      {/* Add / Edit dialog */}
      <AddDepartment
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingDept={editingDept}
        loading={actionLoading}   // ← spinner on Save button
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
    </Box>
  );
};

export default DepartmentTab;