import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Box, IconButton, Typography } from "@mui/material";
import DialogContainer from "../dialog/dialogContainer";
import DialogBody from "../dialog/dialogBody";
import closeIcon from "../../assets/icons/delete-icon.svg";
import CustomButton from "../customButton";

const defaultDialogState = {
  open: false,
  title: "Confirmation",
  secondaryHeading: "",
  description: "",
  icon: null,
  confirmText: "Yes",
  cancelText: "No",
  showConfirmBtn: true,
  showCancelBtn: true,
  onConfirm: undefined,
  onCancel: undefined,
  maxWidth: "420px",
};

const ConfirmationDialog = forwardRef(({ defaultOptions = {} }, ref) => {
  const [dialogState, setDialogState] = useState(() => ({
    ...defaultDialogState,
    ...defaultOptions,
  }));

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
      onConfirm: undefined,
      onCancel: undefined,
    }));
  }, []);

  const handleCancel = useCallback(() => {
    if (typeof dialogState.onCancel === "function") {
      dialogState.onCancel();
    }
    closeDialog();
  }, [dialogState.onCancel, closeDialog]);

  const handleConfirm = useCallback(() => {
    if (typeof dialogState.onConfirm === "function") {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState.onConfirm, closeDialog]);

  useImperativeHandle(
    ref,
    () => ({
      open: (options = {}) => {
        setDialogState({
          ...defaultDialogState,
          ...defaultOptions,
          ...options,
          open: true,
        });
      },
      close: () => {
        closeDialog();
      },
    }),
    [closeDialog, defaultOptions]
  );

  const hasBodyContent = useMemo(
    () => Boolean(dialogState.description),
    [dialogState.description]
  );

  return (
    <DialogContainer
      open={dialogState.open}
      onClose={handleCancel}
      maxWidth={dialogState.maxWidth}
    >
      {hasBodyContent && (
        <DialogBody boxProps={{ textAlign: "center" }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={4}
          >
            <IconButton
              sx={{
                backgroundColor: "primary.lightGray",
                borderRadius: "20%",
                p: 2,
              }}
            >
              <img
                src={dialogState.icon || closeIcon}
                alt="confirm-icon"
                style={{ width: "40px", height: "40px" }}
              />
            </IconButton>

            <Typography
              variant="primaryText"
              mt={4}
              textAlign="center"
              fontSize={24}
              fontWeight={600}
            >
              {dialogState.title}
            </Typography>

            <Typography
              variant="secondaryText"
              fontSize={12}
              mt={0.5}
              textAlign="center"
            >
              {dialogState.description}
            </Typography>
          </Box>
        </DialogBody>
      )}

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap={2}
        mb={4}
        mt={2}
      >
    {dialogState.showCancelBtn &&    <CustomButton
          btnLabel={dialogState.cancelText}
          handlePressBtn={handleCancel}
          variant="outlined"
          width="120px"
        />
}
        <CustomButton
          btnLabel={dialogState.confirmText}
          handlePressBtn={handleConfirm}
          variant="gradient"
          width="120px"
           isDisabled={dialogState.confirmDisabled} 
        />
      </Box>
    </DialogContainer>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";

export default ConfirmationDialog;
