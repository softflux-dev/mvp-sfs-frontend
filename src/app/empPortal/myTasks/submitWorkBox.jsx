// components/cards/submitWorkBox.jsx
import { useState, useRef } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton from "../../../components/customButton";
import fileIcon from "../../../assets/icons/file-icon.svg";
import SubmitWorkDialog from "./submitWorkDialog";
import ViewWorkDialog from "./viewWorkDialog";



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

const MOCK_WORK_FILES = [
  { id: 1, name: "wireframe-v2.fig", size: "20 mb" },
  { id: 2, name: "wireframe-v2.fig", size: "20 mb" },
  { id: 3, name: "wireframe-v2.fig", size: "20 mb" },
  { id: 4, name: "wireframe-v2.fig", size: "20 mb" },
  { id: 5, name: "wireframe-v2.fig", size: "20 mb" },
];

// ── Logic:
// ≤3 files  → 3-col row (xs=4 each)
// >3 files  → 2×2 grid (xs=6 each), show 3 real + 1 "View More" tile
const GRID_THRESHOLD = 3;

const FileGridTile = ({ file, xs }) => (
  <Grid item size={{xs: xs}} key={file.id}>
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
          {file.name}
        </Typography>
        <Typography fontSize="10px" color="text.secondary">{file.size}</Typography>
      </Box>
    </Box>
  </Grid>
);

const SubmitWorkBox = ({ onViewAllWork }) => {
  const fileRef = useRef();
  const [files, setFiles] = useState(MOCK_WORK_FILES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const use2x2     = files.length > GRID_THRESHOLD;
  const xs         = use2x2 ? 6 : 4;
  const visibleFiles = use2x2 ? files.slice(0, 3) : files.slice(0, 3);
  const remaining    = use2x2 ? files.length - 3 : 0;

  return (
    <>
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
    

      <CustomButton
        btnLabel="Submit Work"
        variant="gradient"
        handlePressBtn={() => setDialogOpen(true)}
        sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%", mb: 2.5 }}
      />
      <input ref={fileRef} type="file" hidden multiple
        onChange={(e) => {
          const newFiles = Array.from(e.target.files).map((f, i) => ({
            id: Date.now() + i, name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(1)} mb`,
          }));
          setFiles((prev) => [...prev, ...newFiles]);
        }}
      />

      {/* All Work header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} mt={3}>
        <Typography fontSize="15px" fontWeight={700} color="text.primary">All Work</Typography>
        <GradientLink onClick={() => setViewDialogOpen(true)}>View All Work</GradientLink>
      </Box>

      {/* Grid */}
      <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 1.5 }}>
        <Grid container spacing={1}>

          {visibleFiles.map((file) => (
            <FileGridTile key={file.id} file={file} xs={xs} />
          ))}

          {/* View More tile — only in 2×2 mode */}
          {use2x2 && remaining > 0 && (
            <Grid item size={{xs:6}}>
              <Box
               onClick={() => setViewDialogOpen(true)}
                sx={{
                  position: "relative", borderRadius: "12px",
                  overflow: "hidden", minHeight: "97px", cursor: "pointer",
                }}
              >
                {/* blurred bg */}
                <Box sx={{
                  position: "absolute", inset: 0,
                  backgroundColor: "#fff", borderRadius: "12px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 0.8, p: 1.5,
                }}>
                  <Box sx={{ width: 36, height: 36, backgroundColor: "#F5F5F5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={fileIcon} alt="file" style={{ width: 18, height: 18 }} />
                  </Box>
                  <Typography fontSize="11px" fontWeight={600} noWrap sx={{ maxWidth: "80px" }}>
                    wireframe-v2.fig
                  </Typography>
                  <Typography fontSize="10px" color="text.secondary">20 mb</Typography>
                </Box>
                {/* blur + gradient text overlay */}
                <Box sx={{
                  position: "absolute", inset: 0, borderRadius: "12px",
                  backgroundColor: "rgba(0,0,0,0.15)",
                  backdropFilter: "blur(4px)",
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
      </Box>
    </Box>
    <SubmitWorkDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    onSave={(data) => console.log("Work submitted:", data)}
    taskTitle="Design CRM dashboard wireframes"
    />
    <ViewWorkDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        />
    </>
  );
};

export default SubmitWorkBox;