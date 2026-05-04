import { useState, useEffect } from "react";
import { Box, Menu, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomButton from "../customButton"; // <-- use your custom button

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language === "ar" ? "Arabic" : "English"
  );

  useEffect(() => {
    setSelectedLanguage(i18n.language === "ar" ? "Arabic" : "English");
  }, [i18n.language]);

  const handleLanguageSelect = (language) => {
    const languageCode = language === "Arabic" ? "ar" : "en";
    i18n.changeLanguage(languageCode);
    setSelectedLanguage(language);
  };

  const handleToggleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const isEnglish = selectedLanguage === "English";

  return (
    <Box>
      {/* Toggle Button */}
      <Box
        onClick={handleToggleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",       
          padding: "4px 8px",
          borderRadius: "20px",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#F97316",
            boxShadow: "0 2px 8px rgba(249, 115, 22, 0.1)",
          },
        }}
      >
        <Typography
          fontSize="14px"
          fontWeight="500"
          color="#000"
          sx={{ userSelect: "none" }}
        >
          {selectedLanguage}
        </Typography>

        {/* Custom Toggle Switch */}
        <Box
          sx={{
            width: 42,
            height: 24,
            borderRadius: "12px",
            backgroundColor: "#F97316",
            position: "relative",
            transition: "background-color 0.3s ease",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "2px",
              left: isEnglish ? "2px" : "20px",
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "left 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </Box>
      </Box>

      {/* Language Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            minWidth: 240,
            p: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Menu Title */}
        <Typography fontSize="16px" fontWeight="600" color="#000" mb={2} px={1}>
          Change Language
        </Typography>

        {/* English Option */}
        <CustomButton
          btnLabel="English"
          handlePressBtn={() => {
            handleLanguageSelect("English");
            handleClose();
          }}
          variant={selectedLanguage === "English" ? "gradient" : undefined}
          btnTextColor={selectedLanguage === "English" ? "#fff" : "#000"}
          width="100%"
          sx={{ mb: 1, justifyContent: "flex-start" }}
        />

        {/* Arabic Option */}
        <CustomButton
          btnLabel="Arabic"
          handlePressBtn={() => {
            handleLanguageSelect("Arabic");
            handleClose();
          }}
          variant={selectedLanguage === "Arabic" ? "gradient" : undefined}
          btnTextColor={selectedLanguage === "Arabic" ? "#fff" : "#808080"}
          width="100%"
          sx={{ justifyContent: "flex-start" }}
        />
      </Menu>
    </Box>
  );
}
