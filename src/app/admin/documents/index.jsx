import { useState, useRef } from "react";
import { Box, Grid, MenuItem } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import UploadDocument     from "./uploadDocument"; 

import { MoreVerticalIcon } from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const mockDocuments = [
  { id: 1, fileName: "Employee Handbook 2024",         type: "Other",                uploadedBy: "David Kim",      date: "Jun 29, 2026", fileSize: "3.2 MB" },
  { id: 2, fileName: "NDA - Acme Corp",                type: "NDA",                  uploadedBy: "David Kim",      date: "Jun 29, 2026", fileSize: "450 KB" },
  { id: 3, fileName: "Mobile App v2 - Technical Spec", type: "Project Documentation",uploadedBy: "James Wilson",   date: "Jun 29, 2026", fileSize: "1.8 MB" },
  { id: 4, fileName: "Sarah Chen - Employment Contract",type: "Employment Contract",  uploadedBy: "David Kim",      date: "Jun 29, 2026", fileSize: "1.8 MB" },
  { id: 5, fileName: "Sarah Chen - Employment Contract",type: "Employment Contract",  uploadedBy: "Marcus Johnson", date: "Jun 29, 2026", fileSize: "890 KB" },
  { id: 6, fileName: "Client Portal - SLA Agreement",  type: "Client Agreement",     uploadedBy: "James Wilson",   date: "Jun 29, 2026", fileSize: "1.8 MB" },
];

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
  const [documents,     setDocuments]     = useState(mockDocuments);
  const [filters,       setFilters]       = useState({});
  const [openModal,     setOpenModal]     = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const confirmDialogRef = useRef();

  const menuOptions = [
    { value: "download", label: "Download" },
    { value: "delete",   label: "Delete", color: "#FF0000" },
  ];

  const handleMenuAction = (action, row) => {
    if (action === "download") {
      // handle download
      console.log("Download:", row);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Document?",
        description: "This action cannot be undone.",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: () => {
          setDocuments((prev) => prev.filter((d) => d.id !== row.id));
          setDeleteSuccess(true);
        },
      });
    }
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Document Management"
            subtitle="Manage and organize all company documents"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="+ Upload Document"
              handlePressBtn={() => setOpenModal(true)}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="documents" onFilterChange={(f) => setFilters(f)} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={documents}
          displayRows={displayRows}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
        />
      </Box>

      {/* ── Upload Document dialog ──────────────────────────────────────── */}
     <UploadDocument
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(data) => {
            console.log("Upload:", data);
            setOpenModal(false);
            setUploadSuccess(true);
        }}
        />

      {/* ── Delete confirmation ─────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ──────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Document deleted"
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={uploadSuccess}
        onClose={() => setUploadSuccess(false)}
        message="Document uploaded successfully"
        autoClose
        autoCloseDelay={2000}
        />
    </>
  );
};

export default Documents;