import { useState, useRef } from "react";
import { Box, Grid, Typography } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import { useSharedDocument } from "../../../hooks/sharedDocument";
import useUserStore          from "../../../zustand/useUserStore";

const tableHeader = [
  { id: "fileName",   label: "Document Name" },
  { id: "type",       label: "Type"          },
  { id: "uploadedBy", label: "Uploaded By"   },
  { id: "date",       label: "Date"          },
  { id: "fileSize",   label: "Size"          },
  { id: "actions",    label: "Actions"       },
];

const displayRows = [
  "doc_name_bold",
  "doc_type_chip",
  "doc_uploader",
  "doc_date",
  "doc_size",
  "doc_actions_menu",
];

const Documents = () => {
  const { user } = useUserStore();
  const isEmployee = user?.role === "EMPLOYEE";
  const isPM       = user?.role === "PROJECT_MANAGER";

  const {
    documents,
    loading,
    actionLoading,
    error,
    deleteDocument,
    downloadDocument,
    fetchDocuments,
  } = useSharedDocument({
    pmId: isPM ? (user?._id || user?.id) : null,
  });

  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [apiError,      setApiError]      = useState("");

  const confirmDialogRef = useRef();

  const tableData = documents.map((doc) => ({
    id:           doc._id,
    fileName:     doc.title,
    type:         doc.documentType,
    uploadedBy:   doc.uploadedBy?.fullName || doc.uploadedBy?.name || "—",
    date:         doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    fileSize:     doc.fileSize || "—",
    uploadedById: doc.uploadedBy?._id || doc.uploadedBy?.id || "",
  }));

  const menuOptions = (row) => {
    if (isEmployee) {
      return [{ value: "download", label: "Download" }];
    }
    if (isPM) {
      const canDelete = row.uploadedById?.toString() === (user?._id || user?.id)?.toString();
      return canDelete
        ? [
            { value: "download", label: "Download" },
            { value: "delete",   label: "Delete", color: "#FF0000" },
          ]
        : [{ value: "download", label: "Download" }];
    }
    // Admin — can delete any doc
    return [
      { value: "download", label: "Download" },
      { value: "delete",   label: "Delete", color: "#FF0000" },
    ];
  };

  const handleMenuAction = (action, row) => {
    if (action === "download") {
      downloadDocument(row.id);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Document?",
        description: "This action cannot be undone.",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteDocument(row.id);
          if (result.success) {
            setDeleteSuccess(true);
          } else {
            setApiError(result.message);
          }
        },
      });
    }
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="Document Management"
            subtitle="All documents uploaded from employee and project pages"
          />
        </Grid>
      </Grid>

      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      <Filter
        mode="documents"
        isPM={isPM}
        onFilterChange={(f) => {
          fetchDocuments({ search: f.search || "", type: f.type || "" });
        }}
      />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={loading}
        />
      </Box>

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Document deleted successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default Documents;