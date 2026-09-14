import { Box, Grid, MenuItem } from "@mui/material";
import { CustomSelect, TextInput } from "..";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import GlobalStyle from "../../style/style";

const Filter = ({
  mode = "full",
  onFilterChange,
  managers = [],   
  resetKey = 0,
  departments = [],    
  roles       = [],
  projectTypes = [],
  employees   = [],
  projects    = [],
  categories  = [],
  isPM        = false,
   isEmployee  = false,
  stages = [],
  defaultValues = {},
}) => {
 const [values, setValues] = useState(defaultValues);

 
  // ── Fire default values up to parent once on mount ──────────────────────
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0 && onFilterChange) {
      onFilterChange(defaultValues);
    }
  }, []); // run once on mount only

  useEffect(() => {
    if (resetKey > 0) {
      setValues({});
      if (onFilterChange) onFilterChange({});
    }
  }, [resetKey, onFilterChange]);

  const setVal = (key, val) => {
    let newValues = { ...values, [key]: val };

    // ── Due-date-filter specific guards (projects mode) ───────────────────
    if (key === "dueDateFilter") {
      // Switching away from "custom" clears any picked custom dates so
      // stale dates never leak into a non-custom filter request.
      if (val !== "custom") {
        newValues = { ...newValues, dueDateFrom: null, dueDateTo: null };
      }
    }

    if (key === "dueDateFrom") {
      // If the new "From" date is after the currently selected "To" date,
      // clear "To" so the range can never be inverted.
      const to = values.dueDateTo ? new Date(values.dueDateTo) : null;
      const from = val ? new Date(val) : null;
      if (to && from && to < from) {
        newValues = { ...newValues, dueDateTo: null };
      }
    }

    // ── Submitted-date-filter guards (leave_management mode) ──────────────
    if (key === "dateFilter") {
      if (val !== "custom") {
        newValues = { ...newValues, dateFrom: null, dateTo: null };
      }
    }

    if (key === "dateFrom") {
      const to = values.dateTo ? new Date(values.dateTo) : null;
      const from = val ? new Date(val) : null;
      if (to && from && to < from) {
        newValues = { ...newValues, dateTo: null };
      }
    }

    setValues(newValues);
    if (onFilterChange) onFilterChange(newValues);
  };

  const configs = {

   projects: ({ managers = [], projectTypes = [] }) => [
    {
      type: "search",
      key: "search",
      placeholder: "Search by project name or client name...",
      grid: { xs: 12, md: 3.5 },
    },
    {
      type: "select",
      key: "status",
      placeholder: "All Status",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "",            l: "All Status"  },
        { v: "new",         l: "New"         },
        { v: "in_progress", l: "In Progress" },
        { v: "paused",      l: "Paused"      },
        { v: "completed",   l: "Completed"   },
      ],
    },
    {
      type: "select",
      key: "projectType",           
      placeholder: "All Project Types",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "", l: "All Project Types" },
        ...projectTypes.map((t) => ({ v: t._id, l: t.label })), // ← real API data
      ],
    },
    {
      type: "select",
      key: "manager",
      placeholder: "All Managers",
      grid: { xs: 12, md: 2.5 },
      options: [
        { v: "", l: "All Managers" },
        ...managers.map((m) => ({ v: m._id, l: m.fullName })), // ← real API data
      ],
    },
    {
      type: "select",
      key: "dueDateFilter",
      placeholder: "Due Date",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "",            l: "All Due Dates"  },
        { v: "this_week",   l: "Due This Week"  },
        { v: "this_month",  l: "Due This Month" },
        { v: "overdue",     l: "Overdue"        },
        { v: "custom",      l: "Custom Range"   },
      ],
    },
    // ── Only rendered when "Custom Range" is selected ─────────────────────
    {
      type: "date",
      key: "dueDateFrom",
      placeholder: "From",
      grid: { xs: 12, md: 2 },
      showIf: (v) => v.dueDateFilter === "custom",
    },
    {
      type: "date",
      key: "dueDateTo",
      placeholder: "To",
      grid: { xs: 12, md: 2 },
      showIf: (v) => v.dueDateFilter === "custom",
      minDateKey: "dueDateFrom", // disables all days before the chosen "From" date
    },
  ],

    
    // ── Tasks ─────────────────────────────────────────────────────────────
 tasks: ({ employees = [], stages = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search by task name or task ID...",
    grid: { xs: 12, md: 2.4 },
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Task Pipeline Status",
    grid: { xs: 12, md: 2.4 },
    options: [
      { v: "", l: "All Task Pipeline Status" },
      ...stages.map((s) => ({ v: s.id, l: s.label })),
    ],
  },
  {
    type: "select",
    key: "assignee",
    placeholder: "All Assignees",
    grid: { xs: 12, md: 2.4 },
    options: [
      { v: "", l: "All Assignees" },
      ...employees.map((e) => ({ v: e._id, l: e.fullName || e.name })),
    ],
  },
  {
    type: "select",
    key: "priority",
    placeholder: "All Priority",
    grid: { xs: 12, md: 2.4 },
    options: [
      { v: "", l: "All Priority" },
      { v: "high",   l: "High"   },
      { v: "medium", l: "Medium" },
      { v: "low",    l: "Low"    },
    ],
  },
   {
    type: "select",
    key: "category",
    placeholder: "All Categories",
    grid: { xs: 12, md: 2.4 },
    options: [
      { v: "", l: "All Categories" },
      ...categories.map((c) => ({ v: c._id, l: c.label })),
    ],
  },
],

leave_balance: ({ departments = [], roles = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search by employee name or ID...",
    grid: { xs: 12, md: 6 },
  },
  {
    type: "select",
    key: "department",
    placeholder: "All Departments",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Departments" },
      ...departments.map((d) => ({ v: d._id, l: d.name })),
    ],
  },
  {
    type: "select",
    key: "role",
    placeholder: "All Roles",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Roles" },
      ...roles.map((r) => ({ v: r._id, l: r.roleName })),
    ],
  },
],

     // ── Team ──────────────────────────────────────────────────────────────

team: ({ employees = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search team members...",
    grid: { xs: 12, md: 8 },
  },
  {
    type: "select",
    key: "employee",
    placeholder: "All Members",
    grid: { xs: 12, md: 4 },
    options: [
      { v: "", l: "All Members" },
      ...employees.map((e) => ({ v: e._id, l: e.fullName || e.name })),
    ],
  },
],

    // ── Documents ─────────────────────────────────────────────────────────────
  
 // ── Employees page ────────────────────────────────────────────────────────
 
employees: ({ departments = [], roles = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search by name, email or employee ID...",
    grid: { xs: 12, md: 6 },
  },
  {
    type: "select",
    key: "department",
    placeholder: "All Departments",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "", l: "All Departments" },
      ...departments.map((d) => ({ v: d._id, l: d.name })),
    ],
  },
  {
    type: "select",
    key: "role",
    placeholder: "All Roles",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "", l: "All Roles" },
      ...roles.map((r) => ({ v: r._id, l: r.roleName })),
    ],
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",         l: "All Status" },
      { v: "active",   l: "Active"     },
      { v: "inactive", l: "Inactive"   },
    ],
  },
],

employee_tasks: ({ projects = [], stages = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search by task name or task ID...",
    grid: { xs: 12, md: 3 },
  },
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Projects" },
      ...projects.map((p) => ({ v: p._id, l: p.projectName })),
    ],
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Task Status",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Task Status" },
      ...stages.map((s) => ({ v: s.id, l: s.label })),
    ],
    disabledIf: (v) => !v.project,
  },
  {
    type: "select",
    key: "priority",
    placeholder: "All Priority",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",       l: "All Priority" },
      { v: "high",   l: "High"         },
      { v: "medium", l: "Medium"       },
      { v: "low",    l: "Low"          },
    ],
  },
],

performance: ({ departments = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search Employee...",
    grid: { xs: 12, md: 6 },
  },
  {
    type: "select",
    key: "department",
    placeholder: "All Department",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Department" },
      ...departments.map((d) => ({ v: d._id, l: d.name })),
    ],
  },
],

documents: ({ isPM = false, isEmployee = false } = {}) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search document name...",
    grid: { xs: 12, md: 9 },
  },
  {
    type: "select",
    key: "type",
    placeholder: "All Types",
    grid: { xs: 12, md: 3 },
    options: isEmployee
      ? [
          // Employee "My Documents" — only types admin would upload for them
          { v: "",                    l: "All Types"            },
          { v: "employment_contract", l: "Employment Contract"  },
          { v: "nda",                 l: "NDA"                  },
          { v: "id_document",         l: "ID Document"          },
          { v: "other",               l: "Other"                },
        ]
      : isPM
      ? [
          // PM sees only project-related types
          { v: "",                        l: "All Types"             },
          { v: "project_documentation",   l: "Project Documentation" },
          { v: "other",                   l: "Other"                 },
        ]
      : [
          // Admin/HR sees everything
          { v: "",                        l: "All Types"             },
          { v: "employment_contract",     l: "Employment Contract"   },
          { v: "nda",                     l: "NDA"                   },
          { v: "project_documentation",   l: "Project Documentation" },
          { v: "id_document",             l: "ID Document"           },
          { v: "client_agreement",        l: "Client Agreement"      },
          { v: "other",                   l: "Other"                 },
        ],
  },
],

employee_productivity: [
  {
    type: "select",
    key: "department",
    placeholder: "All Department",
    grid: { xs:"auto"},
    options: [
      { v: "",            l: "All Department" },
      { v: "engineering", l: "Engineering"    },
      { v: "design",      l: "Design"         },
      { v: "qa",          l: "QA"             },
      { v: "hr",          l: "HR"             },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: "auto" },
  },
],
task_completion: ({ projects = [] }) => [
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs: "auto" },
    options: [
      { v: "", l: "All Projects" },
      ...projects.map((p) => ({ v: p._id, l: p.projectName })),
    ],
  },
 
],
project_performance: [
  {
    type: "search",
    key: "search",
    placeholder: "Search projects...",
    grid: { xs: "auto" },
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: "auto" },
    options: [
      { v: "",            l: "All Status"   },
      { v: "new",         l: "New"          },
      { v: "in_progress", l: "In Progress"  },
      { v: "paused",      l: "Paused"       },
      { v: "completed",   l: "Completed"    },
    ],
  },
],

leave_report: ({ employees = [] }) => [
  {
    type: "select",
    key: "employee",
    placeholder: "All Employee",
    grid: { xs: "auto" },
    options: [
      { v: "", l: "All Employee" },
      ...employees.map((e) => ({ v: e._id, l: e.fullName })),
    ],
  },
  {
    type: "select",
    key: "leaveType",
    placeholder: "All Leave Type",
    grid: { xs: "auto" },
    options: [
      { v: "",          l: "All Leave Type" },
      { v: "annual",    l: "Annual"         },
      { v: "sick",      l: "Sick"           },
      { v: "casual",    l: "Casual"         },
      { v: "maternity", l: "Maternity"      },
      { v: "emergency", l: "Emergency"      },
    ],
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: "auto" },
    options: [
      { v: "",         l: "All Status" },
      { v: "pending",  l: "Pending"    },
      { v: "approved", l: "Approved"   },
      { v: "rejected", l: "Rejected"   },
    ],
  },
],

integrations: [
  {
    type: "search",
    key: "search",
    placeholder: "Search projects...",
    grid: { xs: 12, md: 9 },
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",              l: "All Status"    },
      { v: "connected",     l: "Connected"     },
      { v: "not_connected", l: "Not Connected" },
    ],
  },
],
attendance_monitoring: ({ employees = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search employee...",
    grid: { xs: 12, md: 3 },
  },
  {
    type: "select",
    key: "department",
    placeholder: "All Department",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",            l: "All Department" },
      { v: "engineering", l: "Engineering"    },
      { v: "design",      l: "Design"         },
      { v: "qa",          l: "QA"             },
      { v: "hr",          l: "HR"             },
    ],
  },
  {
    type: "select",
    key: "employee",
    placeholder: "All Employees",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "", l: "All Employees" },
      ...employees.map((e) => ({ v: e._id || e.empId, l: e.fullName || e.name })),
    ],
  },
  {
    type: "monthyear",   
    key: "monthYear",
    placeholder: "Month & Year",
    grid: { xs: 12, md: 5 },
  },
],
attendance_detail: [
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: 12, md: 6 },
    options: [
      { v: "",         l: "All Status" },
      { v: "Present",  l: "Present"    },
      { v: "Absent",   l: "Absent"     },
      { v: "Late",     l: "Late"       },
      { v: "Leave",    l: "Leave"      },
      { v: "Off-Day",  l: "Weekend / Off-Day" },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date",
    grid: { xs: 12, md: 6 },
  },
],
leave_management: [
  {
    type: "search",
    key: "search",
    placeholder: "Search employee...",
    grid: { xs: 12, md: 4 },
  },
  {
    type: "select",
    key: "leaveType",     // ← matches backend query param
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",          l: "All Types"       },
      { v: "sick",      l: "Sick Leave"      },
      { v: "casual",    l: "Casual Leave"    },
      { v: "annual",    l: "Annual Leave"    },
      { v: "maternity", l: "Maternity Leave" },
      { v: "half_day",  l: "Half Day"        },
      { v: "emergency", l: "Emergency Leave" },
    ],
  },
  {
    type: "select",
    key: "status",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",         l: "All Status" },
      { v: "pending",  l: "Pending"    },
      { v: "approved", l: "Approved"   },
      { v: "rejected", l: "Rejected"   },
    ],
  },
 {
  type: "select",
  key: "dateFilter",
  placeholder: "Submitted Date",
  grid: { xs: 12, md: 2 },
  options: [
    { v: "",            l: "All Dates"       },
    { v: "this_week",   l: "This Week"       },
    { v: "this_month",  l: "This Month"      },
    { v: "last_3_months", l: "Last 3 Months" },
    { v: "custom",      l: "Custom Range"    },
  ],
},
// ── Only rendered when "Custom Range" is selected ─────────────────────
{
  type: "date",
  key: "dateFrom",
  placeholder: "From",
  grid: { xs: 12, md: 2 },
  showIf: (v) => v.dateFilter === "custom",
},
{
  type: "date",
  key: "dateTo",
  placeholder: "To",
  grid: { xs: 12, md: 2 },
  showIf: (v) => v.dateFilter === "custom",
  minDateKey: "dateFrom",
},
],

payroll_management: [
  {
    type: "search",
    key: "search",
    placeholder: "Search employee...",
    grid: { xs: 12, md: 7 },
  },
  {
    type: "select",
    key: "department",
   
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",            l: "All Department"         },
      { v: "engineering", l: "Engineering" },
      { v: "design",      l: "Design"      },
      { v: "qa",          l: "QA"          },
      { v: "hr",          l: "HR"          },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: 12, md: 2 },
  },
],
hr_documents: [
  {
    type: "search",
    key: "search",
    placeholder: "Search document name...",
    grid: { xs: 12, md: 9 },
  },
  {
    type: "select",
    key: "type",
    placeholder: "All",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",                      l: "All"                    },
      { v: "employment_contract",   l: "Employment Contract"    },
      { v: "nda",                   l: "NDA"                    },
      { v: "project_documentation", l: "Project Documentation"  },
      { v: "client_agreement",      l: "Client Agreement"       },
      { v: "other",                 l: "Other"                  },
    ],
  },
],
pm_projects: [
  {
    type: "search",
    key: "search",
    placeholder: "Search projects...",
    grid: { xs: 12, md: 9 },
  },
  {
    type: "select",
    key: "status",
   
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",           l: "All Status"         },
      { v: "new",   l: "New"    },
      { v: "in_progress",l: "In Progress" },
      { v: "paused",    l: "Paused"     },
      { v: "completed",  l: "Completed"   },
    ],
  },
],

task_management: ({ projects = [], employees = [], stages = [] }) => [
  {
    type: "search",
    key: "search",
    placeholder: "Search by task title or task ID...",
    grid: { xs: 12, md: 3 },
  },
  {
    type: "select",
    key: "project",
    placeholder: "Select Project",
    grid: { xs: 12, md: 3 },
    options: [
      ...projects.map((p) => ({ v: p._id, l: p.projectName })),
    ],
  },
  {
    type: "select",
    key: "assignee",
    placeholder: "All Assignees",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "", l: "All Assignees" },
     ...employees.map((e) => ({ v: e._id, l: e.fullName || e.name || "" })),

    ],
  },
  {
    type: "select",
    key: "priority",
    placeholder: "All Priority",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",       l: "All Priority" },
      { v: "low",    l: "Low"          },
      { v: "medium", l: "Medium"       },
      { v: "high",   l: "High"         },
    ],
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Task Status",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "", l: "All Task Status" },
      ...stages.map((s) => ({ v: s.id, l: s.label })),
    ],
  },
],

team_performance: [
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs: "auto" },
    options: [
      { v: "",           l: "All Projects"         },
      { v: "ecommerce",  l: "E-Commerce Platform"  },
      { v: "hr",         l: "HR Management System" },
      { v: "mobile",     l: "Mobile Banking App"   },
      { v: "cms",        l: "CMS Website Redesign" },
    ],
  },
  {
    type: "date",
    key: "from",
    placeholder: "From",
    grid: { xs: "auto" },
  },
],

emp_my_tasks: ({ projects = [], stages = [] }) => [    
  {
    type: "search",
    key: "search",
    placeholder: "Search by task title or task ID...",
    grid: { xs: 12, md: 3 },
    disabledIf: (v) => !v.project,
  },
   {
    type: "select",
    key: "project",
    placeholder: "Select Project",
    grid: { xs: 12, md: 3 },
    options: [
     
      ...projects.map((p) => ({ v: p._id, l: p.projectName })),  // ← real API data
    ],
  },
 {
    type: "select",
    key: "status",
    placeholder: "All Task Pipeline Status",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "", l: "All Task Pipeline Status" },
      ...stages.map((s) => ({ v: s.id, l: s.label })),
    ],
    disabledIf: (v) => !v.project,
  },
  {
    type: "select",
    key: "priority",
    placeholder: "All Priority",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",       l: "All Priority" },
      { v: "low",    l: "Low"          },
      { v: "medium", l: "Medium"       },
      { v: "high",   l: "High"         },
    ],
    disabledIf: (v) => !v.project,
  },

 
],
salary_history: [
  {
    type: "year",
    key: "year",
    placeholder: "Select Year",
    grid: { xs: 12, md: 4 },
  },
],

emp_leave_requests: [
  {
    type: "monthyear",
    key: "monthYear",
    placeholder: "Select Month",
    grid: { xs: 12, md: 3 },
  },
],

 
holidays: [
  {
    type: "search",
    key: "search",
    placeholder: "Search holiday name...",
    grid: { xs: 12, md: 4 },
  },
  {
    type: "select",
    key: "type",
    placeholder: "All Types",
    grid: { xs: 12, md: 4 },
    options: [
      { v: "",          l: "All Types"  },
      { v: "public",    l: "Public"     },
      { v: "religious", l: "Religious"  },
      { v: "national",  l: "National"   },
      { v: "company",   l: "Company"    },
      { v: "optional",  l: "Optional"   },
    ],
  },
  {
    type: "year",
    key: "year",
    placeholder: "All Years",
    grid: { xs: 12, md: 4 },
  },
],

    // ── Full (default fallback) ───────────────────────────────────────────────
    full: [
      {
        type: "search",
        key: "query",
        placeholder: "Search...",
        grid: { xs: 12, md: 4 },
      },
      {
        type: "select",
        key: "status",
        placeholder: "All Status",
        grid: { xs: 12, md: 4 },
        options: [
          { v: "active", l: "Active" },
          { v: "inactive", l: "Inactive" },
        ],
      },
    ],
  };

  const fields =
    typeof configs[mode] === "function"
      ? configs[mode]({ managers, departments, roles, projectTypes, employees, projects, isPM,isEmployee, stages, categories })
      : configs[mode] || configs.full;

  // ── Only render fields whose showIf (if present) passes for current values ──
  const visibleFields = fields.filter((f) => !f.showIf || f.showIf(values));

   return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" gap={2} alignItems="center">
        <Grid container spacing={2} width="100%">
          {visibleFields.map((f, i) => {
            const isDisabled = f.disabledIf ? f.disabledIf(values) : !!f.disabled;
            return (
            <Grid key={f.key || i} item size={f.grid}>
              {f.type === "search" && (
                <TextInput
                  placeholder={f.placeholder}
                  fullWidth
                  inputBgColor={f.inputBgColor ?? "#fff"}
                  height="45px"
                  InputStartIcon={<Search size={18} color="#808080" />}
                  value={values[f.key] || ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  disabled={isDisabled}
                />
              )}
              {f.type === "select" && (
                <CustomSelect
                  placeholder={f.placeholder}
                  fullWidth
                  inputBgColor={f.inputBgColor ?? "#fff"}
                  height="45px"
                  value={values[f.key] || ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  isDisabled={isDisabled}
                >
                  {f.options.map((op) => (
                    <MenuItem key={op.v} value={op.v}>
                      {op.l}
                    </MenuItem>
                  ))}
                </CustomSelect>
              )}
 {f.type === "date" && (
  <DatePicker
    value={values[f.key] || null}
    onChange={(v) => setVal(f.key, v)}
    minDate={f.minDateKey && values[f.minDateKey] ? new Date(values[f.minDateKey]) : new Date(2000, 0, 1)}
    maxDate={new Date(new Date().getFullYear(), 11, 31)}
    sx={{
      ...GlobalStyle.datePickerStyle,
      "& input": {
        color: values[f.key] ? "inherit" : "transparent",
      },
      "& input::placeholder": {
        color: "#9CA3AF",
        opacity: 1,
        visibility: "visible",
      },
    }}
    slotProps={{
      textField: {
        label: "",
        fullWidth: true,
        inputProps: {
          placeholder: f.placeholder,
        },
      },
      popper: { sx: GlobalStyle.datePickerPopperSx },
    }}
  />
)}
    {f.type === "monthyear" && (
  <DatePicker
    views={["year", "month"]}
    openTo="month"
    value={values[f.key] || null}
    onChange={(v) => setVal(f.key, v)}
    minDate={new Date(2000, 0, 1)}
    maxDate={new Date(new Date().getFullYear(), 11, 31)}
    sx={{
      ...GlobalStyle.datePickerStyle,
      "& input": {
        color: values[f.key] ? "inherit" : "transparent",
      },
      "& input::placeholder": {
        color: "#9CA3AF",
        opacity: 1,
        visibility: "visible",
      },
    }}
    slotProps={{
      textField: {
        label: "",
        fullWidth: true,
        inputProps: { placeholder: f.placeholder },
      },
      popper: {
        sx: {
          "& [role='radio'][aria-checked='true']": {
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%) !important",
            color: "#ffffff !important",
          },
        },
      },
    }}
  />
)}
    {f.type === "year" && (
    <DatePicker
      views={["year"]}
      openTo="year"
      value={values[f.key] || null}
      onChange={(v) => setVal(f.key, v)}
      minDate={new Date(2000, 0, 1)}
      maxDate={new Date(new Date().getFullYear(), 11, 31)}     
      sx={{ ...GlobalStyle.datePickerStyle, "& input": { color: values[f.key] ? "inherit" : "transparent" } }}
      slotProps={{
        textField: { label: "", fullWidth: true, inputProps: { placeholder: f.placeholder } },
        popper: { sx: GlobalStyle.datePickerPopperSx },
      }}
    />
  )}
            </Grid>
            );
          })}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Filter;