import { Box, TableBody, TableCell, TableRow } from "@mui/material";
import React, { useMemo } from "react";

const shimmerOverlayStyles = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 80%)",
  animation: "table-skeleton-shimmer 2.8s ease-in-out infinite",
};

const cellShellStyles = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "999px",
  backgroundColor: "rgba(213, 216, 220, 0.84)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(109, 127, 169, 0.12)",
};

export default function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <TableBody
      sx={{
        "& .MuiTableRow-root": {
          borderBottom: "1px solid #E5E7EB",
          "&:hover": { backgroundColor: "transparent" },
        },
        "& .MuiTableCell-root": {
          borderBottom: "1px solid #E5E7EB",
          padding: "16px",
          position: "relative",
        },
        "& .MuiTableCell-root:first-of-type": {
          paddingLeft: "18px",
          width: "48px",
        },
      }}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={`skeleton-row-${rowIndex}`}
          sx={{
            height: "56px", // Match normal table row height
          }}
        >
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
              <Box
                sx={{
                  ...cellShellStyles,
                  height: cellIndex === 0 ? "20px" : "20px", // Checkbox column slightly smaller
                  width:
                    cellIndex === 0
                      ? "20px"
                      : cellIndex === columns - 1
                      ? "24px"
                      : "78%", // Checkbox and actions smaller
                  mx: cellIndex === 0 || cellIndex === columns - 1 ? 0 : "auto",
                }}
              >
                <Box sx={shimmerOverlayStyles} />
              </Box>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

const shimmerKeyframes = `
@keyframes table-skeleton-shimmer {
  0% {
    transform: translateX(-120%);
  }
  50% {
    transform: translateX(110%);
  }
  100% {
    transform: translateX(110%);
  }
}
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("table-skeleton-style")
) {
  const style = document.createElement("style");
  style.id = "table-skeleton-style";
  style.innerHTML = shimmerKeyframes;
  document.head.appendChild(style);
}
