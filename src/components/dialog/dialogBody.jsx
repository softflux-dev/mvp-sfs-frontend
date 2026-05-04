import {
  Box,
  CircularProgress,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";

const DialogBody = ({
  children,
  isLoading = false,
  error = null,
  sx = {},
  boxProps,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <CircularProgress />
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Stack>
      );
    }

    return children;
  };

  return (
    <DialogContent sx={{ p: 3, maxHeight: "60vh", overflowY: "auto", ...sx }}>
      <Box
        borderRadius={3}
        {...boxProps}
      >
        {renderContent()}
      </Box>
    </DialogContent>
  );
};

export default DialogBody;