import React from "react";
import { Box, Stack, Typography, Chip, Grid, IconButton } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/GppBad";
import WarningIcon from "@mui/icons-material/WarningAmber";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// 🔹 STATUS CONFIG (colors, icons, labels)
const STATUS_CONFIG = {
  lockedOut: {
    label: "Lockout",
    bg: "#FDECEC",
    icon: <LockIcon sx={{ color: "#E53935" }} />,
    chipColor: "error",
  },
  restricted: {
    label: "Restricted",
    bg: "#FFF1DB",
    icon: <ShieldIcon sx={{ color: "#FB8C00" }} />,
    chipColor: "warning",
  },
  warning2: {
    label: "2nd Warning",
    bg: "#FFF7CC",
    icon: <WarningIcon sx={{ color: "#FBC02D" }} />,
    chipColor: "default",
  },
  warning1: {
    label: "1st Warning",
    bg: "#FFFBD6",
    icon: <NotificationsIcon sx={{ color: "#FDD835" }} />,
    chipColor: "default",
  },
};



// 🔹 CARD COMPONENT
const AlertCard = ({ data }) => {
  const cfg = STATUS_CONFIG[data.status];

  return (
    <Box
      sx={{
        backgroundColor: cfg.bg,
        borderRadius: 3,
        px: 2,
        py: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cfg.icon}
          </Box>

          <Box display="flex" flexDirection="column" gap={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={600} fontSize="12px">{data.name}</Typography>
              <Chip size="small" label={cfg.label} color={cfg.chipColor} sx={{
                fontSize: "10px",
              }} />
            </Stack>
            <Typography variant="body2" fontSize="11px" color="text.secondary">
              {data.roll} • {data.batch} • {data.subject}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box textAlign="right">
            <Typography fontWeight={600} fontSize="14px" color="error">
              {data.percent}%
            </Typography>
            <Typography variant="caption" fontSize="11px" color="text.secondary">
              {data.time}
            </Typography>
          </Box>
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AlertCard;