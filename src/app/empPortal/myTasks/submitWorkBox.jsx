import { useState, useRef, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton    from "../../../components/customButton";
import SubmitWorkDialog from "./submitWorkDialog";
import ViewWorkDialog   from "./viewWorkDialog";
import { submitWorkApi, getSubmissionsApi, downloadSubmissionUrl } from "../../../api/modules/task";
import fileIcon from "../../../assets/icons/file-icon.svg";

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

const GRID_THRESHOLD = 3;

const FileGridTile = ({ file, xs }) => (
  <Grid item size={{ xs }}>
    <Box sx={{
      backgroundColor: "#fff", borderRadius: "12px",
      p: 1.5, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 0.8,
      minHeight: xs === 4 ? "100px" : "97px",
    }}>
      <Box sx={{
        width: 36, height: 36, backgroundColor: "#F5F5F5",
        borderRadius: "8px", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <img src={fileIcon} alt="file" style={{ width: 18, height: 18 }} />
      </Box>
      <Box textAlign="center">
        <Typography fontSize="11px" fontWeight={600} color="text.primary"
          noWrap sx={{ maxWidth: xs === 4 ? "80px" : "100px" }}>
          {file.title || file.name || "submission"}
        </Typography>
        <Typography fontSize="10px" color="text.secondary">
          {file.fileSize || file.size || ""}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

/**
 * SubmitWorkBox
 *
 * Props:
 *   taskId — the task's _id / id string; required for API calls
 */
const SubmitWorkBox = ({ taskId }) => {
  const [submissions,    setSubmissions]    = useState([]);
  const [loadingFetch,   setLoadingFetch]   = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
 
  useEffect(() => {
  if (!taskId) return;
  setLoadingFetch(true);
  getSubmissionsApi(taskId)
    .then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setSubmissions(res.data.data.submissions || []);
      }
    })
    .catch(() => {})
    .finally(() => setLoadingFetch(false));
}, [taskId]);

  // Lazy-fetch submissions when "View All Work" is clicked
const handleViewAll = async () => {
  setViewDialogOpen(true);
};

  const handleSubmit = async (formData) => {
    if (!taskId) return;
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append("title",       formData.title       || "");
      fd.append("description", formData.description || "");
      fd.append("link",        formData.link        || "");
      if (formData.attachments) fd.append("file", formData.attachments);

      const res = await submitWorkApi(taskId, fd);
      if (res?.status === 200 || res?.status === 201) {
        const newSub = res.data.data.submission;
        setSubmissions((prev) => [newSub, ...prev]);
        setFetched(true);
      }
    } catch { /* handled by dialog */ }
    finally { setSubmitLoading(false); }
  };

  const use2x2       = submissions.length > GRID_THRESHOLD;
  const xs           = use2x2 ? 6 : 4;
  const visibleItems = submissions.slice(0, 3);
  const remaining    = use2x2 ? submissions.length - 3 : 0;

  return (
    <>
      <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>

        <CustomButton
          btnLabel="Submit Work"
          variant="gradient"
          handlePressBtn={() => setDialogOpen(true)}
          sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%", mb: 2.5 }}
        />

        {/* All Work header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} mt={3}>
          <Typography fontSize="15px" fontWeight={700} color="text.primary">All Work</Typography>
          <GradientLink onClick={handleViewAll}>View All Work</GradientLink>
        </Box>

        {/* Grid */}
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}>
          {submissions.length === 0 ? (
            <Typography fontSize="13px" color="text.secondary" textAlign="center" py={2}>
              No submissions yet.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {visibleItems.map((file) => (
                <FileGridTile key={file._id || file.id} file={file} xs={xs} />
              ))}

             {/* View More tile */}
              {use2x2 && remaining > 0 && (
                <Grid item size={{ xs: 6 }}>
                  <Box
                    onClick={handleViewAll}
                    sx={{
                      position: "relative", borderRadius: "12px",
                      overflow: "hidden", minHeight: "97px", cursor: "pointer",
                    }}
                  >
                    <Box sx={{
                      position: "absolute", inset: 0,
                      backgroundColor: "#fff", borderRadius: "12px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 0.8, p: 1.5,
                    }}>
                      <Box sx={{ width: 36, height: 36, backgroundColor: "#F5F5F5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={fileIcon} alt="file" style={{ width: 18, height: 18 }} />
                      </Box>
                    </Box>
                    <Box sx={{
                      position: "absolute", inset: 0, borderRadius: "12px",
                      backgroundColor: "rgba(0,0,0,0.15)",
                      backdropFilter: "blur(4px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      px: 1,
                    }}>
                      <Typography
                        fontSize={{ xs: "11px", sm: "13px" }}
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                          background: "linear-gradient(90deg, #AA2493, #022179)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          lineHeight: 1.3,
                        }}
                      >
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

      <SubmitWorkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSubmit}
        loading={submitLoading}
      />
      <ViewWorkDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        submissions={submissions}
        loading={loadingFetch}
        taskId={taskId}
      />
    </>
  );
};

export default SubmitWorkBox;