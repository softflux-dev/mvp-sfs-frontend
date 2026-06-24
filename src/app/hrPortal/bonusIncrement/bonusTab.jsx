// src/app/hrPortal/bonusIncrement/bonusTab.jsx — FULL REPLACEMENT
import { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";

import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddBonusDialog     from "./addBonusDialog";
import { useBonus }       from "../../../hooks/bonusIncrement";

import addIcon    from "../../../assets/icons/add-icon.svg";
import editIcon   from "../../../assets/icons/editIcon.svg";
import DeleteIcon from "../../../assets/icons/delete-icon-inactive.svg";

const tableHeader = [
  { id: "employeeName", label: "Employee"    },
  { id: "month",        label: "Month/Year"  },
  { id: "amount",       label: "Amount (Rs)" },
  { id: "addedOn",      label: "Added On"    },
  { id: "addedBy",      label: "Added By"    },
  { id: "actions",      label: "Actions"     },
];

const displayRows = [
  "bonus_employee",
  "bonus_month",
  "bonus_amount",
  "bonus_added_on",
  "bonus_added_by",
  "bonus_actions",
];

const BonusTab = () => {
  const {
    bonuses,
    loading,
    actionLoading,
    error,
    addBonus,
    updateBonus,
    deleteBonus,
  } = useBonus();

  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [successMsg,   setSuccessMsg]   = useState("");
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [apiError,     setApiError]     = useState("");

  const confirmRef = useRef();

  const handleSave = async (formData) => {
    setApiError("");
    let result;

    if (editingBonus) {
      result = await updateBonus(editingBonus.id, {
        month:       formData.month,
        year:        formData.year,
        amount:      formData.amount,
        description: formData.description,
      });
    } else {
      result = await addBonus({
        employeeIds: formData.employeeIds,
        month:       formData.month,
        year:        formData.year,
        amount:      formData.amount,
        description: formData.description,
      });
    }

    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setDialogOpen(false);
      setEditingBonus(null);
    } else {
      setApiError(result.message);
    }
  };

  const handleEdit = (row) => {
    setEditingBonus(row);
    setDialogOpen(true);
  };

  const handleDelete = (row) => {
    confirmRef.current?.open({
      title:       "Delete Bonus?",
      description: `Remove bonus for ${row.employeeName} (${row.monthYear})?`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteBonus(row.id);
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
          btnLabel="Add Bonus"
          variant="gradient"
          handlePressBtn={() => { setEditingBonus(null); setDialogOpen(true); }}
          startIcon={<img src={addIcon} alt="add" style={{ width: 14, height: 14 }} />}
        />
      </Box>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={bonuses}
          displayRows={displayRows}
          onEditClick={handleEdit}
          editIcon={editIcon}
          deleteIcon={DeleteIcon}
          onDeleteClick={handleDelete}
          isLoading={loading}
        />
      </Box>

      <AddBonusDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingBonus(null); setApiError(""); }}
        onSave={handleSave}
        editingBonus={editingBonus}
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

export default BonusTab;