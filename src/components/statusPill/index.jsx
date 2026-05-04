// components/statusPill/StatusPill.jsx

import React from "react";
import { Box, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const STATUS_CONFIG = {
  submitted: { label: "Submitted", color: "#2BA85F", bg: "#E8F7EF" },
  late:      { label: "Late",      color: "#F97316", bg: "#FFF0E6" },
  absent:    { label: "Absent",    color: "#EF4444", bg: "#FEE2E2" },
  excused:   { label: "Excused",   color: "#8B5CF6", bg: "#EDE9FE" },
};

const StatusPill = ({ value, rowId, onStatusChange, statuses }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.submitted;

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          px: "14px",
          py: "6px",
          borderRadius: "20px",
          bgcolor: cfg.bg,
          color: cfg.color,
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { opacity: 0.85 },
        }}
      >
        {cfg.label}
        <KeyboardArrowDownIcon sx={{ fontSize: "16px", color: cfg.color }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: "12px", mt: 0.5 } }}
      >
        {statuses?.map((s) => {
          const c = STATUS_CONFIG[s.value];
          return (
            <MenuItem
              key={s.value}
              onClick={() => {
                onStatusChange && onStatusChange(rowId, s.value);
                setAnchorEl(null);
              }}
              sx={{ gap: 1 }}
            >
              <Box
                sx={{
                  px: "10px",
                  py: "3px",
                  borderRadius: "20px",
                  bgcolor: c?.bg,
                  color: c?.color,
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default StatusPill;