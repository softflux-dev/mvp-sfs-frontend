import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CustomButton from "./../customButton";

const UploadBox = ({
  uploadIcon,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  selectedFiles = [],
  onRemoveFile,
  showFileList = true,
}) => {
  return (
    <Box>
      <Box
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        sx={{
          backgroundColor: "#FFFFFF",
          border: "2px dashed #00000033",
          borderRadius: "12px",
          padding: "28px 13px",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.3s ease",
          ...(dragActive && {
            borderColor: "#AA2493",
            backgroundColor: "#AA24930A",
          }),
        }}
      >
        <input
          type="file"
          multiple
          onChange={onFileSelect}
          accept=".pdf,.doc,.docx,image/*"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            zIndex: selectedFiles.length > 0 ? -1 : 1,
          }}
        />

        {/* Upload Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#E0E0E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          {uploadIcon ? (
            <img src={uploadIcon} alt="upload" width={24} height={24} />
          ) : (
            <Typography fontSize={24}>↑</Typography>
          )}
        </Box>

        {/* Label */}
        <Typography fontSize={14} mb={0.5}>
          Drag and drop or{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 500,
            }}
          >
            click to browse
          </Box>
        </Typography>

        <Typography fontSize={12} color="text.secondary">
          PDF, DOC, DOCX, Images
        </Typography>

        {/* Selected Files */}
        {showFileList && selectedFiles.length > 0 && (
          <Box mt={3} sx={{ position: "relative", zIndex: 2 }}>
            {selectedFiles.map((file, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  mb: 1,
                }}
              >
                <Typography fontSize={12} noWrap sx={{ flex: 1, textAlign: "left" }}>
                  📄 {file.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onRemoveFile(index)}
                  sx={{ color: "error.main", padding: "4px" }}
                >
                  ✕
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UploadBox;