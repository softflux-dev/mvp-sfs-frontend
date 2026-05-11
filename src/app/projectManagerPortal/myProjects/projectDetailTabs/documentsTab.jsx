// projectDetailTabs/documentsTab.jsx
import { useState, useRef } from "react";
import { Box, Grid }        from "@mui/material";

import CustomButton       from "../../../../components/customButton";
import HeaderText         from "../../../../components/headerText";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import UploadDocumentDialog from "./uploadDocumentDialog";
import UploadIcon from "../../../../assets/icons/upload-doc-icon.svg";
import DeleteIcon from "../../../../assets/icons/delete-icon-inactive.svg";
import downloadIcon from "../../../../assets/icons/download.svg";

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockDocuments = [
  { id: 1, fileName: "John Smith Employment Contract", type: "Employment Contract", uploadDate: "2026-01-15", uploadedBy: "HR Admin",    fileSize: "2.4 MB" },
  { id: 2, fileName: "Confidentiality Agreement",      type: "NDA",                 uploadDate: "2026-01-15", uploadedBy: "Legal Team",  fileSize: "2.4 MB" },
  { id: 3, fileName: "John Smith Employment Contract", type: "Employment Contract", uploadDate: "2026-01-15", uploadedBy: "HR Admin",    fileSize: "2.4 MB" },
];

const tableHeader = [
  { id: "fileName",   label: "Name"        },
  { id: "type",       label: "Type"        },
  { id: "uploadDate", label: "Upload Date" },
  { id: "uploadedBy", label: "Uploaded By" },
  { id: "fileSize",   label: "File Size"   },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "doc_name",
  "doc_type",
  "uploadDate",
  "doc_uploaded_by",
  "doc_file_size",
  "actions",
];

const DocumentsTab = ({ project = {} }) => {
  const [documents,      setDocuments]      = useState(mockDocuments);
  const [uploadOpen,     setUploadOpen]     = useState(false);
  const [deleteSuccess,  setDeleteSuccess]  = useState(false);

  const confirmDialogRef = useRef();

  const handleDelete = (row) => {
    confirmDialogRef.current?.open({
      title:       "Confirmation !",
      description: "Are you sure you want to delete this document?",
      confirmText: "Yes",
      cancelText:  "Cancel",
      onConfirm: () => {
        setDocuments((prev) => prev.filter((d) => d.id !== row.id));
        setDeleteSuccess(true);
      },
    });
  };

  const handleDownload = (row) => {
    console.log("Download:", row.fileName);
  };

  const handleUploadSave = (data) => {
    const newDoc = {
      id:         documents.length + 1,
      fileName:   data.file?.name || "Untitled.pdf",
      type:       data.documentType,
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "HR Admin",
      fileSize:   data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "-",
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setUploadOpen(false);
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          <HeaderText title="Employees" subtitle="" />
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

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={documents}
          displayRows={displayRows}
          downloadIcon={downloadIcon}
          onDownloadClick={handleDownload}
          deleteIcon={DeleteIcon}
          onDeleteClick={handleDelete}
          isLoading={false}
        />
      </Box>

      {/* ── Upload dialog ─────────────────────────────────────────────────── */}
      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUploadSave}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Document deleted successfully."
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default DocumentsTab;