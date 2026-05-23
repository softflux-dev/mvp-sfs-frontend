import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import UploadDocument     from "./uploadDocument";
import { useSharedDocument }    from "../../../hooks/sharedDocument";
import useUserStore              from "../../../zustand/useUserStore";
import { useProjectType }        from "../../../hooks/projectType";
import { useDepartment }         from "../../../hooks/department";
import { getProjectManagersApi } from "../../../api/modules/project";
import { getProjectsApi }        from "../../../api/modules/project";
import { getEmployeesApi }       from "../../../api/modules/employee";

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
    uploadDocument,
    deleteDocument,
    downloadDocument,
    fetchDocuments,
  } = useSharedDocument({
    pmId: isPM ? (user?._id || user?.id) : null,
  });

  const { projectTypes, fetchProjectTypes } = useProjectType();
  const { departments,  fetchDepartments  } = useDepartment();

  const [managers,      setManagers]      = useState([]);
  const [employees,     setEmployees]     = useState([]);
  const [allProjects,   setAllProjects]   = useState([]);

  const [filters,       setFilters]       = useState({});
  const [openModal,     setOpenModal]     = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [apiError,      setApiError]      = useState("");

  const confirmDialogRef = useRef();

  // ── Fetch supporting data for the upload modal ────────────────────────
  useEffect(() => {
    if (isEmployee) return;

    fetchProjectTypes();
    fetchDepartments({ limit: 100 });

    // PM doesn't need managers list (no manager assignment in their upload form)
    if (!isPM) {
      getProjectManagersApi().then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setManagers(res.data.data.managers || []);
        }
      });
    }

    getProjectsApi({ limit: 200 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setAllProjects(res.data.data.projects || []);
      }
    });

    getEmployeesApi({ limit: 200 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setEmployees(res.data.data.employees || []);
      }
    });
  }, [isEmployee, isPM]);

  // ── Map API shape → table row ─────────────────────────────────────────
  const tableData = documents.map((doc) => ({
    id:         doc._id,
    fileName:   doc.title,
    type:       doc.documentType,
    uploadedBy: doc.uploadedBy?.fullName || doc.uploadedBy?.name || "—",
    date:       doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    fileSize:   doc.fileSize || "—",
    // keep uploadedBy id so PM can only delete their own docs
    uploadedById: doc.uploadedBy?._id || doc.uploadedBy?.id || "",
  }));

  // ── Menu options per role ─────────────────────────────────────────────
  const menuOptions = (row) => {
    if (isEmployee) {
      return [{ value: "download", label: "Download" }];
    }
    if (isPM) {
      // PM can only delete docs they uploaded themselves
      const canDelete = row.uploadedById?.toString() === (user?._id || user?.id)?.toString();
      return canDelete
        ? [
            { value: "download", label: "Download" },
            { value: "delete",   label: "Delete", color: "#FF0000" },
          ]
        : [{ value: "download", label: "Download" }];
    }
    // Admin
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

  const handleUploadSave = async (formData) => {
    const fd = new FormData();
    fd.append("title",        formData.title);
    fd.append("documentType", formData.type || "other");
    fd.append("description",  formData.description || "");

    const assignees = formData.assigneeId
      ? [formData.assigneeId]
      : (formData.assigneeIds || []);
    fd.append("assigneeIds", JSON.stringify(assignees));

    if (formData.files?.[0]) {
      fd.append("file", formData.files[0]);
    }

    const result = await uploadDocument(fd);
    if (result.success) {
      setOpenModal(false);
      setUploadSuccess(true);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Document Management"
            subtitle="Manage and organize all company documents"
          />
        </Grid>
        {!isEmployee && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" justifyContent="flex-end">
              <CustomButton
                btnLabel="+ Upload Document"
                handlePressBtn={() => setOpenModal(true)}
                variant="gradient"
              />
            </Box>
          </Grid>
        )}
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
          setFilters(f);
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

      {!isEmployee && (
        <UploadDocument
          open={openModal}
          onClose={() => { setOpenModal(false); setApiError(""); }}
          onSave={handleUploadSave}
          loading={actionLoading}
          projectTypeOptions={projectTypes}
          allProjects={allProjects}
          managerOptions={managers}
          employeeOptions={employees}
          departmentOptions={departments}
          isPM={isPM}
        />
      )}

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Document deleted successfully"
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