import { Box, Typography } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import CustomButton from "../customButton";

const DownloadableReportCard = ({
  // Content
  title,
  description,
  
  // Action
  onGenerate,
  
  // Customization
  cardBorderRadius = "12px",
  buttonLabel = "Generate",
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        padding: "20px",
        boxShadow: "none",
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Title */}
      <Typography
        fontSize="16px"
        fontWeight={600}
        color="text.primary"
        mb={1}
        sx={{
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        mb={2}
        sx={{
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {description}
      </Typography>

      {/* Generate Button */}
      {onGenerate && (
        <CustomButton
          btnLabel={buttonLabel}
          handlePressBtn={onGenerate}
          variant="courseCard"
          startIcon={<FileDownload />}
        />
      )}
    </Box>
  );
};

export default DownloadableReportCard;