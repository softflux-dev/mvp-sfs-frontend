import { useRef, useState } from "react";
import { Box, Chip, Grid, Typography } from "@mui/material";

import CustomButton         from "../../../../components/customButton";
import PaginatedTable       from "../../../../components/dynamicTable";
import ConfirmationDialog   from "../../../../components/popups/confirmation";
import SuccessPopup         from "../../../../components/popups/confirmationDialog";
import UploadDocumentDialog from "./uploadDocumentDialog";
import { useDocument }      from "../../../../hooks/document";

import UploadIcon   from "../../../../assets/icons/upload-doc-icon.svg";
import DeleteIcon   from "../../../../assets/icons/delete-icon-inactive.svg";
import downloadIcon from "../../../../assets/icons/download.svg";

const tableHeader = [
  { id: "fileName",   label: "Name"        },
  { id: "type",       label: "Type"        },
  { id: "uploadDate", label: "Upload Date" },
  { id: "uploadedBy", label: "Uploaded By" },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "doc_name",
  "doc_type_chip",
  "uploadDate",
  "doc_uploaded_by",
  "actions",
];

const DocumentsTab = ({ employee = {} }) => {
  const {
    documents,
    loading,
    actionLoading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  } = useDocument(employee.id);

  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  const tableData = documents.map((doc) => ({
    id:         doc._id,
    fileName:   doc.title,
    type:       doc.documentType,
    uploadDate: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    uploadedBy: doc.uploadedBy?.fullName || doc.uploadedBy?.name || "Admin",
    fileSize:   doc.fileSize || "—",
    // carry source so handlers know which API to call
    _source:    doc._source || "employee",
    // render a small badge in the Source column
    
  }));

  const handleDelete = (row) => {
    // shared docs are read-only here — admin manages them from Document Management
    if (row._source === "shared") {
      setApiError("Shared documents can only be deleted from Document Management.");
      return;
    }
    confirmDialogRef.current?.open({
      title:       "Delete Document?",
      description: `"${row.fileName}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteDocument(row.id);
        if (result.success) { setSuccessMsg(result.message); setShowSuccess(true); }
        else setApiError(result.message);
      },
    });
  };

  const handleDownload = (row) => {
    downloadDocument(row.id, row._source);
  };

  const handleUploadSave = async (formData) => {
    const result = await uploadDocument(formData);
    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setUploadOpen(false);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          <Typography fontSize="20px" fontWeight={700} color="text.primary">
            Documents
          </Typography>
        </Grid>
        <Grid item>
          <CustomButton
            btnLabel="Upload Document"
            variant="gradient"
            handlePressBtn={() => setUploadOpen(true)}
            startIcon={<img src={UploadIcon} alt="Upload" />}
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

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          downloadIcon={downloadIcon}
          onDownloadClick={handleDownload}
          deleteIcon={DeleteIcon}
          onDeleteClick={handleDelete}
          isLoading={loading}
        />
      </Box>

      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUploadSave}
        loading={actionLoading}
      />

      <ConfirmationDialog ref={confirmDialogRef} />

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

export default DocumentsTab;