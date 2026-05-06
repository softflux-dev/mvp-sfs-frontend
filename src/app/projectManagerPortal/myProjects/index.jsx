import { useState } from "react";
import { Box, Grid, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText   from "../../../components/headerText";
import CustomButton from "../../../components/customButton";
import Filter       from "../../../components/filterBar/filter";
import ProjectCard  from "../../../components/cards/projectCard";
import CreateProjectDialog from "./createProjectDialog";

const mockProjects = [
  { id: 1, projectName: "E-Commerce Platform", client: "RetailMax Inc.",    status: "In Progress", progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
  { id: 2, projectName: "Healthcare Portal",   client: "MedCare Solutions", status: "In Progress", progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
  { id: 3, projectName: "CRM Dashboard",       client: "SalesForward",      status: "Planning",    progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
  { id: 4, projectName: "E-Commerce Platform", client: "RetailMax Inc.",    status: "In Progress", progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
  { id: 5, projectName: "Healthcare Portal",   client: "MedCare Solutions", status: "On Hold",     progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
  { id: 6, projectName: "CRM Dashboard",       client: "SalesForward",      status: "Completed",   progress: 87, dueDate: "2026-04-15", taskCount: 34, members: [] },
];

const MyProjects = () => {
  const navigate   = useNavigate();
  const [filters, setFilters] = useState({});
  const [createOpen, setCreateOpen] = useState(false);


  const filteredProjects = mockProjects.filter((p) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";
    const matchSearch = !search || p.projectName.toLowerCase().includes(search);
    const matchStatus = !status || p.status.toLowerCase().replace(/ /g, "_") === status;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HeaderText
            title="My Projects"
            subtitle="Manage and track your assigned projects"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="flex-end">
           <CustomButton
            btnLabel="+ Create New Project"
            variant="gradient"
            handlePressBtn={() => setCreateOpen(true)}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="pm_projects" onFilterChange={setFilters} />

      {/* ── Cards grid ─────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {filteredProjects.map((project) => (
          <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ProjectCard
              {...project}
             
              onViewDetails={() => {
               
                navigate(`/pm-projects/${project.id}`, { state: { project } });
              }}
            />
          </Grid>
        ))}
      </Grid>
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={(data) => console.log("New project:", data)}
      />
    </>
  );
};

export default MyProjects;