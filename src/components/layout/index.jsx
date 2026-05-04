import * as React from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppBar from "./appBar";
import Drawer, { drawerWidth, collapsedWidth } from "./drawer";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  

  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md")); // mobile/tablet detection

  // Desktop: open by default, Mobile/Tablet: collapsed initially
  const [drawerOpen, setDrawerOpen] = React.useState(!isMobileOrTablet);

  // Automatic open/close on screen resize
  React.useEffect(() => {
    if (isMobileOrTablet) {
      setDrawerOpen(false); // mobile/tablet: collapsed
    } else {
      setDrawerOpen(true); // desktop: open
    }
  }, [isMobileOrTablet]);

  const handleNavigation = (path) => {
    navigate(path);
    // Mobile/tablet: collapse after navigation
    if (isMobileOrTablet) setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const actualDrawerWidth = drawerOpen ? drawerWidth : collapsedWidth;

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <CssBaseline />

      {/* APP BAR */}
    <AppBar
      toggleDrawer={toggleDrawer}
      drawerOpen={drawerOpen}
      drawerWidth={actualDrawerWidth}
    />

      {/* DRAWER */}
      <Drawer
        drawerOpen={drawerOpen}
        handleNavigation={handleNavigation}
        toggleDrawer={toggleDrawer}
      />

      {/* CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#FAFAFB",
          minHeight: "100vh",
          width: `calc(100% - ${actualDrawerWidth}px)`,
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <Toolbar sx={{ mt: "20px" }} />
        {children}
      </Box>
    </Box>
  );
}
