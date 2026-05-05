// routes/components.js
import Dashboard from "../app/admin/dashboard";
import Projects from "../app/admin/projects";
import ProjectDetail from "../app/admin/projects/projectDetail";
import Employees from "../app/admin/employees";
import EmployeeDetail from "../app/admin/employees/employeeDetail";
import Performance from "../app/admin/performance";
import Roles from "../app/admin/roles";   
import Messages from "../app/admin/messages";
import Documents from "../app/admin/documents";
import Reports from "../app/admin/reports";
import Integrations from "../app/admin/integration";
import IntegrationDetail from "../app/admin/integration/integrationDetail";
import Settings from "../app/admin/settings";

// Auth components
import LoginPage from "../app/auth/login";
import ResetPasswordPage from "../app/auth/resetPassword";
import ForgotPasswordPage from "../app/auth/forgotPassword";

// HR components
import HRDashboard from "../app/hrPortal/dashboard";
import AttendanceMonitoring from "../app/hrPortal/attendance";
import LeaveManagement from "../app/hrPortal/leaves";
import PayrollManagement from "../app/hrPortal/payroll";
import HRDocuments         from "../app/hrPortal/documents";


// routes/icons
import DashboardActiveIcon from "../assets/icons/dashboard-active.svg";
import DashboardInactiveIcon from "../assets/icons/dashboard-inactive.svg";
import ProjectsActiveIcon from "../assets/icons/projects-active.svg";
import ProjectsInactiveIcon from "../assets/icons/projects-inactive.svg";
import EmployeesActiveIcon from "../assets/icons/employee-active.svg";
import EmployeesInactiveIcon from "../assets/icons/employee-inactive.svg";
import PerformanceActiveIcon from "../assets/icons/performance-active.svg";
import PerformanceInactiveIcon from "../assets/icons/performance-inactive.svg";
import RolesActiveIcon from "../assets/icons/roles-active.svg";
import RolesInactiveIcon from "../assets/icons/roles-inactive.svg";
import MessagesActiveIcon from "../assets/icons/messages-active.svg";
import MessagesInactiveIcon from "../assets/icons/messages-inactive.svg";
import DocumentsActiveIcon from "../assets/icons/documents-active.svg";
import DocumentsInactiveIcon from "../assets/icons/documents-inactive.svg";
import ReportsActiveIcon from "../assets/icons/report-active.svg";
import ReportsInactiveIcon from "../assets/icons/report-inactive.svg";
import IntegrationActiveIcon from "../assets/icons/integrations-active.svg";
import IntegrationInactiveIcon from "../assets/icons/integrations-inactive.svg";
import SettingsActiveIcon from "../assets/icons/setting-active.svg";
import SettingsInactiveIcon from "../assets/icons/setting-inactive.svg";
import AttendanceActiveIcon from "../assets/icons/attendance-active.svg";
import AttendanceInactiveIcon from "../assets/icons/attendance-inactive.svg";
import LeavesActiveIcon from "../assets/icons/leaves-active.svg";
import LeavesInactiveIcon from "../assets/icons/leaves-inactive.svg";
import PayrollActiveIcon from "../assets/icons/payroll-active.svg";
import PayrollInactiveIcon from "../assets/icons/payroll-inactive.svg";
import { id } from "date-fns/locale";
//import AuthPage from "../app/auth/AuthPage";
//import SelectAccount from "../app/auth/login/SelectAccount";
//import StudentLogin from "../app/auth/login/student/StudentLogin";




const AUTH_ROUTES = [
  {
    id: 1,
    nameKey: "Login",
    component: <LoginPage />,
    path: "login",
    exact: "exact",
  },

  {
    id: 2,
    nameKey: "Forget Password",
    component: <ForgotPasswordPage />,
    exact: "exact",
    path: "forgot-password",
  },

  {
    id: 3,
    nameKey: "Reset Password",
    component: <ResetPasswordPage />,
    exact: "exact",
    path: "reset-password",
  },
];

const ADMIN_ROUTES = [
  {
    id: 1,
    nameKey: "Dashboard",
    component: <Dashboard />,
    exact: "exact",
    path: "/",
    activeIcon: (
      <img
        src={DashboardActiveIcon}
        alt="Dashboard"
        style={{ width: 20, height: 20 }}
      />
    ),
    inActiveIcon: (
      <img
        src={DashboardInactiveIcon}
        alt="Dashboard"
        style={{ width: 20, height: 20 }}
      />
    ),
    isHideMenu: false,
  },
  {
    id: 2,
    nameKey:"Projects",
    component: <Projects />,
    exact: "exact",
    path: "/projects",
    activeIcon: (
      <img
        src={ProjectsActiveIcon}
        alt="Projects"
        style={{ width: 20, height: 20 }}
      />
    ),
    inActiveIcon: (
      <img
        src={ProjectsInactiveIcon}
        alt="Projects"
        style={{ width: 20, height: 20 }}      />
    ),
    isHideMenu: false,

  },
  {
    id: 3,
    nameKey: "Project Detail",
    component: <ProjectDetail />,
    exact: "exact",
    path: "/projects/:id",
    isHideMenu: true,        
  },
  {
    id: 4,
    nameKey: "Employees",
    component: <Employees />,
    exact: "exact",
    path: "/employees",
    activeIcon: (
      <img
        src={EmployeesActiveIcon}
        alt="Employees"
        style={{ width: 20, height: 20 }}
      />
    ),
    inActiveIcon: (
      <img 
      src={EmployeesInactiveIcon}        
      alt="Employees"
        style={{ width: 20, height: 20 }}
      />
    ),
    isHideMenu: false,
  },
  {
  id: 5,
  nameKey: "Employee Detail",
  component: <EmployeeDetail />,
  exact: "exact",
  path: "/employees/:id",
  isHideMenu: true,
},
{
    id: 6,
    nameKey: "Performance",
    component: <Performance />,
    exact: "exact",
    path: "/performance",
    activeIcon: (
      <img src={PerformanceActiveIcon} alt="Performance" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={PerformanceInactiveIcon} alt="Performance" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 7,
    nameKey: "Roles",
    component: <Roles />,
    exact: "exact",
    path: "/roles",
    activeIcon: (
      <img src={RolesActiveIcon} alt="Roles" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={RolesInactiveIcon} alt="Roles" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 8,
    nameKey: "Messages",
    component: <Messages />,
    exact: "exact",
    path: "/messages",
    activeIcon: (
      <img src={MessagesActiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={MessagesInactiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 9,
    nameKey: "Documents",
    component: <Documents />,
    exact: "exact",
    path: "/documents",
    activeIcon: (
      <img src={DocumentsActiveIcon} alt="Documents" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={DocumentsInactiveIcon} alt="Documents" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 10,
    nameKey: "Reports",
    component: <Reports />,
    exact: "exact",
    path: "/reports",
    activeIcon: (
      <img src={ReportsActiveIcon} alt="Reports" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={ReportsInactiveIcon} alt="Reports" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 11,
    nameKey: "Integrations",
    component: <Integrations />,
    exact: "exact",
    path: "/integrations",
    activeIcon: (
      <img src={IntegrationActiveIcon} alt="Integrations" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={IntegrationInactiveIcon} alt="Integrations" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
    {
  id: 12,
  nameKey: "Integration Detail",
  component: <IntegrationDetail />,
  exact: "exact",
  path: "/integrations/:id",
  isHideMenu: true,
},
{
    id: 13,
    nameKey: "Settings",
    component: <Settings />,
    exact: "exact",
    path: "/settings",
    activeIcon: (
      <img src={SettingsActiveIcon} alt="Settings" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={SettingsInactiveIcon} alt="Settings" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
}
  
]; 

const HR_ROUTES = [
  {
    id: 1,
    nameKey: "HR Dashboard",
    component: <HRDashboard />,
    exact: "exact",
    path: "/hr-dashboard",
     activeIcon: (
      <img src={DashboardActiveIcon} alt="HR Dashboard" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={DashboardInactiveIcon} alt="HR Dashboard" style={{ width: 20, height: 20 }} />
    ),
      isHideMenu: false,
  },
  {
    id: 2,
    nameKey: "Attendance",
    component: <AttendanceMonitoring />,
    exact: "exact",
    path: "/attendance-monitoring",
    activeIcon: (
      <img src={AttendanceActiveIcon} alt="Attendance Monitoring" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={AttendanceInactiveIcon} alt="Attendance Monitoring" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 3,
    nameKey: "Leaves",
    component: <LeaveManagement />,
    exact: "exact",
    
    path: "/leave-management",
    activeIcon: (
      <img src={LeavesActiveIcon} alt="Leave Management" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={LeavesInactiveIcon} alt="Leave Management" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 4,
    nameKey: "Payroll",
    component: <PayrollManagement />,
    exact: "exact",
    path: "/payroll-management",
    activeIcon: (
      <img src={PayrollActiveIcon} alt="Payroll" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={PayrollInactiveIcon} alt="Payroll" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 5,
    nameKey: "Messages",
    component: <Messages />,
    exact: "exact",
    path: "/messages",
    activeIcon: (
      <img src={MessagesActiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={MessagesInactiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 6,
    nameKey: "Documents",
    component: <HRDocuments />,
    exact: "exact",
    path: "/hr-documents",
    activeIcon: (
      <img src={DocumentsActiveIcon} alt="HR Documents" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={DocumentsInactiveIcon} alt="HR Documents" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  }
];





export { ADMIN_ROUTES, AUTH_ROUTES, HR_ROUTES };