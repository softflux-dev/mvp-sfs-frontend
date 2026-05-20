import { useState } from "react";
import { Box, Typography, IconButton, Grid, MenuItem, Chip } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import BugCard       from "../../../components/cards/bugCard";
import AddBugReport  from "./addBugReport";
import ViewBugReport from "./viewBugReport";
import CustomSelect  from "../../../components/customSelect";
import TextInput     from "../../../components/textInput";
import { useBugReports } from "../../../hooks/bugReport";
import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

const SEVERITY_OPTIONS = [
  { value: "all",      label: "All Severities" },
  { value: "low",      label: "Low"            },
  { value: "medium",   label: "Medium"         },
  { value: "high",     label: "High"           },
  { value: "critical", label: "Critical"       },
];

const STATUS_OPTIONS = [
  { value: "all",         label: "All Status"  },
  { value: "open",        label: "Open"        },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved"    },
  { value: "closed",      label: "Closed"      },
  { value: "rework",      label: "Rework"      },
];

const PRIORITY_CONFIG = {
  High:   { bg: "#FECACA", color: "#DC2626" },
  Medium: { bg: "#FEF3C7", color: "#D97706" },
  Low:    { bg: "#DBEAFE", color: "#2563EB" },
};

const TASK_STATUS_CONFIG = {
  "In Progress":  { bg: "#FEF3C7",   color: "#D97706" },
  "Completed":    { bg: "#04C3731A", color: "#04C373" },
  "New":          { bg: "#DBEAFE",   color: "#2563EB" },
  "Under Review": { bg: "#E9D5FF",   color: "#7C3AED" },
  "Assigned":     { bg: "#F5F5F5",   color: "#757575" },
};

const AllBugsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Task context passed from sidebar/navigation
  const taskId       = location.state?.taskId       || null;
  const taskTitle    = location.state?.taskTitle    || "Bug Reports";
  const taskStatus   = location.state?.taskStatus   || "In Progress";
  const projectName  = location.state?.projectName  || "";
  const moduleName   = location.state?.moduleName   || "";
  const taskPriority = location.state?.taskPriority || "Medium";

  const {
    bugs,
    loading,
    actionLoading,
    createBug,
    updateBug,
    deleteBug,
  } = useBugReports(taskId);

  const [search,         setSearch]         = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [bugDialogOpen,  setBugDialogOpen]  = useState(false);
  const [editingBug,     setEditingBug]     = useState(null);
  const [viewingBug,     setViewingBug]     = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleAddBug    = ()    => { setEditingBug(null); setBugDialogOpen(true); };
  const handleEditBug   = (bug) => { setEditingBug(bug);  setBugDialogOpen(true); };
  const handleViewBug   = (bug) => { setViewingBug(bug);  setViewDialogOpen(true); };
  const handleDeleteBug = async (bug) => {
    await deleteBug(bug._id || bug.id);
  };

  const handleSaveBug = async (data) => {
    if (editingBug) {
      await updateBug(editingBug._id || editingBug.id, data);
    } else {
      await createBug(data);
    }
  };

  // Client-side filter on top of server results
  const filtered = bugs.filter((b) => {
    const matchSearch   = !search || b.title.toLowerCase().includes(search.toLowerCase()) || (b._id || b.id || "").toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || b.severity === severityFilter;
    const matchStatus   = statusFilter   === "all" || b.status   === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const statusCfg   = TASK_STATUS_CONFIG[taskStatus]   || { bg: "#F5F5F5", color: "#757575" };
  const priorityCfg = PRIORITY_CONFIG[taskPriority]    || { bg: "#F5F5F5", color: "#757575" };

  return (
    <>
      <Box>

        {/* ── Back button ──────────────────────────────────────────────── */}
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <IconButton onClick={() => navigate(-1)} disableRipple sx={{ p: 0 }}>
            <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
          </IconButton>
          <Typography
            fontSize="14px" fontWeight={500} color="text.secondary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            Back to Task
          </Typography>
        </Box>

        {/* ── Task header ───────────────────────────────────────────────── */}
        <Box mb={3}>
          <Chip
            label={taskStatus}
            size="small"
            sx={{
              mb: 1, height: "24px", fontSize: "12px", fontWeight: 600,
              px: 1, borderRadius: "8px",
              backgroundColor: statusCfg.bg, color: statusCfg.color,
            }}
          />
          <Typography fontSize="26px" fontWeight={700} color="text.primary" lineHeight={1.3} mb={0.75}>
            {taskTitle}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography fontSize="13px" color="text.secondary" fontWeight={400}>
              {projectName}
            </Typography>
            {moduleName && (
              <>
                <Typography fontSize="13px" color="text.secondary">·</Typography>
                <Typography fontSize="13px" color="text.secondary" fontWeight={400}>
                  {moduleName}
                </Typography>
              </>
            )}
            {taskPriority && (
              <Chip
                label={taskPriority}
                size="small"
                sx={{
                  height: "22px", fontSize: "11px", fontWeight: 600,
                  px: 0.5, borderRadius: "8px",
                  backgroundColor: priorityCfg.bg, color: priorityCfg.color,
                }}
              />
            )}
          </Box>
        </Box>

        {/* ── White container with filters + grid ──────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "20px", p: 2.5 }}>

          {/* Filter row */}
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={2.5}>
            <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
              <TextInput
                placeholder="Search by title or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                inputBgColor="#F5F5F5"
                fullWidth
              />
            </Box>
            <Box sx={{ flex: "0 0 155px" }}>
              <CustomSelect
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                fullWidth height="45px" inputBgColor="#F5F5F5"
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>
            <Box sx={{ flex: "0 0 155px" }}>
              <CustomSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth height="45px" inputBgColor="#F5F5F5"
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </CustomSelect>
            </Box>
          </Box>

          {/* Bug cards grid */}
          {loading ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography fontSize="14px" color="text.secondary">Loading...</Typography>
            </Box>
          ) : filtered.length > 0 ? (
            <Grid container spacing={2}>
              {filtered.map((bug) => (
                <Grid key={bug._id || bug.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <BugCard
                    bug={bug}
                    onView={handleViewBug}
                    onEdit={handleEditBug}
                    onDelete={handleDeleteBug}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography fontSize="14px" color="text.secondary">
                No bug reports found.
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <AddBugReport
        open={bugDialogOpen}
        onClose={() => setBugDialogOpen(false)}
        onSave={handleSaveBug}
        editingBug={editingBug}
        loading={actionLoading}
      />
      <ViewBugReport
        open={viewDialogOpen}
        onClose={() => { setViewDialogOpen(false); setViewingBug(null); }}
        bug={viewingBug || {}}
      />
    </>
  );
};

export default AllBugsPage;