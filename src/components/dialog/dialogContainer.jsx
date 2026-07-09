import { Dialog, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled component ko function ke bahar rakho
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    // padding: "10px",
    transition: "all 0.3s ease",
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
}));

const DialogContainer = ({
  children,
  open,
  onClose,
  maxWidth = "600px",
  height,
  TransitionComponent = Fade,
  TransitionProps = { timeout: 300 },
  ...props
}) => {
  // Only allow closing via explicit close/cancel buttons (which call
  // onClose() directly, with no reason). Ignore backdropClick so the
  // dialog doesn't dismiss when clicking outside it.
  const handleClose = (event, reason) => {
    if (reason === "backdropClick") return;
    onClose?.(event, reason);
  };

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      TransitionProps={TransitionProps}
      {...props}
      sx={{
        "& .MuiPaper-root": {
          maxWidth: maxWidth,
          width: maxWidth,
          height: height
        },
        "& .MuiModal-root-MuiDialog-root": {
          borderRadius: "50px"
        }
      }}
    >
      {children}
    </BootstrapDialog>
  );
};

export default DialogContainer;