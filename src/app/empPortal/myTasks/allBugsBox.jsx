import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton  from "../../../components/customButton";
import AddBugReport  from "./addBugReport";
import ViewBugReport from "./viewBugReport";
import { useBugReports } from "../../../hooks/bugReport";

const GradientLink = ({ children, onClick }) => (
  <Typography
    component="span"
    fontSize="13px"
    fontWeight={600}
    onClick={onClick}
    sx={{
      background:           "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor:  "transparent",
      backgroundClip:       "text",
      cursor:               "pointer",
      userSelect:           "none",
      textDecoration:       "underline",
      textDecorationColor:  "#AA2493",
    }}
  >
    {children}
  </Typography>
);

const VISIBLE_COUNT = 3;

const BugGridTile = ({ bug, onClick }) => (
  <Box
    onClick={() => onClick(bug)}
    sx={{
      borderRadius: "12px", overflow: "hidden",
      minHeight: "97px", cursor: "pointer",
      backgroundColor: "#fff", position: "relative",   // ← added position: relative
      "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    }}
  >
    {/* Ticket ID badge — top left */}
    {(bug.tcId || bug._id || bug.id) && (
      <Box
        sx={{
          position: "absolute", top: 6, left: 6, zIndex: 1,
          px: "6px", py: "2px", borderRadius: "6px",
          backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
        }}
      >
        <Typography fontSize="10px" fontWeight={600} color="#fff" sx={{ fontFamily: "monospace" }}>
          {bug.tcId || bug._id || bug.id}
        </Typography>
      </Box>
    )}

    {bug.screenshots?.[0]?.url ? (
      <img
        src={bug.screenshots[0].url}
        alt={bug.title}
        style={{ width: "100%", height: "97px", objectFit: "cover", display: "block" }}
      />
    ) : (
      <Box sx={{ width: "100%", height: "97px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography fontSize="11px" color="text.secondary">No image</Typography>
      </Box>
    )}
  </Box>
);

/**
 * AllBugsBox
 *
 * Props:
 *   task        — task object
 *   taskId      — task's _id / id string; required for API calls
 *   onViewAllBugs — navigate to full bugs page
 */
const AllBugsBox = ({ task = {}, taskId, onViewAllBugs }) => {
  const { bugs, loading, actionLoading, createBug, updateBug } = useBugReports(taskId);

  const [bugDialogOpen,  setBugDialogOpen]  = useState(false);
  const [editingBug,     setEditingBug]     = useState(null);
  const [viewingBug,     setViewingBug]     = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const visibleBugs = bugs.slice(0, VISIBLE_COUNT);
  const remaining   = bugs.length - VISIBLE_COUNT;

  const handleViewBug = (bug) => { setViewingBug(bug); setViewDialogOpen(true); };

  const handleSaveBug = async (data) => {
    if (editingBug) {
      await updateBug(editingBug._id || editingBug.id, data);
    } else {
      await createBug(data);
    }
  };

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
          <Box>
            <Typography fontSize="15px" fontWeight={700} color="text.primary">All Bugs</Typography>
            {task?.taskId && (
              <Typography fontSize="11px" fontWeight={600} color="#AA2493" sx={{ fontFamily: "monospace" }}>
                {task.taskId}
              </Typography>
            )}
          </Box>
          <GradientLink onClick={onViewAllBugs}>View All Bug</GradientLink>
        </Box>

        {/* Grid */}
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}>
          {bugs.length === 0 ? (
            <Typography fontSize="13px" color="text.secondary" textAlign="center" py={2}>
              {loading ? "Loading..." : "No bug reports yet."}
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {visibleBugs.map((bug) => (
                <Grid item size={{ xs: 6 }} key={bug._id || bug.id}>
                  <BugGridTile bug={bug} onClick={handleViewBug} />
                </Grid>
              ))}

              {/* View More tile */}
              {remaining > 0 && (
                <Grid item size={{ xs: 6 }}>
                  <Box
                    onClick={onViewAllBugs}
                    sx={{
                      position: "relative", borderRadius: "12px",
                      overflow: "hidden", minHeight: "97px", cursor: "pointer",
                    }}
                  >
                    <Box sx={{
                      position: "absolute", inset: 0, borderRadius: "12px",
                      backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(4px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Typography fontSize="13px" fontWeight={700} sx={{
                        background: "linear-gradient(90deg, #AA2493, #022179)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>
                        View More ({remaining}+)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Box>

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

export default AllBugsBox;