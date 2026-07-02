import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddProject         from "./addProject";
import AddProjectType     from "./addProjectType";
import { useProject }     from "../../../hooks/project";
import { useProjectType } from "../../../hooks/projectType";
import { useDepartment }  from "../../../hooks/department";
import { getProjectManagersApi } from "../../../api/modules/project";

const tableHeader = [
  { id: "projectName",    label: "Project Name"    },
  { id: "client",         label: "Client"          },
  { id: "projectManager", label: "Project Manager" },
  { id: "projectType",    label: "Project Type"    },
  { id: "startDate",      label: "Start Date"      },
  { id: "endDate",        label: "End Date"        },
  { id: "status",         label: "Project Status"          },
  { id: "progress",       label: "Progress"        },
  { id: "actions",        label: "Actions"         },
];

const displayRows = [
  "projectName",
  "client",
  "projectManager",
  "proj_type_label",
  "startDate",
  "endDate",
  "project_status",
  "project_progress",
  "actions_menu",
];

const Projects = () => {
  const navigate = useNavigate();

  const {
    projects,
    loading,
    actionLoading,
    error,
    pagination,
    createProject,
    updateProject,
    deleteProject,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  } = useProject();

  const { projectTypes, fetchProjectTypes } = useProjectType();

  const [managers,       setManagers]       = useState([]);
  const [openModal,      setOpenModal]      = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [typeModalOpen,  setTypeModalOpen]  = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [apiError,       setApiError]       = useState("");

  const confirmDialogRef = useRef();

  // ── Fetch supporting dropdown data ────────────────────────────────────────
  useEffect(() => {
  fetchProjectTypes();
  getProjectManagersApi().then((res) => {
    if (res?.status === 200 || res?.status === 201) {
      setManagers(res.data.data.managers || []);
    }
  });
}, []);

  // ── Map API shape → table row shape ──────────────────────────────────────
  const tableData = projects.map((proj) => ({
    id:             proj._id,
    projectName:    proj.projectName,
    client:         proj.clientName,
    projectManager: proj.projectManager?.fullName || "—",
    projectType: proj.projectType?.value || proj.projectType?._id || "",
    startDate:      proj.startDate
      ? new Date(proj.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    endDate:        proj.endDate
      ? new Date(proj.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    status:         proj.status
      ? proj.status.charAt(0).toUpperCase() + proj.status.slice(1)
      : "—",
    progress:       proj.progress ?? 0,
    totalTasks:     proj.totalTasks     ?? 0,
    completedTasks: proj.completedTasks ?? 0,
    budget:         proj.budget   ?? 0,
    description:    proj.description || "",
    // ids for editing
    projectManagerId: proj.projectManager?._id    || "",
    projectTypeId:    proj.projectType?._id        || "",
    departmentIds:    proj.departments?.map((d) => d._id || d) || [],
    assigneeIds:      proj.assignees?.map((a) => a._id   || a) || [],
  }));

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit"                     },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  const handleMenuAction = async (action, row) => {
    if (action === "view") {
      navigate(`/projects/${row.id}`, { state: { project: row } });
    }

    if (action === "edit") {
      setEditingProject(row);
      setOpenModal(true);
    }

    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Project?",
        description: `"${row.projectName}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteProject(row.id);
          if (result.success) {
            setSuccessMsg(result.message);
            setShowSuccess(true);
          } else {
            setApiError(result.message);
          }
        },
      });
    }
  };

  const handleSave = async (formData) => {
    // ── Build clean payload for backend ──────────────────────────────────
  const payload = {
      projectName:    formData.projectName,
      clientName:     formData.clientName,
      description:    formData.description    || "",
      projectManager: formData.projectManager || null,
      projectType:    formData.projectType    || null,
      startDate:      formData.startDate      || null,
      endDate:        formData.endDate        || null,
      status:         formData.status         || "planning",
      budget:         formData.budget         ? Number(formData.budget) : 0,
    };

  let result;
  if (editingProject) {
    result = await updateProject(editingProject.id, payload);
  } else {
    result = await createProject(payload);
  }

    if (result.success) {
    setSuccessMsg(result.message);
    setShowSuccess(true);
    setOpenModal(false);
    setEditingProject(null);
    setApiError("");
  } else {
    setApiError(result.message);
  }
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Projects" subtitle="Manage all company projects" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton
              btnLabel="+ Add Project Type"
              handlePressBtn={() => setTypeModalOpen(true)}
              variant="outlined"
            />
            <CustomButton
              btnLabel="+ Add New Project"
              handlePressBtn={() => { setEditingProject(null); setOpenModal(true); }}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      {/* API error banner */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

        <Filter
        mode="projects"
        projectTypes={projectTypes}  
        managers={managers}          
        onFilterChange={(f) => {
          handleFilterChange({
            search:        f.search        || "",
            status:        f.status        || "",
            projectType:   f.projectType   || "",
            manager:       f.manager       || "",
            dueDateFilter: f.dueDateFilter || "",
            dueDateFrom:   f.dueDateFrom   || "",
            dueDateTo:     f.dueDateTo     || "",
          });
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
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          totalCount={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          projectTypes={projectTypes}
        />
      </Box>

      {/* Add Project Type */}
      <AddProjectType
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onSave={() => fetchProjectTypes()}
      />

      {/* Add / Edit Project */}
    <AddProject
      open={openModal}
      onClose={() => { setOpenModal(false); setEditingProject(null); setApiError(""); }}
      onSave={handleSave}
      editingProject={editingProject}
      loading={actionLoading}
      apiError={apiError}
      projectTypeOptions={projectTypes}
      managerOptions={managers}
    />

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default Projects;