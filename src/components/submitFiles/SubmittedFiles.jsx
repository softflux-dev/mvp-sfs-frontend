import React from "react";
import { Box, Typography } from "@mui/material";
import CustomButton from "../customButton";
import downloadIcon from "../../assets/icons/download.svg";

const SubmittedFiles = ({
  files = [],
  icon,
  t,
  titleKey,
  customTitle,
  downloadBtnProps = {},
}) => {
  return (
    <Box mt={2}>
      {customTitle ? (
        <Typography variant="body1" color="text.secondary" mb={1}>
          {customTitle}
        </Typography>
      ) : (
        <Typography fontSize={14} fontWeight={600} mb={1}>
          {titleKey
            ? `${t(titleKey)} (${files.length})`
            : `Submitted Files (${files.length})`}
        </Typography>
      )}
      {files.map((file, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "12px",
            mb: 1,
          }}
        >
          {icon && (
            <Box
              sx={{
                backgroundColor: "primary.lightGray",
                borderRadius: "10px",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <img src={icon} alt={file.name} style={{ width: 20, height: 20 }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
              {file.name}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {file.size}
            </Typography>
          </Box>

          {/* ← CHANGED: use CustomButton with spread downloadBtnProps */}
          <CustomButton
            variant="gradient"
            btnLabel={t("assignments.viewSubmission.download")}
            handlePressBtn={() => file.url && window.open(file.url, "_blank")}
            btnTextSize="10px"
            width="auto"
            sx={{ minWidth: 62, padding: "0 10px" }}
            {...downloadBtnProps}
          />
        </Box>
      ))}
    </Box>
  );
};

export default SubmittedFiles;
