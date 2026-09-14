// src/routes/RoutesLayout.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "../zustand/useUserStore";
import { useCurrencyBootstrap, usePhoneConfigBootstrap } from "../hooks/companySettings";  

// Detail/nested pages — always accessible regardless of role
const ALWAYS_ALLOWED_PATTERNS = [
  /^\/projects\/[^/]+$/,
  /^\/projects\/[^/]+\/modules\/[^/]+$/,      
  /^\/employees\/[^/]+$/,
  /^\/integrations\/[^/]+$/,
  /^\/projects\/tasks\/[^/]+$/,
  /^\/pm-tasks\/[^/]+$/,
  /^\/emp\/tasks\/[^/]+$/,
  /^\/pm-projects\/[^/]+$/,
  /^\/pm-projects\/[^/]+\/modules\/[^/]+$/,   
  /^\/employee\/bugs$/,
];
// Fallback static paths — used only when user has no rolePages assigned
const ROLE_FALLBACK_PATHS = {
  ADMIN: [
     "/admin-dashboard", "/projects", "/employees", "/performance", "/roles",
    "/messages", "/documents", "/reports", "/integrations", "/settings",
    "/hr-dashboard", "/attendance-monitoring", "/leave-management",
    "/payroll-management", "/hr-messages", "/hr-documents",
    "/dashboard", "/my-projects", "/task-management", "/team-performance",
    "/pm-messages", "/pm-documents",
    "/employee-dashboard", "/my-tasks", "/emp-attendance", "/salary", "/profile",
  ],
  HR: [
    "/hr-dashboard", "/attendance-monitoring", "/leave-management",
    "/payroll-management", "/hr-messages", "/hr-documents",
  ],
  PROJECT_MANAGER: [
    "/dashboard", "/my-projects", "/task-management", "/team-performance",
    "/pm-messages", "/pm-documents",
  ],
  EMPLOYEE: [
    "/employee-dashboard", "/my-tasks", "/emp-attendance",
    "/messages", "/salary", "/profile",
  ],
};

const ROLE_HOME = {
  ADMIN:          "/admin-dashboard",
  HR:              "/hr-dashboard",
  PROJECT_MANAGER: "/dashboard",
  EMPLOYEE:        "/employee-dashboard",
};

const isPathAllowed = (user, pathname) => {
  // Always-allowed detail/nested pages
  if (ALWAYS_ALLOWED_PATTERNS.some((p) => p.test(pathname))) return true;

  const role = user?.role;

  // Admin always has full access
  if (role === "ADMIN") return true;

  // Use rolePages if assigned — this is the admin-configured permission set
  const rolePages = user?.rolePages || [];
  if (rolePages.length > 0) {
    return rolePages.some(
      (p) => pathname === p.path || pathname.startsWith(p.path + "/")
    );
  }

  // Fallback: use static list (when role has no pages configured)
  const fallback = ROLE_FALLBACK_PATHS[role] || [];
  return fallback.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

// ── Protected Layout ─────────────────────────────────────────────────────────
export const ProtectedLayout = () => {
  const { user }   = useUserStore();
  const location   = useLocation();

  useCurrencyBootstrap();  
   usePhoneConfigBootstrap();   

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isPathAllowed(user, location.pathname)) {
    const home = ROLE_HOME[user?.role] ||   "/admin-dashboard";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

// ── Auth Layout ───────────────────────────────────────────────────────────────
export const AuthProtectedLayout = () => {
  const { user } = useUserStore();

  if (user) {
    const home = ROLE_HOME[user?.role] || "/admin-dashboard";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};