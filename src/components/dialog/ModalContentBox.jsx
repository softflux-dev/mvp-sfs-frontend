import React from "react";
import { Box } from "@mui/material";

const ModalContentBox = ({ children }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#F5F5F5",
        borderRadius: "16px",
        padding: "16px",
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default ModalContentBox;
