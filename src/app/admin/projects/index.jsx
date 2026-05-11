import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderText        from "../../../components/headerText";
import CustomButton      from "../../../components/customButton";
import Filter            from "../../../components/filterBar/filter";
import PaginatedTable    from "../../../components/dynamicTable";
import { MoreVerticalIcon } from "lucide-react";
import AddProject        from "./addProject";
import AddProjectType    from "./addProjectType";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";

// ── Shared initial project-type list (same defaults as AddProject) ─────────
const DEFAULT_PROJECT_TYPES = [
  { value: "development", label: "Development" },
  { value: "seo",         label: "SEO"         },
  { value: "retainer",    label: "Retainer"    },
  { value: "internal",    label: "Internal"    },
];

const mockProjects = [
  { id: 1,  projectName: "E-Commerce Platform",   client: "RetailCorp",   projectManager: "Sara Ahmed", projectType: "development", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",   progress: 87, budget: "2500000" },
  { id: 2,  projectName: "HR Management System",  client: "TechSolutions", projectManager: "Sara Ahmed", projectType: "internal",    startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",    progress: 87, budget: "180000"  },
  { id: 3,  projectName: "Mobile Banking App",    client: "FinanceFirst",  projectManager: "Sara Ahmed", projectType: "retainer",    startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Development", progress: 87, budget: "320000"  },
  { id: 4,  projectName: "Mobile Banking App",    client: "MediaGroup",    projectManager: "Sara Ahmed", projectType: "seo",         startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Testing",     progress: 87, budget: "95000"   },
  { id: 5,  projectName: "CMS Website Redesign",  client: "LogiTech",      projectManager: "Sara Ahmed", projectType: "development", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",    progress: 0,  budget: "45000"   },
  { id: 6,  projectName: "Inventory Tracker",     client: "RetailCorp",    projectManager: "Sara Ahmed", projectType: "internal",    startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Review",      progress: 0,  budget: "60000"   },
  { id: 7,  projectName: "HR Management System",  client: "TechSolutions", projectManager: "Sara Ahmed", projectType: "retainer",    startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",   progress: 87, budget: "210000"  },
  { id: 8,  projectName: "HR Management System",  client: "TechSolutions", projectManager: "Sara Ahmed", projectType: "seo",         startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Completed",   progress: 87, budget: "175000"  },
  { id: 9,  projectName: "Inventory Tracker",     client: "RetailCorp",    projectManager: "Sara Ahmed", projectType: "development", startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Review",      progress: 0,  budget: "52000"   },
  { id: 10, projectName: "CMS Website Redesign",  client: "LogiTech",      projectManager: "Sara Ahmed", projectType: "internal",    startDate: "Oct 1, 2025", endDate: "Jun 30, 2026", status: "Planning",    progress: 0,  budget: "38000"   },
];

const tableHeader = [
  { id: "projectName",    label: "Project Name"    },
  { id: "client",         label: "Client"          },
  { id: "projectManager", label: "Project Manager" },
  { id: "projectType",    label: "Project Type"    },
  { id: "startDate",      label: "Start Date"      },
  { id: "endDate",        label: "End Date"        },
  { id: "status",         label: "Status"          },
  { id: "progress",       label: "Progress"        },
  { id: "actions",        label: "Actions"         },
];

const displayRows = [
  "projectName",
  "client",
  "projectManager",
  "proj_type_label",   // ← new case added to PaginatedTable below
  "startDate",
  "endDate",
  "project_status",
  "project_progress",
  "actions_menu",
];

const Projects = () => {
  const navigate = useNavigate();

  // ── Shared project-type list — passed into AddProject so the dropdown ─────
  // stays in sync whenever new types are added from this page
  const [projectTypes,   setProjectTypes]   = useState(DEFAULT_PROJECT_TYPES);

  const [projects,       setProjects]       = useState(mockProjects);
  const [filters,        setFilters]        = useState({});
  const [openModal,      setOpenModal]      = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [typeModalOpen,  setTypeModalOpen]  = useState(false);
  const [deleteSuccess,  setDeleteSuccess]  = useState(false);

  const confirmDialogRef = useRef();

  // ── Add a newly created type into the shared list ─────────────────────────
  const handleSaveProjectType = (newType) => {
    setProjectTypes((prev) => {
      const exists = prev.some((t) => t.value === newType.value);
      return exists ? prev : [...prev, newType];
    });
  };

  const handleMenuAction = (action, row) => {
    if (action === "view")   navigate(`/projects/${row.id}`, { state: { project: row } });
    if (action === "edit")   { setEditingProject(row); setOpenModal(true); }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Confirmation !",
        description: "Are you sure you want to Delete this ?",
        confirmText: "Yes",
        cancelText:  "Cancel",
        onConfirm: () => {
          setProjects((prev) => prev.filter((p) => p.id !== row.id));
          setDeleteSuccess(true);
        },
      });
    }
  };

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit"                     },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText title="Projects" subtitle="Manage all company projects" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            {/* ── Add Project Type ───────────────────────────────────────── */}
            <CustomButton
              btnLabel="+ Add Project Type"
              handlePressBtn={() => setTypeModalOpen(true)}
              variant="outlined"
            />
            {/* ── Add New Project ────────────────────────────────────────── */}
            <CustomButton
              btnLabel="+ Add New Project"
              handlePressBtn={() => { setEditingProject(null); setOpenModal(true); }}
              variant="gradient"
            />
          </Box>
        </Grid>
      </Grid>

      <Filter mode="projects" onFilterChange={(f) => setFilters(f)} />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={projects}
          displayRows={displayRows}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
          // pass projectTypes so the table can resolve value → label
          projectTypes={projectTypes}
        />
      </Box>

      {/* ── Add / Edit Project ────────────────────────────────────────────── */}
      <AddProject
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingProject(null); }}
        onSave={(data) => console.log("Save:", data)}
        editingProject={editingProject}
        projectTypeOptions={projectTypes}   
      />

      {/* ── Add Project Type ──────────────────────────────────────────────── */}
      <AddProjectType
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onSave={handleSaveProjectType}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Successfully Deleted."
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default Projects;