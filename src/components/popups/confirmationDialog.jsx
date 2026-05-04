import React from "react";
import { Dialog, DialogContent, Box, Typography } from "@mui/material";
import completionIcon from "../../assets/icons/complete.svg";

const ConfirmationDialog = ({
  open,
  onClose,
  message = "Successfully Completed.",
  icon = null,
  autoClose = true,
  autoCloseDelay = 2000,
  iconBgColor = "#F5F5F5",
  iconSize = 30,
  iconContainerSize = 60,
}) => {
  // Auto close after specified delay
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, autoClose, autoCloseDelay]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: "60px 20px",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          {/* Icon Container */}
          <Box
            sx={{
              width: iconContainerSize,
              height: iconContainerSize,
              borderRadius: "10px",
              backgroundColor: iconBgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <img
              src={icon || completionIcon}
              alt="Confirmation"
              style={{ width: iconSize, height: iconSize }}
            />
          </Box>

          {/* Message */}
          <Typography variant="h6">
            {message}
          </Typography>
        </DialogContent>
      </Dialog>
      {/* <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message={confirmMessage}
        iconBgColor="#E6F7FF" // optional
        iconSize={30}
        iconContainerSize={60}
      /> */}
    </>

  );
};

export default ConfirmationDialog;
