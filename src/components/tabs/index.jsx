import React from "react";
import { Box, Typography } from "@mui/material";

const CustomTabs = ({
  tabs,
  activeTab,
  onTabChange,
  containerProps = {},
  tabProps = {},
  tabTextProps = {},
}) => {
  return (
    <Box
      mt={2}
      mb={2}
      gap={0.5}
      display={"flex"}
      backgroundColor={"#fff"}
      borderRadius={"18px"}
      padding={"6px"}
      sx={{
        overflowX: "auto",        // ✅ horizontal scroll
        flexWrap: "nowrap",       // ✅ ek line me
        whiteSpace: "nowrap",

        // optional: scrollbar hide
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
      }}
      {...containerProps}
    >
      {tabs.map((tab) => (
        <Box
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          flex={1}
          textAlign={"center"}
          padding={"16px 12px"}
          borderRadius={"18px"}
          color={activeTab === tab.id ? "#fff" : "text.disabled"}
          fontWeight={activeTab === tab.id ? 700 : 500}
          sx={{
            cursor: "pointer",
            transition: "all 0.2s ease",
            background:
              activeTab === tab.id
                ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" 
                : "transparent",
            "&:hover": {
              backgroundColor: "secondary.lightWhite",
              // activeTab === tab.id ? "customColor.aquaGreen" : "#e0e0e0",
            },
          }}
          {...tabProps}
        >
          <Typography
            fontSize={"0.975rem"}
            fontWeight={activeTab === tab.id ? 600 : 400}
            color={activeTab === tab.id ? "#fff" : "text.disabled"}
            {...tabTextProps}
          >
            {tab.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CustomTabs;
