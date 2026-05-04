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
  return (
    <BootstrapDialog
      open={open}
      onClose={onClose}
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
