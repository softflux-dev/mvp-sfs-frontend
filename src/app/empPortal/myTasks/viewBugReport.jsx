// viewBugReport.jsx
import { useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { X } from "lucide-react";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";

// ── Config ────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  low:      { bg: "#DBEAFE",   color: "#2563EB" },
  medium:   { bg: "#FEF3C7",   color: "#D97706" },
  high:     { bg: "#FECACA",   color: "#DC2626" },
  critical: { bg: "#FF00001A", color: "#FF0000" },
};

const STATUS_CONFIG = {
  open:        { bg: "#04C3731A", color: "#04C373" },
  in_progress: { bg: "#FEF3C7",   color: "#D97706" },
  resolved:    { bg: "#DBEAFE",   color: "#2563EB" },
  closed:      { bg: "#F5F5F5",   color: "#9CA3AF" },
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ") : null;

const SectionLabel = ({ children }) => (
  <Typography fontSize="12px" fontWeight={500} color="text.secondary" mb={0.75}>
    {children}
  </Typography>
);

const SectionValue = ({ children }) => (
  <Typography fontSize="13px" fontWeight={500} color="text.primary" lineHeight={1.6}>
    {children || "—"}
  </Typography>
);

// ── Lightbox overlay ──────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <Box
      onClick={onClose}
      sx={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        backgroundColor: "rgba(0,0,0,0.85)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        p:               2,
      }}
    >
      {/* Close button */}
      <Box
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        sx={{
          position:        "absolute",
          top:             16,
          right:           16,
          width:           36,
          height:          36,
          borderRadius:    "50%",
          backgroundColor: "rgba(255,255,255,0.15)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          cursor:          "pointer",
          "&:hover":       { backgroundColor: "rgba(255,255,255,0.25)" },
        }}
      >
        <X size={20} color="#fff" />
      </Box>

      {/* Image — click on image itself doesn't close */}
      <Box
        component="img"
        src={src}
        alt="screenshot"
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxWidth:     "90vw",
          maxHeight:    "85vh",
          borderRadius: "12px",
          objectFit:    "contain",
          boxShadow:    "0 8px 40px rgba(0,0,0,0.6)",
        }}
      />
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const ViewBugReport = ({ open, onClose, bug = {} }) => {
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const severityKey = bug.severity?.toLowerCase();
  const statusKey   = bug.status?.toLowerCase()?.replace(/ /g, "_");
  const severityCfg = SEVERITY_CONFIG[severityKey] || { bg: "#F5F5F5", color: "#757575" };
  const statusCfg   = STATUS_CONFIG[statusKey]     || { bg: "#F5F5F5", color: "#757575" };

  const screenshots = (bug.screenshots || [])
    .map((s) => (typeof s === "string" ? s : s?.url))
    .filter(Boolean);

  return (
    <>
      <DialogContainer open={open} onClose={onClose} maxWidth="520px" fullWidth>
        <DialogHeader title="View Bug Report" onClose={onClose} />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* ── TC ID + chips + Title + Description ── */}
            <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5} flexWrap="wrap">
                <Typography fontSize="12px" fontWeight={600} color="text.secondary">
                  {bug.tcId || bug.id || "—"}
                </Typography>
                {capitalize(bug.status) && (
                  <Chip label={capitalize(bug.status)} size="small" sx={{ height: "22px", fontSize: "11px", fontWeight: 600, px: 0.5, borderRadius: "8px", backgroundColor: statusCfg.bg, color: statusCfg.color }} />
                )}
                {capitalize(bug.severity) && (
                  <Chip label={capitalize(bug.severity)} size="small" sx={{ height: "22px", fontSize: "11px", fontWeight: 600, px: 0.5, borderRadius: "8px", backgroundColor: severityCfg.bg, color: severityCfg.color }} />
                )}
              </Box>
              <Typography fontSize="14px" fontWeight={700} color="text.primary" lineHeight={1.5} mb={bug.description ? 1 : 0}>
                {bug.title || "—"}
              </Typography>
              {bug.description && (
                <Typography fontSize="13px" fontWeight={400} color="text.secondary" lineHeight={1.6}>
                  {bug.description}
                </Typography>
              )}
            </Box>

            {/* ── Steps + Expected ── */}
            {(bug.stepsToReproduce || bug.expectedBehavior) && (
              <Box sx={{ display: "flex", gap: 1.5, "& > *": { flex: 1, minWidth: 0 } }}>
                {bug.stepsToReproduce && (
                  <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                    <SectionLabel>Steps to Reproduce</SectionLabel>
                    <Typography fontSize="13px" fontWeight={400} color="text.primary" lineHeight={1.7} sx={{ whiteSpace: "pre-line" }}>
                      {bug.stepsToReproduce}
                    </Typography>
                  </Box>
                )}
                {bug.expectedBehavior && (
                  <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                    <SectionLabel>Expected Behavior</SectionLabel>
                    <SectionValue>{bug.expectedBehavior}</SectionValue>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Actual + Environment ── */}
            {(bug.actualBehavior || bug.environment) && (
              <Box sx={{ display: "flex", gap: 1.5, "& > *": { flex: 1, minWidth: 0 } }}>
                {bug.actualBehavior && (
                  <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                    <SectionLabel>Actual Behavior</SectionLabel>
                    <SectionValue>{bug.actualBehavior}</SectionValue>
                  </Box>
                )}
                {bug.environment && (
                  <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                    <SectionLabel>Environment</SectionLabel>
                    <SectionValue>{bug.environment}</SectionValue>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Screenshots grid — click opens lightbox ── */}
            {screenshots.length > 0 && (
              <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", p: 2 }}>
                <SectionLabel>Attachments</SectionLabel>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5, mt: 0.5 }}>
                  {screenshots.map((src, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={src}
                      alt={`screenshot-${idx}`}
                      onClick={() => setLightboxSrc(src)}
                      sx={{
                        width:          "100%",
                        height:         130,
                        objectFit:      "cover",
                        objectPosition: "top",
                        borderRadius:   "10px",
                        border:         "1px solid #E0E0E0",
                        display:        "block",
                        cursor:         "zoom-in",
                        transition:     "opacity 0.2s, transform 0.2s",
                        "&:hover":      { opacity: 0.85, transform: "scale(1.01)" },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

          </Box>
        </DialogBody>

        <DialogActionButtons onCancel={onClose} cancelText="Cancel" showConfirmBtn={false} />
      </DialogContainer>

      {/* ── Lightbox ── */}
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
};

export default ViewBugReport;