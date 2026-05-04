// components/appBar/index.jsx
import * as React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Profile       from "./profile";
import Notifications from "./notifications";

export default function AppBar({
  toggleDrawer,
  drawerOpen,
  drawerWidth,
  handleNavigation,
  handleLogout,
}) {
  const theme            = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "primary.lightGray",
        boxShadow:       "none",
        width:           isMobileOrTablet ? "100%" : `calc(100% - ${drawerWidth}px)`,
        transition:      "width 0.3s ease, left 0.3s ease, right 0.3s ease",
        padding:         2,
        left:            isMobileOrTablet ? 0 : `${drawerWidth}px`,
        right:           0,
      }}
    >
      <Toolbar
        sx={{
          display:         "flex",
          justifyContent:  "space-between",
          alignItems:      "center",
          px:              3,
          minHeight:       "70px",
          gap:             2,
          borderRadius:    4,
          backgroundColor: "#fff",
        }}
      >
        {/* Left: Hamburger */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={toggleDrawer}>
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Right: Notifications + Profile */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Notifications />
          <Profile
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            user={null}
          />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}