import { useState, useRef }        from "react";
import { Box, Grid, Typography }   from "@mui/material";

import CustomButton         from "../../../../components/customButton";
import PaginatedTable       from "../../../../components/dynamicTable";
import ConfirmationDialog   from "../../../../components/popups/confirmation";
import SuccessPopup         from "../../../../components/popups/confirmationDialog";
import UploadDocumentDialog from "./uploadDocumentDialog";
import { useProjectDocument } from "../../../../hooks/projectDocument";

import UploadIcon   from "../../../../assets/icons/upload-doc-icon.svg";
import DeleteIcon   from "../../../../assets/icons/delete-icon-inactive.svg";
import downloadIcon from "../../../../assets/icons/download.svg";

const tableHeader = [
  { id: "fileName",   label: "Name"        },
 
  { id: "uploadDate", label: "Upload Date" },
 
  { id: "fileSize",   label: "File Size"   },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "doc_name",
 
  "uploadDate",
 
  "doc_file_size",
  "actions",
];

const DocumentsTab = ({ project = {} }) => {
  const {
    documents,
    loading,
    actionLoading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  } = useProjectDocument(project.id);

  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  const tableData = documents.map((doc) => ({
    id:         doc._id,
    fileName:   doc.title,
   
    uploadDate: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
 
    fileSize:   doc.fileSize || "—",
  }));

  const handleDelete = (row) => {
    confirmDialogRef.current?.open({
      title:       "Delete Document?",
      description: `"${row.fileName}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteDocument(row.id);
        if (result.success) {
          setSuccessMsg(result.message);
          setShowSuccess(true);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleUploadSave = async (formData) => {
    const result = await uploadDocument(formData);
    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setUploadOpen(false);
      setApiError("");
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
          onDownloadClick={(row) => downloadDocument(row.id)}
          deleteIcon={DeleteIcon}
          onDeleteClick={handleDelete}
          isLoading={loading}
        />
      </Box>

      {/* reuse same UploadDocumentDialog from employee detail */}
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