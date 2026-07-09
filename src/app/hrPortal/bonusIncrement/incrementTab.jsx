// src/app/hrPortal/bonusIncrement/incrementTab.jsx — 
import { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";

import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddIncrementDialog from "./addIncrementDialog";
import { useIncrement }   from "../../../hooks/bonusIncrement";

import addIcon    from "../../../assets/icons/add-icon.svg";
import DeleteIcon from "../../../assets/icons/delete-icon-inactive.svg";

const tableHeader = [
  { id: "employeeName",  label: "Employee"        },
  { id: "effectiveDate", label: "Effective Date"  },
  { id: "prevSalary",    label: "Previous Salary" },
  { id: "percentage",    label: "Increment %"     },
  { id: "newSalary",     label: "New Salary"      },
  { id: "description",   label: "Description"     },
  { id: "actions",       label: "Actions"         },
];

const displayRows = [
  "increment_employee",
  "increment_date",
  "increment_prev_salary",
  "increment_percentage",
  "increment_new_salary",
  "increment_description",
  "increment_actions",
];

const IncrementTab = () => {
  const {
    increments,
    loading,
    actionLoading,
    error,
    addIncrement,
    deleteIncrement,
  } = useIncrement();

  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmRef = useRef();

  const handleSave = async (formData) => {
    setApiError("");
    const result = await addIncrement(formData);
    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setDialogOpen(false);
    } else {
      setApiError(result.message);
    }
  };

  const handleDelete = (row) => {
    confirmRef.current?.open({
      title:       "Delete Increment?",
      description: `Remove increment record for ${row.employeeName}?`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteIncrement(row.id);
        if (result.success) {
          setSuccessMsg(result.message);
          setShowSuccess(true);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  return (
    <Box>
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <CustomButton
          btnLabel="Add Increment"
          variant="gradient"
          handlePressBtn={() => setDialogOpen(true)}
          startIcon={<img src={addIcon} alt="add" style={{ width: 14, height: 14 }} />}
        />
      </Box>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={increments}
          displayRows={displayRows}
          deleteIcon={DeleteIcon}
          onDeleteClick={handleDelete}
          isLoading={loading}
        />
      </Box>

      <AddIncrementDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setApiError(""); }}
        onSave={handleSave}
        loading={actionLoading}
        apiError={apiError}
      />

      <ConfirmationDialog ref={confirmRef} />

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

export default IncrementTab;