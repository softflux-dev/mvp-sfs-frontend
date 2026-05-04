import { DialogActions } from "@mui/material";
import React from "react";
import CustomButton from "../customButton";

const DialogActionButtons = ({
  onConfirm,
  onCancel,
  showConfirmBtn = true,
  showCancelBtn = true,
  confirmText = "Save",
  cancelText = "Close",
  isConfirmBtnDisable = false,
  cancelBtnProps,
  confirmBtnProps,
  confirmLoading = false,
  showConfirmIcon = true,
}) => {
  return (
    <DialogActions
      sx={{
        padding: "16px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
      }}
    >
      {showCancelBtn && (
        <CustomButton
          variant="customGray"
          handlePressBtn={onCancel}
          btnLabel={cancelText}
          disabled={confirmLoading}
          loading={false}
          {...cancelBtnProps}
        />
      )}

      {showConfirmBtn && (
        <CustomButton
          variant="gradient"
          handlePressBtn={onConfirm}
          btnLabel={confirmText}
          disabled={isConfirmBtnDisable || confirmLoading}
          loading={confirmLoading}
          {...confirmBtnProps}
        />
      )}
    </DialogActions>
  );
};

export default DialogActionButtons;
