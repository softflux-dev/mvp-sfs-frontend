// components/cards/bugCard.jsx
import { useState, useRef } from "react";
import { Box, Typography, IconButton, Menu, MenuItem, Chip } from "@mui/material";
import { MoreVertical } from "lucide-react";
import ConfirmationDialog from "../popups/confirmation";
import SuccessPopup       from "../popups/confirmationDialog";

const BUG_STATUS_CONFIG = {
  open:        { label: "Open",        bg: "#DBEAFE",   color: "#2563EB" },
  in_progress: { label: "In Progress", bg: "#FEF3C7",   color: "#D97706" },
  resolved:    { label: "Resolved",    bg: "#04C3731A", color: "#04C373" },
  closed:      { label: "Closed",      bg: "#F5F5F5",   color: "#757575" },
  rework:      { label: "Rework",      bg: "#F3E8FF",   color: "#7C3AED" },
};

const BUG_SEVERITY_CONFIG = {
  low:      { label: "Low",      bg: "#DBEAFE", color: "#2563EB" },
  medium:   { label: "Medium",   bg: "#FEF3C7", color: "#D97706" },
  high:     { label: "High",     bg: "#FECACA", color: "#DC2626" },
  critical: { label: "Critical", bg: "#FCE7F3", color: "#BE185D" },
};

const BugCard = ({ bug = {}, onView, onEdit, onDelete }) => {
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const open = Boolean(anchorEl);
  const confirmDialogRef = useRef();

  const handleOpen  = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = ()  => setAnchorEl(null);
  const handleView   = () => { handleClose(); onView?.(bug); };
  const handleEdit   = () => { handleClose(); onEdit?.(bug); };
  const handleDelete = () => {
    handleClose();
    confirmDialogRef.current?.open({
      title:       "Confirmation !",
      description: "Are you sure you want to Delete this ?",
      confirmText: "Yes",
      cancelText:  "Cancel",
      onConfirm:   () => { onDelete?.(bug); setDeleteSuccess(true); },
    });
  };

  const previewSrc = bug.screenshot
    || (Array.isArray(bug.screenshots) && bug.screenshots.length > 0
        ? (typeof bug.screenshots[0] === "string" ? bug.screenshots[0] : bug.screenshots[0]?.url)
        : null);

  const statusCfg   = BUG_STATUS_CONFIG[bug.status]     || { label: bug.status,   bg: "#F5F5F5", color: "#757575" };
  const severityCfg = BUG_SEVERITY_CONFIG[bug.severity] || { label: bug.severity, bg: "#F5F5F5", color: "#757575" };

  return (
    <>
      <Box sx={{ backgroundColor: "#F8F8F8", borderRadius: "12px", border: "1px solid #F0F0F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* ── Header row ── */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" px={1.5} pt={1.5} pb={1}>
          <Box flex={1} minWidth={0} pr={1}>
            <Typography fontSize="11px" fontWeight={700} color="#AA2493" mb={0.3} sx={{ letterSpacing: "0.2px", fontFamily: "monospace" }}>
              {bug.tcId || bug._id || bug.id}
            </Typography>
            <Typography fontSize="13px" fontWeight={600} color="text.primary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bug.title}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="row" alignItems="center" flexShrink={0} gap={0.75}>
            {bug.severity && (
              <Chip
                label={severityCfg.label}
                size="small"
                sx={{
                  height: "20px", fontSize: "10px", fontWeight: 600,
                  px: 0.5, borderRadius: "6px",
                  backgroundColor: severityCfg.bg, color: severityCfg.color,
                }}
              />
            )}
            {bug.status && (
              <Chip
                label={statusCfg.label}
                size="small"
                sx={{
                  height: "20px", fontSize: "10px", fontWeight: 600,
                  px: 0.5, borderRadius: "6px",
                  backgroundColor: statusCfg.bg, color: statusCfg.color,
                }}
              />
            )}
            <IconButton size="small" onClick={handleOpen} sx={{ color: "#67768B", p: "2px" }}>
              <MoreVertical size={16} />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top",    horizontal: "right" }}
            PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", minWidth: 110, mt: 0.5 } }}
          >
            <MenuItem onClick={handleView}   sx={{ fontSize: "13px", fontWeight: 500 }}>View</MenuItem>
            <MenuItem onClick={handleEdit}   sx={{ fontSize: "13px", fontWeight: 500 }}>Edit</MenuItem>
            <MenuItem onClick={handleDelete} sx={{ fontSize: "13px", fontWeight: 500, color: "#FF0000" }}>Delete</MenuItem>
          </Menu>
        </Box>

        {/* ── Screenshot preview ── */}
        {previewSrc ? (
          <Box
            component="img"
            src={previewSrc}
            alt={bug.title}
            sx={{ width: "100%", height: 300, objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: 120, backgroundColor: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #F0F0F0" }}>
            <Typography fontSize="12px" color="text.secondary">No screenshot attached</Typography>
          </Box>
        )}
      </Box>

      <ConfirmationDialog ref={confirmDialogRef} />
      <SuccessPopup open={deleteSuccess} onClose={() => setDeleteSuccess(false)} message="Successfully Deleted." autoClose autoCloseDelay={2000} />
    </>
  );
};

export default BugCard;