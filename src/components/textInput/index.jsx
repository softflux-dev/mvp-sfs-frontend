import { Box, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";

import CustomInputLabel from "../customInputLabel";
import { Eye, EyeClosed } from "lucide-react";

function TextInput({
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  InputStartIcon,
  type,
  InputEndIcon,
  id,
  fullWidth,
  multiline,
  rows,
  disabled,
  readonly,
  showPassIcon,
  handleClickEndIcon,
  showLabel,
  inputBgColor,
  onKeyDown,
  helperText,
  error,
  label,
  sx = {}, // 🟢 sx ko default empty object rakha
}) {
  const [showPass, setShowPass] = useState(false);
  const helperTextStyles = helperText
    ? {
        display: "block",
        marginLeft: 0,
        fontSize: "12px",
        marginTop: "4px",
        color: error ? "#d32f2f" : "#808080",
      }
    : {
        display: "none",
      };

  return (
    <>
      <Box textAlign={"left"}>
        {showLabel && <CustomInputLabel label={showLabel} />}
        <TextField
        autoComplete={type === "password" ? "new-password" : "off"}
          id={id}
          label={label}
          error={!!error}
          helperText={helperText}
          type={type === "password" && showPass ? "text" : type}
          variant="outlined"
          size="small"
          fullWidth={fullWidth ?? true}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          multiline={multiline ?? false}
          rows={rows}
          disabled={disabled ?? false}
          onWheel={(e) => e.target.blur()}
          fontFamily={"Poppins"}
          onKeyDown={onKeyDown}
          
          // Line 56-108 ke sx object ko replace karo:
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              background: inputBgColor ? inputBgColor : "#EFEFEF",
              border: "none",
              "& fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },

              "&.Mui-focused fieldset": {
                border: "none",
              },
            },

            "& .MuiInputBase-input": {
              padding:"13.5px 10px",
              fontSize: "14px",
              color: "#000000",
              "&::placeholder": {
                color: "#808080",
                opacity: 1,
              },
            },

            "& .MuiFormLabel-root": {
              display: "none",
            },

            "& .MuiFormHelperText-root": helperTextStyles,

            ...sx,
          }}
          InputProps={{
            readOnly: readonly ?? false,
            startAdornment: InputStartIcon && (
              <InputAdornment position="start">{InputStartIcon}</InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (showPassIcon) {
                    setShowPass(!showPass);
                  } else {
                    handleClickEndIcon && handleClickEndIcon();
                  }
                }}
              >
                {showPassIcon ? (
                  showPass ? (
                    <Eye color="#808080" />
                  ) : (
                    <EyeClosed color="#808080" />
                  )
                ) : (
                  InputEndIcon
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
}

export default TextInput;