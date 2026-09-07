import { useState, useEffect } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText   from "../../../components/headerText";
import Filter       from "../../../components/filterBar/filter";
import ProjectCard  from "../../../components/cards/projectCard";
import { getPMProjectsApi } from "../../../api/modules/project";

const MyProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [filters,  setFilters]  = useState({});

  // ── Fetch PM's assigned projects ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError("");
    getPMProjectsApi({ limit: 100 })
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setProjects(res.data.data.projects || []);
        } else {
          setError(res?.data?.message || "Failed to fetch projects.");
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  // ── Client-side filter (search + status) ─────────────────────────────────
  const filtered = projects.filter((p) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";
    const matchSearch = !search || p.projectName?.toLowerCase().includes(search);
    const matchStatus = !status || p.status?.toLowerCase() === status;
    return matchSearch && matchStatus;
  });

  
   // ── Normalize API shape → ProjectCard props ───────────────────────────────
  const toCardProps = (p) => ({
    id:          p._id,
    projectName: p.projectName,
    status:      p.status
      ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
      : "Planning",
    progress:    p.progress   ?? 0,
    dueDate:     p.endDate
      ? new Date(p.endDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    taskCount:   p.totalTasks ?? 0,
    members:     (p.assignees || [])
      .filter((a) => a && a._id)
      .map((a) => a.avatar || ""),
  });

  // ── Build full navigation state ───────────────────────────────────────────
  const toNavState = (p) => ({
    id:             p._id,
    projectName:    p.projectName,
    projectManager: p.projectManager?.fullName || "—",
    status:         p.status
      ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
      : "—",
    progress:       p.progress    ?? 0,
    startDate:      p.startDate
      ? new Date(p.startDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    endDate:        p.endDate
      ? new Date(p.endDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    description:    p.description    || "",
    totalTasks:     p.totalTasks     ?? 0,
    completedTasks: p.completedTasks ?? 0,
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="My Projects"
            subtitle="Manage and track your assigned projects"
          />
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="pm_projects" onFilterChange={setFilters} />

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <Box mt={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Typography fontSize={14} color="text.secondary">
            {projects.length === 0
              ? "No projects assigned to you yet."
              : "No projects match your search."}
          </Typography>
        </Box>
      ) : (
        /* ── Cards grid ──────────────────────────────────────────────── */
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filtered.map((project) => {
            const cardProps  = toCardProps(project);
            const navState   = toNavState(project);
            return (
              <Grid key={cardProps.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProjectCard
                  {...cardProps}
                  onViewDetails={() =>
                    navigate(`/pm-projects/${cardProps.id}`, {
                      state: { project: navState },
                    })
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default MyProjects;