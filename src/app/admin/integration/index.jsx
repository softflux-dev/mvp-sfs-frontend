import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import AddEditIntegration from "./addEditIntegration";
import { MoreVerticalIcon } from "lucide-react";

const mockIntegrations = [
  { id: 1, no: 1, projectId: "PRJ-1001", projectName: "Frontend Web App",        gitUrl: "github.com/acmecorp/frontend-we", commits: 5, status: "Not Connected", provider: "GitHub",    repositoryUrl: "https://github.com/acmecorp/frontend-web"    },
  { id: 2, no: 2, projectId: "PRJ-1001", projectName: "Backend API Services",     gitUrl: "github.com/acmecorp/ios-app",     commits: 5, status: "Connected",     provider: "GitHub",    repositoryUrl: "https://github.com/acmecorp/backend-api"      },
  { id: 3, no: 3, projectId: "PRJ-1001", projectName: "iOS Mobile App",           gitUrl: "github.com/acmecorp/frontend-we", commits: 5, status: "Connected",     provider: "GitHub",    repositoryUrl: "https://github.com/acmecorp/ios-mobile"       },
  { id: 4, no: 4, projectId: "PRJ-1001", projectName: "Android Mobile App",       gitUrl: "github.com/acmecorp/ios-app",     commits: 5, status: "Connected",     provider: "GitHub",    repositoryUrl: "https://github.com/acmecorp/android-mobile"   },
  { id: 5, no: 5, projectId: "PRJ-1001", projectName: "Data Pipeline",            gitUrl: "github.com/acmecorp/frontend-we", commits: 5, status: "Not Connected", provider: "GitLab",    repositoryUrl: "https://gitlab.com/acmecorp/data-pipeline"    },
  { id: 6, no: 6, projectId: "PRJ-1001", projectName: "Internal Admin Dashboard", gitUrl: "github.com/acmecorp/frontend-we", commits: 5, status: "Connected",     provider: "GitHub",    repositoryUrl: "https://github.com/acmecorp/admin-dashboard"  },
  { id: 7, no: 7, projectId: "PRJ-1001", projectName: "Machine Learning Models",  gitUrl: "github.com/acmecorp/ios-app",     commits: 5, status: "Connected",     provider: "Bitbucket", repositoryUrl: "https://bitbucket.org/acmecorp/ml-models"     },
];

const tableHeader = [
  { id: "no",          label: "No#"          },
  { id: "projectId",   label: "Project ID"   },
  { id: "projectName", label: "Project Name" },
  { id: "gitUrl",      label: "Git URL"      },
  { id: "commits",     label: "Commits"      },
  { id: "status",      label: "Status"       },
  { id: "actions",     label: "Actions"      },
];

const displayRows = [
  "intg_no",
  "intg_project_id",
  "intg_project_name",
  "intg_git_url",
  "intg_commits",
  "intg_status",
  "actions_menu",
];

const menuOptions = (row) => [
  { value: "view",    label: "View"                    },
  { value: "edit",    label: "Edit"                    },
  { value: "connect", label: "Connect with Repository" },
];

const Integrations = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editingRow,   setEditingRow]   = useState(null); // null = Add mode, row = Edit mode
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  const confirmDialogRef = useRef();

  const openAdd     = ()    => { setEditingRow(null); setDialogOpen(true); };
  const openEdit    = (row) => { setEditingRow(row);  setDialogOpen(true); };
  const closeDialog = ()    => { setDialogOpen(false); setEditingRow(null); };

  const handleMenuAction = (action, row) => {
    if (action === "edit")    openEdit(row);
    if (action === "view")    navigate(`/integrations/${row.id}`, { state: { integration: row } });
    if (action === "connect") console.log("Connect:", row);
  };

  const handleSave = (data) => {
    if (editingRow) {
      // Edit mode — update existing row
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === editingRow.id
            ? { ...item, repositoryUrl: data.repositoryUrl, gitUrl: data.repositoryUrl.replace("https://", "").slice(0, 30) }
            : item
        )
      );
    } else {
      // Add mode — append new row
      setIntegrations((prev) => {
        const newId = prev.length + 1;
        return [
          ...prev,
          {
            id:            newId,
            no:            newId,
            projectId:     data.projectId,
            projectName:   data.projectName,
            gitUrl:        data.repositoryUrl.replace("https://", "").slice(0, 30),
            commits:       0,
            status:        "Not Connected",
            provider:      data.provider,
            repositoryUrl: data.repositoryUrl,
          },
        ];
      });
    }
    setSaveSuccess(true);
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="Code Repository Integration"
            subtitle="Connect GitHub or GitLab to track commits and link them to tasks"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="+ Add Integration"
              handlePressBtn={openAdd}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="integrations" onFilterChange={(f) => console.log(f)} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={integrations}
          displayRows={displayRows}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
        />
      </Box>

      {/* ── Add / Edit Integration dialog ───────────────────────────────── */}
      <AddEditIntegration
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        editingRow={editingRow}
      />

      {/* ── Success toast ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message={editingRow ? "Integration updated successfully" : "Integration added successfully"}
        autoClose
        autoCloseDelay={2000}
      />

      <ConfirmationDialog ref={confirmDialogRef} />
    </>
  );
};

export default Integrations;