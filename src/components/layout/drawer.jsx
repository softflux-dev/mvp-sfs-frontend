import * as React from "react";
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
import { ADMIN_ROUTES, HR_ROUTES, PM_ROUTES, EMP_ROUTES } from "../../routes";
import logo from "../../assets/images/softwareflux-logo.png";

export const drawerWidth = 220;
export const collapsedWidth = 64;

// Map each role to its full route list + section label
const ROLE_ROUTE_MAP = {
  ADMIN:           { routes: ADMIN_ROUTES, label: "Admin Panel"             },
  HR:              { routes: HR_ROUTES,    label: "HR Portal"               },
  PROJECT_MANAGER: { routes: PM_ROUTES,   label: "Project Manager Portal"  },
  EMPLOYEE:        { routes: EMP_ROUTES,  label: "Employee Portal"         },
};
const ALL_ROUTES = [
  ...ADMIN_ROUTES,
  ...HR_ROUTES,
  ...PM_ROUTES,
  ...EMP_ROUTES,
];


export default function Drawer({ drawerOpen, handleNavigation, toggleDrawer }) {
  const location  = useLocation();
  const { user }  = useUserStore();
  const theme     = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [openSubmenu, setOpenSubmenu] = React.useState({});

  const handleSubmenuToggle = (routeId) => {
    setOpenSubmenu((prev) => ({ ...prev, [routeId]: !prev[routeId] }));
  };

  const isRouteActive = (path) => location.pathname === path;

const isAdmin = false;

  // ── Build the set of allowed paths from user.rolePages ──────────────────
  // rolePages is stored on login: user.role.pages populated by backend
const allowedPathSet = React.useMemo(() => {
  const pages = user?.rolePages || [];
  return new Set(pages.map((p) => p.path));
}, [user?.rolePages]);

const { label: roleLabel } = ROLE_ROUTE_MAP[user?.role] || { label: "" };


const visibleRoutes = React.useMemo(() => {
  if (!allowedPathSet) return [];

  const pages = user?.rolePages || [];
  const result = [];
  const seen = new Set();

  for (const page of pages) {
    const route = ALL_ROUTES.find(
      (r) => !r.isHideMenu && r.path === page.path
    );
    if (route && !seen.has(route.path)) {
      seen.add(route.path);
      result.push(route);
    }
  }

  // Always render "Settings" and "Profile" last, regardless of the
  // order rolePages happens to come back in from the backend.
  const isPinnedLast = (route) =>
    route.nameKey === "Settings" || route.nameKey === "Profile";

  const normal = result.filter((r) => !isPinnedLast(r));
  const pinned = result.filter((r) => isPinnedLast(r));

  return [...normal, ...pinned];
}, [user?.rolePages, allowedPathSet]);
  

    

  // ── Render a single route item ───────────────────────────────────────────
  const renderRouteItem = (route) => {
    if (route.isHideMenu) return null;

    const routePath  = route.path || route.children?.[0]?.path;
    const isActive   = routePath ? isRouteActive(routePath) : false;
    const hasChildren = route.children?.length > 0;
    const displayName = route.nameKey || route.title;

    return (
      <React.Fragment key={route.id || routePath}>
        <ListItem disablePadding sx={{ px: 1, mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) handleSubmenuToggle(route.id);
              else if (routePath) handleNavigation(routePath);
            }}
            sx={{
              justifyContent: drawerOpen ? "flex-start" : "center",
              px: 2,
              borderRadius: "10px",
              ...(isActive && {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
                "& .MuiListItemIcon-root":      { color: "#fff" },
                "& .MuiListItemText-primary":   { color: "#fff", fontWeight: 600 },
                "&:hover": {
                  background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  opacity: 0.92,
                },
              }),
              ...(!isActive && {
                "&:hover": {
                  background: "#AA24930F",
                  color: "#AA2493",
                  "& .MuiListItemIcon-root": { color: "#AA2493" },
                },
              }),
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: isActive ? "#fff" : "inherit" }}>
              {isActive && route.activeIcon ? route.activeIcon : route.inActiveIcon || null}
            </ListItemIcon>

            {drawerOpen && (
              <>
                <ListItemText
                  primary={displayName}
                  sx={{
                    ml: 2,
                    "& .MuiListItemText-primary": {
                      fontSize:   "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      color:      isActive ? "#fff" : "inherit",
                    },
                  }}
                />
                {hasChildren && (
                  openSubmenu[route.id]
                    ? <ExpandLess sx={{ color: isActive ? "#fff" : "inherit" }} />
                    : <ExpandMore sx={{ color: isActive ? "#fff" : "inherit" }} />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && drawerOpen && (
          <Collapse in={openSubmenu[route.id]} timeout="auto" unmountOnExit>
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
                          "& .MuiListItemText-primary": { color: "#fff", fontWeight: 600 },
                          "&:hover": {
                            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                            opacity: 0.92,
                          },
                        }),
                        ...(!isChildActive && {
                          "&:hover": { background: "#AA24930F", color: "#AA2493" },
                        }),
                      }}
                    >
                      <ListItemText
                        primary={child.title || child.nameKey}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontSize: "0.85rem",
                            color:    isChildActive ? "#fff" : "inherit",
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
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: (t) => t.zIndex.drawer - 1,
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
        {/* Logo */}
        <Box sx={{
          display: "flex", alignItems: "center",
          justifyContent: drawerOpen ? "space-between" : "center",
          px: 2, py: 2,
        }}>
          <img
            src={logo} alt="logo"
            style={{ width: drawerOpen ? "120px" : "40px", transition: "0.3s" }}
          />
          {isMobileOrTablet && (
            <IconButton onClick={toggleDrawer}><CloseIcon /></IconButton>
          )}
        </Box>

        {/* Menu */}
        <List sx={{ px: 0.5 }}>
          {isAdmin ? (
            // ── ADMIN: show all portals with section headings ──────────────
            <>
              {[
                { routes: ADMIN_ROUTES, label: "Admin Panel"            },
                { routes: HR_ROUTES,    label: "HR Portal"              },
                { routes: PM_ROUTES,    label: "Project Manager Portal" },
                { routes: EMP_ROUTES,   label: "Employee Portal"        },
              ].map(({ routes, label }) => {
                const visible = routes.filter((r) => !r.isHideMenu);
                if (!visible.length) return null;
                return (
                  <React.Fragment key={label}>
                    {drawerOpen && (
                      <Typography variant="caption" sx={{
                        px: 2, py: 1, mt: 1,
                        color: "text.secondary", fontWeight: 600,
                        textTransform: "uppercase", fontSize: "0.7rem",
                        display: "block",
                      }}>
                        {label}
                      </Typography>
                    )}
                    {visible.map(renderRouteItem)}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            // ── NON-ADMIN: show only role-specific + page-filtered routes ──
            visibleRoutes.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No routes available"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              <>
                {drawerOpen && roleLabel && (
                  <Typography variant="caption" sx={{
                    px: 2, py: 1,
                    color: "text.secondary", fontWeight: 600,
                    textTransform: "uppercase", fontSize: "0.7rem",
                    display: "block",
                  }}>
                    {roleLabel}
                  </Typography>
                )}
                {visibleRoutes.map(renderRouteItem)}
              </>
            )
          )}
        </List>
      </MuiDrawer>
    </>
  );
}