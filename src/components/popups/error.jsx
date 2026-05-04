import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Box, Typography } from "@mui/material";
import DialogContainer from "../dialog/dialogContainer";
import DialogBody from "../dialog/dialogBody";
import alertIcon from "../../assets/icons/success.svg";

const defaultDialogState = {
  open: false,
  title: "An error occurred.",
  subtitle: "",
  icon: alertIcon,
  maxWidth: "420px",
  autoCloseMs: 2000,
  onClose: undefined,
};

const ErrorDialog = forwardRef(({ defaultOptions = {} }, ref) => {
  const [dialogState, setDialogState] = useState(() => ({
    ...defaultDialogState,
    ...defaultOptions,
  }));

  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const close = useCallback(() => {
    clearTimer();
    setDialogState((prev) => ({ ...prev, open: false }));
    if (typeof dialogState.onClose === "function") {
      dialogState.onClose();
    }
  }, [clearTimer, dialogState.onClose]);

  const open = useCallback(
    (options = {}) => {
      const nextState = {
        ...defaultDialogState,
        ...defaultOptions,
        ...options,
        open: true,
      };
      setDialogState(nextState);

      clearTimer();
      if (typeof nextState.autoCloseMs === "number" && nextState.autoCloseMs > 0) {
        timerRef.current = setTimeout(close, nextState.autoCloseMs);
      }
    },
    [clearTimer, close, defaultOptions]
  );

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close]
  );

  return (
    <DialogContainer
      open={dialogState.open}
      onClose={close}
      maxWidth={dialogState.maxWidth}
    >
      <DialogBody
        sx={{ px: 2, py: 5 }}
        boxProps={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        {dialogState.icon && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width={88}
            height={88}
            borderRadius="24px"
            sx={{ backgroundColor: "#FFE6E6" }}
          >
            <img src={dialogState.icon} alt="error" width={40} height={40} />
          </Box>
        )}
        {dialogState.title && (
          <Typography fontSize={18} fontWeight={600} color="primary.text">
            {dialogState.title}
          </Typography>
        )}
        {dialogState.subtitle && (
          <Typography fontSize={11} color="primary.darkGray">
            {dialogState.subtitle}
          </Typography>
        )}
      </DialogBody>
    </DialogContainer>
  );
});

ErrorDialog.displayName = "ErrorDialog";

export default ErrorDialog;

