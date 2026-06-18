// hrPortal/holidays/index.jsx 
import { useRef, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddHolidayDialog   from "./addHolidayDialog";
import EditIcon           from "../../../assets/icons/editIcon.svg";
import { useHoliday }     from "../../../hooks/holiday";

const tableHeader = [
  { id: "name",     label: "Holiday Name" },
  { id: "type",     label: "Type"         },
  { id: "dates",    label: "Date(s)"      },
  { id: "days",     label: "Duration"     },
  { id: "status",   label: "Status"       },
  { id: "actions",  label: "Actions"      },
];

const displayRows = [
  "holiday_name",
  "holiday_type",
  "holiday_dates",
  "holiday_days",
  "holiday_status",
  "holiday_actions",
];

const HolidayManagement = () => {
  const {
    holidays, loading, actionLoading, error, pagination,
    createHoliday, updateHoliday, deleteHoliday,
    handlePageChange, handleRowsPerPageChange, handleFilterChange,
  } = useHoliday();

  const [openModal,   setOpenModal]   = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  const tableData = holidays;  // already shaped by the hook/backend

  const handleEditClick = (row) => {
    setEditingHoliday(row);
    setOpenModal(true);
  };

  const handleDeleteClick = (row) => {
    confirmDialogRef.current?.open({
      title:       "Delete Holiday?",
      description: `"${row.name}" will be permanently removed. This may affect attendance/payroll calculations for the dates it covers.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteHoliday(row.id);
        if (result.success) {
          setSuccessMsg(result.message);
          setShowSuccess(true);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleSave = async (formData) => {
    let result;
    if (editingHoliday) {
      result = await updateHoliday(editingHoliday.id, formData);
    } else {
      result = await createHoliday(formData);
    }

    if (result.success) {
      setSuccessMsg(
        result.overlapWarning
          ? `${result.message} ${result.overlapWarning}`
          : result.message
      );
      setShowSuccess(true);
      setOpenModal(false);
      setEditingHoliday(null);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingHoliday(null);
    setApiError("");
  };

  return (
    <>
      {/* Header */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Holiday Management"
            subtitle="Manage public, religious, and company holidays"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="+ Add Holiday"
              handlePressBtn={() => { setEditingHoliday(null); setOpenModal(true); }}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Error banner */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {/* Filter */}
      <Filter
        mode="holidays"
        onFilterChange={(filterValues) => {
          handleFilterChange({
            search:  filterValues.search  || "",
            type:    filterValues.type    || "",
            payType: filterValues.payType || "",
            year:    filterValues.year    || "",
          });
        }}
      />

      {/* Table */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          editIcon={EditIcon}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
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
      <AddHolidayDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingHoliday={editingHoliday}
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
        autoCloseDelay={2500}
      />
    </>
  );
};

export default HolidayManagement;