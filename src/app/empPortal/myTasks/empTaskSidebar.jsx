// empTaskSidebar.jsx
import { useState } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton  from "../../../components/customButton";
import CustomSelect  from "../../../components/customSelect";
import SuccessPopup  from "../../../components/popups/confirmationDialog";
import BugCard       from "../../../components/cards/bugCard";
import AddBugReport  from "./addBugReport";
import ViewBugReport from "./viewBugReport";
import bug1          from "../../../assets/images/bugImg.png";

// ── Status options ────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "new",          label: "New"          },
  { value: "in_progress",  label: "In Progress"  },
  { value: "under_review", label: "Under Review" },
  { value: "completed",    label: "Completed"    },
];

// ── Mock bug data — full fields so ViewBugReport renders completely ────────
const MOCK_BUGS = [
  {
    id:               "TC-A-SO01",
    tcId:             "TC-A-SO01",
    title:            "Login button unresponsive on mobile Safari",
    severity:         "high",
    status:           "open",
    description:      "When tapping the login button on iOS Safari, nothing happens. No network request is fired.",
    stepsToReproduce: "1. Open iOS Safari\n2. Navigate to login page\n3. Enter credentials\n4. Tap Login",
    expectedBehavior: "User should be logged in and redirected to dashboard.",
    actualBehavior:   "Button visually depresses but no action occurs.",
    environment:      "iOS 17.2, Safari",
    screenshots:      [bug1, bug1, bug1, bug1],
  },
  {
    id:               "TC-A-SO02",
    tcId:             "TC-A-SO02",
    title:            "Dashboard charts not loading on Firefox",
    severity:         "medium",
    status:           "in_progress",
    description:      "The analytics charts on the main dashboard fail to render on Firefox v121.",
    stepsToReproduce: "1. Open Firefox v121\n2. Log in\n3. Navigate to Dashboard",
    expectedBehavior: "Charts render with live data.",
    actualBehavior:   "Blank white boxes appear where charts should be.",
    environment:      "Firefox v121, Windows 10",
    screenshots:      [bug1, bug1],
  },
  {
    id:               "TC-A-SO03",
    tcId:             "TC-A-SO03",
    title:            "Profile image upload fails > 2MB",
    severity:         "low",
    status:           "resolved",
    description:      "Uploading a profile image larger than 2MB causes a silent failure with no error message shown.",
    stepsToReproduce: "1. Go to Profile Settings\n2. Click Upload Photo\n3. Select an image > 2MB",
    expectedBehavior: "Show a validation message: 'File too large. Max size is 2MB.'",
    actualBehavior:   "Upload spinner appears then disappears. No image is saved, no error shown.",
    environment:      "Chrome v120, macOS 14",
    screenshots:      [bug1],
  },
];

// ── Gradient "View All Bugs" link ─────────────────────────────────────────
const GradientLink = ({ children, onClick }) => (
  <Typography
    component="span"
    fontSize="13px"
    fontWeight={600}
    onClick={onClick}
    sx={{
      background:            "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
      WebkitBackgroundClip:  "text",
      WebkitTextFillColor:   "transparent",
      backgroundClip:        "text",
      cursor:                "pointer",
      userSelect:            "none",
      textDecoration:        "underline",
      textDecorationColor:   "#AA2493",
    }}
  >
    {children}
  </Typography>
);

// ── Sidebar ───────────────────────────────────────────────────────────────
const EmpTaskSidebar = ({ task = {}, onStatusUpdate, onViewAllBugs }) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusSuccess,  setStatusSuccess]  = useState(false);
  const [bugs,           setBugs]           = useState(MOCK_BUGS);

  const [bugDialogOpen,  setBugDialogOpen]  = useState(false);
  const [editingBug,     setEditingBug]     = useState(null);
  const [viewingBug,     setViewingBug]     = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const navigate = useNavigate();


  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    onStatusUpdate?.(selectedStatus);
    setStatusSuccess(true);
  };

  const handleAddBug  = ()    => { setEditingBug(null); setBugDialogOpen(true); };
  const handleEditBug = (bug) => { setEditingBug(bug);  setBugDialogOpen(true); };
  const handleViewBug = (bug) => { setViewingBug(bug);  setViewDialogOpen(true); };

  const handleDeleteBug = (bug) => {
    setBugs((prev) => prev.filter((b) => b.id !== bug.id));
  };

  const handleSaveBug = (data) => {
    console.log("Bug saved:", data);
    // TODO: call your API
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>

        {/* ── Update Status ──────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Update Status
          </Typography>
          <CustomSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth height="45px" inputBgColor="#F5F5F5" displayEmpty sx={{ mb: 2 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </CustomSelect>
          <CustomButton
            btnLabel="Update Status"
            variant="gradient"
            handlePressBtn={handleStatusUpdate}
            sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%" }}
          />
        </Box>

        {/* ── All Bugs ───────────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <CustomButton
            btnLabel="+ Add Bug Report"
            variant="gradient"
            handlePressBtn={handleAddBug}
            sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%", mb: 2.5 }}
          />

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} mt={3}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary">
              All Bugs
            </Typography>
            <GradientLink onClick={() => navigate("/employee/bugs", {
              state: {
                taskTitle:    task?.title    || "My Task",
                taskStatus:   task?.status   || "In Progress",
                projectName:  task?.project  || "Project Alpha",
                moduleName:   task?.module   || "",
                taskPriority: task?.priority || "Medium",
              }
            })}>
              View All Bugs
            </GradientLink>
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5}>
            {bugs.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                onView={handleViewBug}
                onEdit={handleEditBug}
                onDelete={handleDeleteBug}
              />
            ))}
          </Box>
        </Box>

      </Box>

      {/* ── Popups & dialogs ─────────────────────────────────────────────── */}
      <SuccessPopup
        open={statusSuccess}
        onClose={() => setStatusSuccess(false)}
        message="Status updated successfully"
        autoClose autoCloseDelay={2000}
      />

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

export default EmpTaskSidebar;