// employees/projectDetailTabs/documentsTab.jsx — 
import { useState, useRef, useMemo, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";

import CustomButton         from "../../../../components/customButton";
import PaginatedTable       from "../../../../components/dynamicTable";
import ConfirmationDialog   from "../../../../components/popups/confirmation";
import SuccessPopup         from "../../../../components/popups/confirmationDialog";
import UploadProjectDocumentDialog from "./uploadProjectDocumentDialog";
import { useProjectDocument } from "../../../../hooks/projectDocument";
import { getProjectTeamApi }  from "../../../../api/modules/project";

import UploadIcon   from "../../../../assets/icons/upload-doc-icon.svg";
import DeleteIcon   from "../../../../assets/icons/delete-icon-inactive.svg";
import downloadIcon from "../../../../assets/icons/download.svg";

const tableHeader = [
  { id: "fileName",   label: "Name"        },
  { id: "sharedWith", label: "Shared With" },
  { id: "uploadDate", label: "Upload Date" },
  { id: "fileSize",   label: "File Size"   },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "doc_name",
  "doc_shared_with",
  "uploadDate",
  "doc_file_size",
  "actions",
];

/**
 * DocumentsTab (Project Detail)
 *
 * Props:
 *   project        — the current project (needs project.id)
 *   teamMembers    — array from TeamTab's onTeamChange (used as an instant
 *                     cache if already loaded, but NOT relied upon — this
 *                     tab fetches the team itself so it works correctly
 *                     even if Documents is opened before ever visiting Team)
 *   projectManager — { _id, fullName, avatar } — included separately since
 *                     the team API's member list may not include the PM
 */
const DocumentsTab = ({ project = {}, teamMembers = [], projectManager = null }) => {
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

  // ── Fetch the project's team independently — do NOT rely solely on the
  // teamMembers prop, which only populates once TeamTab has been mounted
  // and fetched at least once. Without this, opening Documents before ever
  // visiting the Team tab shows only the PM in the picker (the bug being
  // fixed here). If teamMembers is already populated (passed from parent
  // because Team was visited), use it immediately as a fast first paint,
  // then this fetch confirms/refreshes it.
  const [fetchedTeam, setFetchedTeam] = useState(teamMembers);

  useEffect(() => {
    if (!project.id) return;
    getProjectTeamApi(project.id).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setFetchedTeam(res.data.data.team || []);
      }
    });
  }, [project.id]);

  // Prefer the freshly-fetched team; fall back to the prop only if the
  // fetch hasn't resolved yet (avoids a flash of empty state).
  const effectiveTeam = fetchedTeam.length ? fetchedTeam : teamMembers;

  // ── Team picker source: project team members + PM, deduplicated ─────────
  const teamOptions = useMemo(() => {
    const list = effectiveTeam.map((m) => ({
      _id:      m._id || m.id,
      fullName: m.name || m.fullName,
      avatar:   m.avatar,
      role:     m.role,
    }));

    if (projectManager?._id) {
      const alreadyIncluded = list.some((m) => m._id === projectManager._id);
      if (!alreadyIncluded) {
        list.unshift({
          _id:      projectManager._id,
          fullName: projectManager.fullName,
          avatar:   projectManager.avatar,
          role:     "Project Manager",
        });
      }
    }

    return list;
  }, [effectiveTeam, projectManager]);

  const tableData = documents.map((doc) => ({
    id:         doc._id,
    fileName:   doc.title,
    uploadDate: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    fileSize:    doc.fileSize || "—",
    sharedNames: (doc.assigneeIds || []).map((a) => a.fullName).filter(Boolean),
    sharedCount: doc.assigneeIds?.length || 0,
  }));

  const handleDelete = (row) => {
    confirmDialogRef.current?.open({
      title:       "Delete Document?",
      description: `"${row.fileName}" will be permanently removed, including from any team members' My Documents.`,
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

  // Pass the raw form object straight through — the hook's uploadDocument
  // builds the FormData itself (title, documentType, assigneeIds, file).
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

      <UploadProjectDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUploadSave}
        loading={actionLoading}
        teamOptions={teamOptions}
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