// SubmittedFileChip.jsx - reusable component
import { Box, Typography, IconButton } from "@mui/material";
import docIcon from "../../assets/icons/assignments-active.svg";      
import deleteIcon from "../../assets/icons/delete-pop-up-icon.svg"; 

const SubmittedFileChip = ({ fileName, onDelete }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "6px 10px",
        maxWidth: "220px",
      }}
    >
      <img src={docIcon} alt="doc" style={{ width: 16, height: 16, flexShrink: 0 }} />
      <Typography
        fontSize="12px"
        fontWeight={500}
        color="text.primary"
        noWrap
        sx={{ flex: 1 }}
      >
        {fileName}
      </Typography>
      <IconButton
        size="small"
        onClick={onDelete}
        sx={{ padding: "2px", flexShrink: 0 }}
      >
        <img src={deleteIcon} alt="delete" style={{ width: 16, height: 16 }} />
      </IconButton>
    </Box>
  );
};

export default SubmittedFileChip;