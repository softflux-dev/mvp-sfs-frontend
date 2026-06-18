// routes/components.js
import Dashboard from "../app/admin/dashboard";
import Projects from "../app/admin/projects";
import ProjectDetail from "../app/admin/projects/projectDetail";
import Employees from "../app/admin/employees";
import EmployeeDetail from "../app/admin/employees/employeeDetail";
import Performance from "../app/admin/performance";
import Roles from "../app/admin/roles";   
import Messages from "../app/shared/messages";
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
import AttendanceDetail from "../app/hrPortal/attendance/attendanceDetail";
import LeaveManagement from "../app/hrPortal/leaves";
import PayrollManagement from "../app/hrPortal/payroll";
import HRDocuments         from "../app/hrPortal/documents";
import PMDashboard from "../app/projectManagerPortal/dashboard";
import MyProjects from "../app/projectManagerPortal/myProjects";
import PMprojectDetail from "../app/projectManagerPortal/myProjects/PMprojectDetail";
import TaskManagement from "../app/projectManagerPortal/taskManagement";
import TaskDetail from "../app/projectManagerPortal/taskManagement/taskDetail";
import TeamPerformance from "../app/projectManagerPortal/teamPerformance";
import HolidayManagement from "../app/hrPortal/holidays";

// Employee components
import EmpDashboard from "../app/empPortal/dashboard";
import MyTasks from "../app/empPortal/myTasks";
import EmpTaskDetail from "../app/empPortal/myTasks/empTaskDetail";
import UnifiedTaskDetail from "../shared/taskDetail/UnifiedTaskDetail";

//import TimeTracking from "../app/empPortal/timeTracking";
import EmpAttendance from "../app/empPortal/myAttendance";
import Profile from "../app/empPortal/profile";
import Salary from "../app/empPortal/salary";
import AllBugsPage from "../app/empPortal/myTasks/allBugsPage";
import MyDocuments from "../app/empPortal/document";


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
import TasksActiveIcon from "../assets/icons/tasks-active.svg";
import TasksInactiveIcon from "../assets/icons/tasks-inactive.svg";
import TimeActiveIcon from "../assets/icons/time-active.svg";
import TimeInactiveIcon from "../assets/icons/time-inactive.svg";
import ProfileActiveIcon from "../assets/icons/profile-active.svg";
import ProfileInactiveIcon from "../assets/icons/profile-inactive.svg";
import SalaryActiveIcon from "../assets/icons/salary-active.svg";
import SalaryInactiveIcon from "../assets/icons/salary-inactive.svg";

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
},
{
  id: 14,
  nameKey: "Task Detail",
  component: <TaskDetail />,
  exact: "exact",
  path: "/projects/tasks/:id",
  isHideMenu: true,
},
  
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
    nameKey: "Attendance Management",
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
    nameKey: "Leave Management",
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
    nameKey: "Holiday Management",
    component: <HolidayManagement />,
    exact: "exact",
    
    path: "/holiday-management",
    activeIcon: (
      <img src={LeavesActiveIcon} alt="Leave Management" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={LeavesInactiveIcon} alt="Leave Management" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 5,
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
    id: 6,
    nameKey: "Messages",
    component: <Messages />,
    exact: "exact",
    path: "/hr-messages",
    activeIcon: (
      <img src={MessagesActiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={MessagesInactiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 7,
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
  },
  {
  id: 8,   // any unique id — or renumber sequentially
  nameKey: "Attendance Detail",
  component: <AttendanceDetail />,
  exact: "exact",
  path: "/attendance-monitoring/detail",
  isHideMenu: true,
},
];

const PM_ROUTES = [
  {
    id: 1,
    nameKey: "Dashboard",
    component: <PMDashboard />,
    exact: "exact",
    path: "/dashboard",
    activeIcon: (
      <img src={DashboardActiveIcon} alt="PM Dashboard" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={DashboardInactiveIcon} alt="PM Dashboard" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 2,
    nameKey: "My Projects",
    component: <MyProjects />,
    exact: "exact",
    path: "/my-projects",
    activeIcon: (
      <img src={ProjectsActiveIcon} alt="My Projects" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={ProjectsInactiveIcon} alt="My Projects" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 3,
    nameKey: "Task Management",
    component: <TaskManagement />,
    exact: "exact",
    path: "/task-management",
    activeIcon: (
      <img src={TasksActiveIcon} alt="Task Management" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={TasksInactiveIcon} alt="Task Management" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 4,
    nameKey: "Task Detail",
    component: <TaskDetail />,
    exact: "exact",
    path: "/pm-tasks/:id",
    isHideMenu: true,
  },
  {
    id: 5,
    nameKey: "Team Performance",
    component: <TeamPerformance />,
    exact: "exact",
    path: "/team-performance",
    activeIcon: (
      <img src={PerformanceActiveIcon} alt="Team Performance" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={PerformanceInactiveIcon} alt="Team Performance" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 6,
    nameKey: "Messages",
    component: <Messages />,
    exact: "exact",
    path: "/pm-messages",
    activeIcon: (
      <img src={MessagesActiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={MessagesInactiveIcon} alt="Messages" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 7,
    nameKey: "Documents",
    component: <Documents />,
    exact: "exact",
    path: "/pm-documents",
    activeIcon: (
      <img src={DocumentsActiveIcon} alt="Documents" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={DocumentsInactiveIcon} alt="Documents" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
  id: 8,
  nameKey: "Project Detail",
  component: <PMprojectDetail />,   
  exact: "exact",
  path: "/pm-projects/:id",
  isHideMenu: true,
}
];

const EMP_ROUTES = [  
  {
      id: 1,
      nameKey: "Dashboard",
      component: <EmpDashboard />,
      exact: "exact",
      path: "/employee-dashboard",
      activeIcon: (
        <img src={DashboardActiveIcon} alt="Employee Dashboard" style={{ width: 20, height: 20 }} />
      ),
      inActiveIcon: (
        <img src={DashboardInactiveIcon} alt="Employee Dashboard" style={{ width: 20, height: 20 }} />
      ),
      isHideMenu: false,
    },
    {
      id: 2,
      nameKey: "My Tasks",
      component: <MyTasks />,
      exact: "exact",
      path: "/my-tasks",
      activeIcon: (
        <img src={TasksActiveIcon} alt="My Tasks" style={{ width: 20, height: 20 }} />
      ),
      inActiveIcon: (
        <img src={TasksInactiveIcon} alt="My Tasks" style={{ width: 20, height: 20 }} />
      ),
      isHideMenu: false,
    },
    {
      id: 3,
      nameKey: "Task Detail",
      component: <UnifiedTaskDetail backLabel="Back to My Tasks" />,
      exact: "exact",
      path: "/emp/tasks/:id",
      isHideMenu: true,
    },
/*     {
      id: 4,
      nameKey: "Time Tracking",
      component: <TimeTracking />,
      exact: "exact",
      path: "/time-tracking",
      activeIcon: (
        <img src={TimeActiveIcon} alt="Time Tracking" style={{ width: 20, height: 20 }} />
      ),
      inActiveIcon: (
        <img src={TimeInactiveIcon} alt="Time Tracking" style={{ width: 20, height: 20 }} />
      ),
      isHideMenu: false,
    } */
   {
    id: 4,
    nameKey: "My Attendance",
    component: <EmpAttendance/>,
    exact: "exact",
    path: "/emp-attendance",
    activeIcon: (
      <img src={AttendanceActiveIcon} alt="Attendance Monitoring" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={AttendanceInactiveIcon} alt="Attendance Monitoring" style={{ width: 20, height: 20 }} />
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
    nameKey: "My Salary",
    component: <Salary />,
    exact: "exact",
    path: "/salary",
    activeIcon: (
      <img src={SalaryActiveIcon} alt="Salary" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={SalaryInactiveIcon} alt="Salary" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
   {
    id: 7,
    nameKey: "Profile",
    component: <Profile />,
    exact: "exact",
    path: "/profile",
    activeIcon: (
      <img src={ProfileActiveIcon} alt="Profile" style={{ width: 20, height: 20 }} />
    ),
    inActiveIcon: (
      <img src={ProfileInactiveIcon} alt="Profile" style={{ width: 20, height: 20 }} />
    ),
    isHideMenu: false,
  },
  {
    id: 8,
    nameKey: "All Bugs",
    component: <AllBugsPage />,
    exact: "exact",
    path: "/employee/bugs",
    isHideMenu: true,
  },
  {
  id: 9,
  nameKey: "My Documents",
  component: <MyDocuments />,
  exact: "exact",
  path: "/my-documents",
  activeIcon:   <img src={DocumentsActiveIcon}   alt="Documents" style={{ width: 20, height: 20 }} />,
  inActiveIcon: <img src={DocumentsInactiveIcon} alt="Documents" style={{ width: 20, height: 20 }} />,
  isHideMenu: false,
}
];






export { ADMIN_ROUTES, AUTH_ROUTES, HR_ROUTES, PM_ROUTES, EMP_ROUTES };