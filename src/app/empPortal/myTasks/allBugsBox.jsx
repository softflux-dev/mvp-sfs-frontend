// components/cards/allBugsBox.jsx
import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton  from "../../../components/customButton";
import AddBugReport  from "./addBugReport";
import ViewBugReport from "./viewBugReport";
import bug1          from "../../../assets/images/bugImg.png";

const GradientLink = ({ children, onClick }) => (
  <Typography
    component="span"
    fontSize="13px"
    fontWeight={600}
    onClick={onClick}
    sx={{
      background           : "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
      WebkitBackgroundClip : "text",
      WebkitTextFillColor  : "transparent",
      backgroundClip       : "text",
      cursor               : "pointer",
      userSelect           : "none",
      textDecoration       : "underline",
      textDecorationColor  : "#AA2493",
    }}
  >
    {children}
  </Typography>
);

const MOCK_BUGS = [
  { id: "TC-A-SO01", tcId: "TC-A-SO01", title: "Login button unresponsive on mobile Safari", severity: "high", status: "open", description: "When tapping the login button on iOS Safari, nothing happens.", stepsToReproduce: "1. Open iOS Safari\n2. Navigate to login\n3. Tap Login", expectedBehavior: "User redirected to dashboard.", actualBehavior: "Nothing occurs.", environment: "iOS 17.2, Safari", screenshots: [bug1, bug1] },
  { id: "TC-A-SO02", tcId: "TC-A-SO02", title: "Dashboard charts not loading on Firefox", severity: "medium", status: "in_progress", description: "Charts fail to render on Firefox v121.", stepsToReproduce: "1. Open Firefox\n2. Log in\n3. Go to Dashboard", expectedBehavior: "Charts render.", actualBehavior: "Blank boxes.", environment: "Firefox v121", screenshots: [bug1] },
  { id: "TC-A-SO03", tcId: "TC-A-SO03", title: "Profile image upload fails > 2MB", severity: "low", status: "resolved", description: "Silent failure on large uploads.", stepsToReproduce: "1. Go to Profile\n2. Upload photo > 2MB", expectedBehavior: "Validation message.", actualBehavior: "No error shown.", environment: "Chrome v120", screenshots: [bug1] },
  { id: "TC-A-SO04", tcId: "TC-A-SO04", title: "Logout does not clear session", severity: "high", status: "open", description: "Session persists after logout.", stepsToReproduce: "1. Log in\n2. Log out\n3. Navigate back", expectedBehavior: "Redirected to login.", actualBehavior: "Still logged in.", environment: "Chrome v120", screenshots: [bug1] },
];

const VISIBLE_COUNT = 3;

const BugGridTile = ({ bug, onClick }) => (
  <Box
    onClick={() => onClick(bug)}
    sx={{
      borderRadius: "12px",
      overflow: "hidden",
      minHeight: "97px",
      cursor: "pointer",
      backgroundColor: "#fff",
      "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    }}
  >
    <img
      src={bug.screenshots?.[0] || bug1}
      alt={bug.title}
      style={{ width: "100%", height: "97px", objectFit: "cover", display: "block" }}
    />
  </Box>
);

const AllBugsBox = ({ task = {}, onViewAllBugs }) => {
  const [bugs,           setBugs]           = useState(MOCK_BUGS);
  const [bugDialogOpen,  setBugDialogOpen]  = useState(false);
  const [editingBug,     setEditingBug]     = useState(null);
  const [viewingBug,     setViewingBug]     = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const visibleBugs = bugs.slice(0, VISIBLE_COUNT);
  const remaining   = bugs.length - VISIBLE_COUNT;

 const handleViewBug = () => onViewAllBugs();
 const handleSaveBug = (data) => { console.log("Bug saved:", data); };

  return (
    <>
      <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
        <CustomButton
          btnLabel="+ Add Bug Report"
          variant="gradient"
          handlePressBtn={() => { setEditingBug(null); setBugDialogOpen(true); }}
          sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%", mb: 2.5 }}
        />

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} mt={3}>
          <Typography fontSize="15px" fontWeight={700} color="text.primary">All Bugs</Typography>
          <GradientLink onClick={onViewAllBugs}>View All Bug</GradientLink>
        </Box>

        {/* 2×2 grid */}
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}>
          <Grid container spacing={1}>
            {visibleBugs.map((bug) => (
              <Grid item size={{xs: 6}} key={bug.id}>
                <BugGridTile bug={bug} onClick={handleViewBug} />
              </Grid>
            ))}

            {/* View More tile */}
            {remaining > 0 && (
              <Grid item size={{xs: 6}}>
                <Box
                  onClick={onViewAllBugs}
                  sx={{
                    position: "relative", borderRadius: "12px",
                    overflow: "hidden", minHeight: "97px", cursor: "pointer",
                  }}
                >
                  {/* blurred bg */}
                  <Box sx={{
                    position: "absolute", inset: 0,
                    backgroundColor: "#fff", borderRadius: "12px",
                    filter: "blur(4px)", opacity: 0.6,
                  }} />
                  {/* overlay */}
                  <Box sx={{
                    position: "absolute", inset: 0, borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography fontSize="13px" fontWeight={700}
                      sx={{ background: "linear-gradient(90deg, #AA2493, #022179)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      View More ({remaining}+)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

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

export default AllBugsBox;