import * as React from "react";
import { Routes, Route } from "react-router-dom";
import {
  Drawer as MuiDrawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import useUserStore from "../../zustand/useUserStore";
import { getUserRoutes } from "../../utils/routeMapper";
import { ADMIN_ROUTES, HR_ROUTES } from "../../routes";
import logo from "../../assets/images/softwareflux-logo.png";

const ADMIN_DESIGNATION_ID = '69aa5fb7f19750bbdf3de0d8';

export const drawerWidth = 220;
export const collapsedWidth = 64;

export default function Drawer({ drawerOpen, handleNavigation, toggleDrawer }) {
  const location = useLocation();
  const { user } = useUserStore();
  
  const [openSubmenu, setOpenSubmenu] = React.useState({});

  const handleSubmenuToggle = (routeId) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [routeId]: !prev[routeId],
    }));
  };

  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));

  const isRouteActive = (path) => location.pathname === path;

  //const isAdmin = user?.designation?._id === ADMIN_DESIGNATION_ID;
  const isAdmin = true; // TODO: remove when auth is ready

  const userRoutes = React.useMemo(() => {
    return getUserRoutes(user);
  }, [user]);

  const renderRouteItem = (route) => {
    if (route.isHideMenu) return null;

    const routePath = route.path || (route.children && route.children[0]?.path);
    const isActive = routePath ? isRouteActive(routePath) : false;
    const hasChildren = route.children && route.children.length > 0;
const displayName = route.title || route.nameKey;
    return (
      <React.Fragment key={route.id || `route-${route.order}`}>
        <ListItem disablePadding sx={{ px: 1, mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleSubmenuToggle(route.id);
              } else if (routePath) {
                handleNavigation(routePath);
              }
            }}
            sx={{
              justifyContent: drawerOpen ? "flex-start" : "center",
              px: 2,
              borderRadius: "10px",
              // ── Active state: full gradient bg, white text, no left border ──
              ...(isActive && {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
                "& .MuiListItemText-primary": {
                  color: "#fff",
                  fontWeight: 600,
                },
                "&:hover": {
                  background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  opacity: 0.92,
                },
              }),
              // ── Inactive hover ──
              ...(!isActive && {
                "&:hover": {
                  background: "#AA24930F",
                  color: "#AA2493",
                  "& .MuiListItemIcon-root": {
                    color: "#AA2493",
                  },
                },
              }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                color: isActive ? "#fff" : "inherit",
              }}
            >
              {isActive && route.activeIcon
                ? route.activeIcon
                : route.inActiveIcon || null}
            </ListItemIcon>

            {drawerOpen && (
              <>
                <ListItemText
                  primary={displayName}
                  sx={{
                    ml: 2,
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "inherit",
                    },
                  }}
                />
                {hasChildren &&
                  (openSubmenu[route.id] ? (
                    <ExpandLess sx={{ color: isActive ? "#fff" : "inherit" }} />
                  ) : (
                    <ExpandMore sx={{ color: isActive ? "#fff" : "inherit" }} />
                  ))}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && drawerOpen && (
          <Collapse
            in={openSubmenu[route.id]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {route.children.map((child) => {
                const isChildActive = isRouteActive(child.path);
                return (
                  <ListItem key={child.id} disablePadding sx={{ px: 1, mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(child.path)}
                      sx={{
                        pl: 4,
                        borderRadius: "10px",
                        ...(isChildActive && {
                          background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                          color: "#fff",
                          "& .MuiListItemText-primary": {
                            color: "#fff",
                            fontWeight: 600,
                          },
                          "&:hover": {
                            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                            opacity: 0.92,
                          },
                        }),
                        ...(!isChildActive && {
                          "&:hover": {
                            background: "#AA24930F",
                            color: "#AA2493",
                          },
                        }),
                      }}
                    >
                      <ListItemText
                        primary={child.title || child.nameKey}                        
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontSize: "0.85rem",
                            color: isChildActive ? "#fff" : "inherit",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOrTablet && drawerOpen && (
        <Box
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        />
      )}

      <MuiDrawer
        variant={isMobileOrTablet ? "temporary" : "persistent"}
        anchor="left"
        open={isMobileOrTablet ? drawerOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerOpen ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerOpen ? drawerWidth : collapsedWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            border: "none",
            backgroundColor: "#fff",
            ...(isMobileOrTablet && { width: drawerWidth }),
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: drawerOpen ? "space-between" : "center",
            px: 2,
            py: 2,
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              width: drawerOpen ? "120px" : "40px",
              transition: "0.3s",
            }}
          />

          {isMobileOrTablet && (
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* MENU */}
        

        <List sx={{ px: 0.5 }}>
          {isAdmin ? (
            <>
              {/* ── Admin Panel ── */}
              {ADMIN_ROUTES.length > 0 && (
                <>
                  {drawerOpen && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2, py: 1,
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                        display: "block",
                      }}
                    >
                      Admin Panel
                    </Typography>
                  )}
                  {ADMIN_ROUTES.filter((r) => !r.isHideMenu).map(renderRouteItem)}
                </>
              )}

              {/* ── HR Portal ── */}
              {HR_ROUTES.length > 0 && (
                <>
                  {drawerOpen && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2, py: 1, mt: 1,
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                        display: "block",
                      }}
                    >
                      HR Portal
                    </Typography>
                  )}
                  {HR_ROUTES.filter((r) => !r.isHideMenu).map(renderRouteItem)}
                </>
              )}
            </>
          ) : (
            userRoutes.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No routes available"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              userRoutes.map(renderRouteItem)
            )
          )}
        </List>
      </MuiDrawer>
    </>
  );
}