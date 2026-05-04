import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorIcon from "@mui/icons-material/Error";
import { useRef } from "react";

const DocumentRequestCard = ({ message, isFulfilled, onUpload, time }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  };

  return (
    <Box
      sx={{
        border: "1.5px solid #F97316",
        borderRadius: "12px",
        backgroundColor: "#FFFBF5",
        p: 2,
        width: { xs: "100%", sm: "320px" },
        maxWidth: "320px",
        boxSizing: "border-box",
      }}
    >
      <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />

      {/* Label */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1}>
        <ErrorIcon sx={{ fontSize: 16, color: "#F97316", flexShrink: 0 }} />
        <Typography
          fontSize={11}
          fontWeight={700}
          color="#F97316"
          letterSpacing={0.5}
          textTransform="uppercase"
        >
          {t("employeePortal.helpAndSupport.chat.documentRequest.label")}
        </Typography>
      </Box>

      {/* Dynamic message — word break so long text stays inside */}
      <Typography
        fontSize={13}
        color="text.primary"
        mb={1.5}
        sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
      >
        {message}
      </Typography>

      {/* Fulfilled */}
      {isFulfilled ? (
        <Box
          sx={{
            backgroundColor: "#E6FAF2",
            borderRadius: "8px",
            py: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <CheckIcon sx={{ fontSize: 14, color: "#04C373" }} />
          <Typography fontSize={13} fontWeight={600} color="#04C373">
            {t("employeePortal.helpAndSupport.chat.documentRequest.fulfilled")}
          </Typography>
        </Box>
      ) : (
        <Button
          variant="gradient"
          fullWidth
          startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
          onClick={handleButtonClick}
          sx={{ fontSize: 13, py: 1 }}
        >
          {t("employeePortal.helpAndSupport.chat.documentRequest.uploadDocument")}
        </Button>
      )}

      {/* Timestamp */}
      <Typography fontSize={11} color="#F97316" textAlign="right" mt={1}>
        {time}
      </Typography>
    </Box>
  );
};

export default DocumentRequestCard;