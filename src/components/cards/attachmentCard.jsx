import { Box, Typography, IconButton } from "@mui/material";
import { Download } from "lucide-react";
import fileIcon from "../../assets/icons/file-icon.svg"; 
import downloadIcon from "../../assets/icons/download-icon-gray.svg";

const AttachmentCard = ({ fileName = "wireframe-v2.fig", fileSize = "installation-guide.pdf", onDownload,  bgColor = "#F5F5F5" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: bgColor, 
        borderRadius: "12px",
        px: 2, py: 1.5,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 36, height: 36,
            backgroundColor: "#fff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img src={fileIcon} alt="file" style={{ width: 18, height: 18 }} />
        </Box>
        <Box>
          <Typography fontSize="13px" fontWeight={600} color="text.primary">
            {fileName}
          </Typography>
          <Typography fontSize="11px" color="text.secondary">
            {fileSize}
          </Typography>
        </Box>
      </Box>

      

     <IconButton
        size="small"
        onClick={onDownload}
        sx={{
            color: "#67768B",
            backgroundColor: "#fff",
            height: 32,
            width: 32,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#E0E0E0" }
        }}
        >
        <img src={downloadIcon} alt="download" style={{ width: 16, height: 16 }} />
        </IconButton>
    </Box>
  );
};

export default AttachmentCard;