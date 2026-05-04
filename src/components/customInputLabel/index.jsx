import { InputLabel } from "@mui/material";
import React from "react";

function CustomInputLabel({ label }) {
  return (
    <InputLabel
      sx={{ fontFamily: "Poppins", mb: 1, color: "#000", fontWeight: 600 , fontSize: "12px" }}
    >
      {label}
    </InputLabel>
  );
}

export default CustomInputLabel;
