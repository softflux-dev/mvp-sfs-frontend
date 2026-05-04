import React from "react";
import { Box } from "@mui/material";

const FormRow = ({ children, gap = 16 }) => {
  const count = Array.isArray(children) ? children.length : 1;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr", // stack all items on mobile
          sm: `repeat(${count}, 1fr)`, // original behavior on sm+
        },
        gap: `${gap}px`,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
};

export default FormRow;
