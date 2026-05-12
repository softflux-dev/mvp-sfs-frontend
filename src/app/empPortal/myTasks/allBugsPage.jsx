// allBugsPage.jsx
import { useState } from "react";
import { Box, Typography, IconButton, Grid, MenuItem, Chip } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import BugCard       from "../../../components/cards/bugCard";
import AddBugReport  from "./addBugReport";
import ViewBugReport from "./viewBugReport";
import CustomSelect  from "../../../components/customSelect";
import TextInput     from "../../../components/textInput";
import CustomButton  from "../../../components/customButton";
import backIcon      from "../../../assets/icons/downlaod-back-btn.svg";
import bug1          from "../../../assets/images/bugImg.png";

// ── Mock data ─────────────────────────────────────────────────────────────
const ALL_BUGS_MOCK = [
  {
    id: "TC-A-SO01", tcId: "TC-A-SO01",
    title: "Login button unresponsive on mobile Safari",
    severity: "high", status: "open",
    description: "When tapping the login button on iOS Safari, nothing happens.",
    stepsToReproduce: "1. Open iOS Safari\n2. Navigate to login page\n3. Enter credentials\n4. Tap Login",
    expectedBehavior: "User should be logged in and redirected to dashboard.",
    actualBehavior: "Button visually depresses but no action occurs.",
    environment: "iOS 17.2, Safari",
    screenshots: [bug1, bug1, bug1, bug1],
  },
  {
    id: "TC-A-SO02", tcId: "TC-A-SO02",
    title: "Dashboard charts not loading on Firefox",
    severity: "medium", status: "in_progress",
    description: "The analytics charts on the main dashboard fail to render on Firefox v121.",
    stepsToReproduce: "1. Open Firefox v121\n2. Log in\n3. Navigate to Dashboard",
    expectedBehavior: "Charts render with live data.",
    actualBehavior: "Blank white boxes appear where charts should be.",
    environment: "Firefox v121, Windows 10",
    screenshots: [bug1, bug1],
  },
  {
    id: "TC-A-SO03", tcId: "TC-A-SO03",
    title: "Profile image upload fails > 2MB",
    severity: "low", status: "resolved",
    description: "Uploading a profile image larger than 2MB causes a silent failure.",
    stepsToReproduce: "1. Go to Profile Settings\n2. Click Upload Photo\n3. Select an image > 2MB",
    expectedBehavior: "Show a validation message: 'File too large. Max size is 2MB.'",
    actualBehavior: "Upload spinner appears then disappears. No image is saved.",
    environment: "Chrome v120, macOS 14",
    screenshots: [bug1],
  },
  {
    id: "TC-A-SO04", tcId: "TC-A-SO04",
    title: "Dropdown menu overlaps modal on small screens",
    severity: "medium", status: "open",
    description: "On screens < 768px, dropdown menus render behind open modals.",
    stepsToReproduce: "1. Open any modal\n2. Click a dropdown inside it\n3. Observe z-index issue",
    expectedBehavior: "Dropdown appears above modal.",
    actualBehavior: "Dropdown is hidden behind the modal backdrop.",
    environment: "Chrome v120, iPhone 14",
    screenshots: [bug1, bug1],
  },
  {
    id: "TC-A-SO05", tcId: "TC-A-SO05",
    title: "Export PDF button generates blank document",
    severity: "critical", status: "open",
    description: "Clicking Export PDF on the reports page generates an empty PDF file.",
    stepsToReproduce: "1. Go to Reports\n2. Apply any filter\n3. Click Export PDF",
    expectedBehavior: "PDF downloads with the filtered report data.",
    actualBehavior: "PDF opens/downloads but all pages are blank.",
    environment: "Chrome v121, Windows 11",
    screenshots: [bug1],
  },
  {
    id: "TC-A-SO06", tcId: "TC-A-SO06",
    title: "Search returns no results for valid queries",
    severity: "high", status: "in_progress",
    description: "The global search bar returns 'No results found' even for known existing records.",
    stepsToReproduce: "1. Click the search bar\n2. Type any employee name\n3. Observe results",
    expectedBehavior: "Matching results appear in the dropdown.",
    actualBehavior: "Empty state shown regardless of input.",
    environment: "All browsers, All OS",
    screenshots: [bug1, bug1],
  },
];

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
];

// ── Priority chip config ──────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High:   { bg: "#FECACA", color: "#DC2626" },
  Medium: { bg: "#FEF3C7", color: "#D97706" },
  Low:    { bg: "#DBEAFE", color: "#2563EB" },
};

// ── Task status chip config ───────────────────────────────────────────────
const TASK_STATUS_CONFIG = {
  "In Progress":  { bg: "#FEF3C7",   color: "#D97706" },
  "Completed":    { bg: "#04C3731A", color: "#04C373" },
  "New":          { bg: "#DBEAFE",   color: "#2563EB" },
  "Under Review": { bg: "#E9D5FF",   color: "#7C3AED" },
  "Assigned":     { bg: "#F5F5F5",   color: "#757575" },
};

// ── Page ──────────────────────────────────────────────────────────────────
const AllBugsPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Task context passed from sidebar/navigation
  const taskTitle    = location.state?.taskTitle    || "Login flow regression test";
  const taskStatus   = location.state?.taskStatus   || "In Progress";
  const projectName  = location.state?.projectName  || "Project Alpha";
  const moduleName   = location.state?.moduleName   || "Authentication";
  const taskPriority = location.state?.taskPriority || "Medium";

  const [bugs,           setBugs]           = useState(ALL_BUGS_MOCK);
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
  const handleDeleteBug = (bug) => setBugs((prev) => prev.filter((b) => b.id !== bug.id));
  const handleSaveBug   = (data) => console.log("Saved:", data);

  const filtered = bugs.filter((b) => {
    const matchSearch   = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
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
            Back to Projects
          </Typography>
        </Box>

        {/* ── Task header — matches figma ───────────────────────────────── */}
        <Box mb={3}>
          {/* Status chip */}
          <Chip
            label={taskStatus}
            size="small"
            sx={{
              mb: 1,
              height: "24px", fontSize: "12px", fontWeight: 600,
              px: 1, borderRadius: "8px",
              backgroundColor: statusCfg.bg, color: statusCfg.color,
            }}
          />

          {/* Task title */}
          <Typography fontSize="26px" fontWeight={700} color="text.primary" lineHeight={1.3} mb={0.75}>
            {taskTitle}
          </Typography>

          {/* Project · Module · Priority chip */}
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

          {/* Filter row + Add button */}
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
          {filtered.length > 0 ? (
            <Grid container spacing={2}>
              {filtered.map((bug) => (
                <Grid key={bug.id} size={{ xs: 12, sm: 6, md: 4 }}>
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