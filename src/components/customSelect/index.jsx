import {
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
} from "@mui/material";
import React from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({
  icon = null,
  placeholder = "Select",
  value,
  isDisabled = false,
  children,
  onChange,
  height,
  width,
  fullWidth,
  inputBgColor,
  getDisplayValue,
  helperText,
  error,
  sx = {},
  ...props
}) => {
  // Extract label from children based on current value
  const getSelectedLabel = () => {
    // If custom display value function is provided, use it
    if (getDisplayValue && typeof getDisplayValue === 'function') {
      return getDisplayValue(value) || placeholder;
    }

    const childArray = React.Children.toArray(children);
    const selectedChild = childArray.find(
      (child) => child?.props?.value === value
    );
    return selectedChild?.props?.children || placeholder;
  };

  return (
    <>
    <FormControl
      fullWidth={fullWidth}
      sx={{
        width: "100%",
        backgroundColor: inputBgColor ? inputBgColor : "#EFEFEF",
        borderRadius: "12px",
        padding: "2px 12px",
        border: "1px solid #fff",
        "& .MuiOutlinedInput-input": {
          color: "#374151",
          padding: "8px 12px",
        },
        "&:hover": { borderColor: "#9CA3AF" },
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
         ...sx,
      }}
    >
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        disabled={isDisabled}
        IconComponent={() => <ChevronDown size={18} color="#6B7280" />}
        startAdornment={
          icon && <InputAdornment position="start">{icon}</InputAdornment>
        }
        renderValue={() => (
          <Typography
            variant="body2"
            color={value ? "textPrimary" : "textSecondary"}
          >
            {getSelectedLabel()}
          </Typography>
        )}

        sx={{
          padding: "12px 12px",
          height: height ? height : "40px",
          width: "100%",
          minWidth: "100%",
          color: "#374151",
          "& .MuiOutlinedInput-input": {
            color: "#374151",
            padding: "0px 12px",
          },
          "& .MuiSelect-icon": {
            color: "primary.darkGray",
          },
          "& .Mui-disabled": {
            backgroundColor: "#F9FAFB",
            color: "#9CA3AF",
          },
        }}
        {...props}
      >
        <MenuItem value="" disabled={true}>
          <span style={{ color: "#000", fontSize: "13px" }}>
            {placeholder}
          </span>
        </MenuItem>
        {children}
      </Select>

      {/* Error helper text */}
    </FormControl>
    {error && <FormHelperText error>{helperText}</FormHelperText>}

    </>
  );
};

export default CustomSelect;
