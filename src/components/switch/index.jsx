import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 54,
  height: 31,
  padding: 0,
  margin: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 4,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(23px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
        opacity: 1,
        border: 0,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#fff",
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#AA2493",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.5,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 23,
    height: 23,
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 31 / 2,
    backgroundColor: "rgba(131, 131, 131, 0.10)", // #838383 at 10% — OFF state from Figma
    border: "1px solid rgba(131, 131, 131, 0.25)",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 300,
    }),
  },
}));

export default function CustomSwitch({
  label,
  onChange,
  checked = false,
  showLabel = false,
}) {
  if (showLabel && label) {
    return (
      <FormControlLabel
        control={
          <IOSSwitch checked={checked} onChange={onChange} />
        }
        label={label}
        sx={{
          "& .MuiFormControlLabel-label": {
            fontSize: "14px",
            fontWeight: 500,
            color: checked ? "#AA2493" : "#67768B",
            fontFamily: '"Poppins", sans-serif',
            marginLeft: "8px",
            transition: "color 300ms",
          },
        }}
      />
    );
  }

  return <IOSSwitch checked={checked} onChange={onChange} />;
}