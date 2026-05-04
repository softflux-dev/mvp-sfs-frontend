import { Button, CircularProgress } from "@mui/material";
import React from "react";

const CustomButton = ({
  btnLabel,
  handlePressBtn,
  btnBgColor,
  btnTextColor,
  btnHoverColor,
  btnTextTransform,
  endIcon,
  textWeight,
  borderColor,
  variant,
  width,
  height,
  btnTextSize,
  borderRadius,
  isBorder,
  sx,
  startIcon,
  disabled,
  loading,
  btnPadding,
}) => {
  const isVariant = Boolean(variant); // 👈 KEY LINE

  return (
    <Button
      sx={{
        borderColor: borderColor,
        border: isBorder,
        ...(width && { width }),
        ...(height && { height }),
        fontWeight: textWeight ?? 300,
        borderRadius,
        fontSize: btnTextSize ?? "14px",
        padding: btnPadding ?? "10px 15px",
        textTransform: btnTextTransform ?? "capitalize",
        opacity: disabled ? 0.5 : 1,

        // ✅ ONLY apply these when NO variant is used
        ...(isVariant
          ? {}
          : {
              backgroundColor: btnBgColor,
              color: btnTextColor,
              "&:hover": {
                backgroundColor: btnHoverColor,
                borderColor: borderColor,
              },
            }),

        "&.Mui-disabled": {
          color: isVariant ? undefined : btnTextColor ?? "#fff",
        },

        ...sx,
      }}
      onClick={handlePressBtn}
      endIcon={endIcon}
      startIcon={startIcon}
      variant={variant}
      disabled={disabled}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : btnLabel}
    </Button>
  );
};

export default CustomButton;
