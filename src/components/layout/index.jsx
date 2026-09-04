import * as React from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "./appBar";
import Drawer, { drawerWidth, collapsedWidth } from "./drawer";
import { useSessionTimeout } from "../../hooks/useSessionTimeout";  // ← adjust path if your hooks folder is elsewhere relative to this file
import { useUnsavedChangesStore } from "../../zustand/useUnsavedChangesStore";

export default function MainLayout({ children }) {
  const navigate = useNavigate();

  // Enforces the system-wide inactivity timeout (set by Admin in
  // Settings > Security) for every authenticated route — Admin, HR, PM,
  // and Employee all render through MainLayout, so this one call covers
  // the entire authenticated app.
  useSessionTimeout();

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

  // ── Unsaved-changes guard — Drawer funnels EVERY nav click (logo, top-
  // level items, submenu children) through this single handleNavigation
  // prop, so wrapping it here with guardNavigate covers all sidebar
  // navigation with the same dialog/indicator Settings' own tab-switching
  // uses — no changes needed inside drawer.jsx itself. If nothing is
  // dirty, guardNavigate runs the real navigation immediately; if a
  // dirty section is mounted, it opens the confirmation dialog instead
  // and only navigates if the user picks "Discard & Leave". ─────────────
  const guardNavigate = useUnsavedChangesStore((s) => s.guardNavigate);


  const handleNavigation = (path) => {
  guardNavigate(() => {
    navigate(path);
    if (isMobileOrTablet) setDrawerOpen(false);
  });
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