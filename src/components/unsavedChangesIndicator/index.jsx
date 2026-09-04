// src/components/unsavedChangesIndicator.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Inline unsaved-changes indicator — shown next to the page/section header
 * instead of relying on a blocking "Stay on this Tab" dialog button.
 *   - dirty=true → amber pulsing dot + "Unsaved changes"
 *   - justSaved  → green dot + "All changes saved", self-clears after 2.5s
 */
const UnsavedChangesIndicator = ({ dirty, justSaved }) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (justSaved) {
      setShowSaved(true);
      const t = setTimeout(() => setShowSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [justSaved]);

  if (!dirty && !showSaved) return null;

  const isDirtyState = dirty && !showSaved;

  return (
    <Box display="flex" alignItems="center" gap={0.75}>
      <Box
        sx={{
          width: 7, height: 7, borderRadius: "50%",
          backgroundColor: isDirtyState ? "#F59E0B" : "#04C373",
          animation: isDirtyState ? "pulseDot 1.4s ease-in-out infinite" : "none",
          "@keyframes pulseDot": {
            "0%, 100%": { opacity: 1 },
            "50%":      { opacity: 0.35 },
          },
        }}
      />
      <Typography fontSize="12px" fontWeight={600}
        color={isDirtyState ? "#B45309" : "#04C373"}>
        {isDirtyState ? "Unsaved changes" : "All changes saved"}
      </Typography>
    </Box>
  );
};

export default UnsavedChangesIndicator;