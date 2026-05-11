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
  managers = [],   // pass from parent when needed
  resetKey = 0,
}) => {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (resetKey > 0) {
      setValues({});
      if (onFilterChange) onFilterChange({});
    }
  }, [resetKey, onFilterChange]);

  const setVal = (key, val) => {
    const newValues = { ...values, [key]: val };
    setValues(newValues);
    if (onFilterChange) onFilterChange(newValues);
  };

  const configs = {

    // ── Projects page ─────────────────────────────────────────────────────────
    projects: ({ managers = [] }) => [
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
          { v: "", l: "All Status" },
          { v: "development", l: "Development" },
          { v: "testing", l: "Testing" },
          { v: "review", l: "Review" },
          { v: "completed", l: "Completed" },
          { v: "planning", l: "Planning" },
        ],
      },
          {
        type: "select",
        key: "status",
        placeholder: "All Project Types",
        grid: { xs: 12, md: 2 },
        options: [
          { v: "", l: "All Project Types" },
          { v: "development", l: "Development" },
          { v: "seo", l: "SEO" },
          { v: "marketing", l: "Marketing" },

        ],
      },
      {
        type: "select",
        key: "manager",
        placeholder: "All Manager",
        grid: { xs: 12, md: 2.5 },
       options: [
      { v: "", l: "All Manager" },
      { v: "jon", l: "Jon" },
      { v: "peter", l: "Peter" },
      { v: "sarah", l: "Sarah" },
    ],
      },
      {
        type: "date",
        key: "dateRange",
        placeholder: "Date Range",
        grid: { xs: 12, md: 2 },
      },
    ],

    
    // ── Tasks ─────────────────────────────────────────────────────────────
    tasks: [
      {
        type: "search",
        key: "search",
        placeholder: "Search Projects...",
        grid: { xs: 12, md: 3 },
      },
      {
        type: "select",
        key: "status",
        placeholder: "All Status",
        grid: { xs: 12, md: 3 },
        options: [
          { v: "", l: "All Status" },
          { v: "planning",    l: "Planning"    },
          { v: "development", l: "Development" },
          { v: "testing",     l: "Testing"     },
          { v: "review",      l: "Review"      },
          { v: "completed",   l: "Completed"   },
        ],
      },
      {
        type: "select",
        key: "assignee",
        placeholder: "All Assignees",
        grid: { xs: 12, md: 3 },
        options: [
          { v: "", l: "All Assignees" },
          { v: "sarah", l: "Sarah" },
          { v: "jon",   l: "Jon"   },
          { v: "peter", l: "Peter" },
        ],
      },
      {
        type: "select",
        key: "priority",
        placeholder: "All Priority",
        grid: { xs: 12, md: 3 },
        options: [
          { v: "", l: "All Priority" },
          { v: "high",   l: "High"   },
          { v: "medium", l: "Medium" },
          { v: "low",    l: "Low"    },
        ],
      },
    ],

     // ── Team ──────────────────────────────────────────────────────────────
    team: [
      {
        type: "search",
        key: "search",
        placeholder: "Search Projects...",
        grid: { xs: 12, md: 8 },
      },
      {
        type: "select",
        key: "employee",
        placeholder: "Select Employee",
        grid: { xs: 12, md: 4 },
        options: [
          { v: "", l: "Select Employee" },
          { v: "sarah_chen",      l: "Sarah Chen"      },
          { v: "marcus_johnson",  l: "Marcus Johnson"  },
          { v: "emily_rodriguez", l: "Emily Rodriguez" },
        ],
      },
    ],

    // ── Documents ─────────────────────────────────────────────────────────────
  documents: [
    {
      type: "search",
      key: "search",
      placeholder: "Search employees...",
      grid: { xs: 12, md: 8 },
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
      key: "role",
      placeholder: "All Role",
      grid: { xs: 12, md: 1 },
      options: [
        { v: "",               l: "All Role"       },
        { v: "developer",      l: "Developer"      },
        { v: "designer",       l: "Designer"       },
        { v: "qa_tester",      l: "QA Tester"      },
        { v: "project_manager",l: "Project Manager"},
        { v: "hr_manager",     l: "HR Manager"     },
      ],
    },
    {
      type: "select",
      key: "status",
      placeholder: "All Status",
      grid: { xs: 12, md: 1 },
      options: [
        { v: "",         l: "All Status" },
        { v: "active",   l: "Active"     },
        { v: "inactive", l: "Inactive"   },
      ],
    },
  ],
 // ── Employees page ────────────────────────────────────────────────────────
  employees: [
    {
      type: "search",
      key: "search",
      placeholder: "Search by name, email or employee ID...",
      grid: { xs: 12, md: 6 },
    },
    {
      type: "select",
      key: "department",
      placeholder: "All Department",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "",            l: "All Departments"         },
        { v: "engineering", l: "Engineering" },
        { v: "design",      l: "Design"      },
        { v: "qa",          l: "QA"          },
        { v: "hr",          l: "HR"          },
      ],
    },
    {
      type: "select",
      key: "role",
      placeholder: "All Role",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "all",                l: "All Roles"             },
        { v: "super_admin",       l: "Super Admin"       },
        { v: "hr_manager",   l: "HR Manager"   },
        { v: "project_manager", l: "Project Manager" },
        { v: "developer",       l: "Developer"       },
        { v: "designer",        l: "Designer"        },
        { v: "qa_tester",       l: "QA Tester"       },
      ],
    },
    {
      type: "select",
      key: "status",
      placeholder: "All Status",
      grid: { xs: 12, md: 2 },
      options: [
        { v: "",         l: "All Status"      },
        { v: "active",   l: "Active"   },
        { v: "inactive", l: "Inactive" },
      ],
    },
  ],

   employee_tasks: [
     {
       type: "search",
       key: "search",
       placeholder: "Search Projects...",
       grid: { xs: 12, md: 8 },
     },
     {
       type: "select",
       key: "status",
       placeholder: "All Status",
       grid: { xs: 12, md: 4 },
       options: [
         { v: "",            l: "All Status"   },
         { v: "in_progress", l: "In Progress"  },
         { v: "completed",   l: "Completed"    },
       ],
     },
   ],

   performance: [
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
        { v: "",               l: "All Department"  },
        { v: "Engineering",    l: "Engineering"     },
        { v: "Design",         l: "Design"          },
        { v: "QA",             l: "QA"              },
        { v: "HR",             l: "HR"              },
        { v: "UI/UX Designer", l: "UI/UX Designer"  },
      ],
    },
    {
      type: "date",
      key: "dateRange",
      placeholder: "Date Range",
      grid: { xs: 12, md: 3 },
    },
  ],
  documents: [
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
task_completion: [
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs:"auto"},
    options: [
      { v: "",            l: "All Projects" },
        { v: "ecommerce", l: "E-Commerce Platform" },
        { v: "hr",        l: "HR Management System" },
        { v: "mobile",    l: "Mobile Banking App" },
        { v: "cms",       l: "CMS Website Redesign" },
    ],
  },
  
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: "auto" },
  },
],
project_performance: [
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: "auto" },
    options: [
      { v: "",            l: "All Status"   },
      { v: "development", l: "Development"  },
      { v: "testing",     l: "Testing"      },
      { v: "review",      l: "Review"       },
      { v: "completed",   l: "Completed"    },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: "auto" },
  },
],

leave_report: [
  {
    type: "select",
    key: "employee",
    placeholder: "All Employee",
    grid: { xs: "auto" },
    options: [
      { v: "",        l: "All Employee" },
      { v: "ali",     l: "Ali Hassan"   },
      { v: "sara",    l: "Sara Ahmed"   },
      { v: "omar",    l: "Omar Farooq"  },
      { v: "fatima",  l: "Fatima Khan"  },
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
attendance_monitoring: [
  {
    type: "search",
    key: "search",
    placeholder: "Search employee...",
    grid: { xs: 12, md: 4 },
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
    type: "select",
    key: "status",
    
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",        l: "All Status"     },
      { v: "present", l: "Present" },
      { v: "absent",  l: "Absent"  },
      { v: "late",    l: "Late"    },
      { v: "leave",   l: "Leave"   },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: 12, md: 2 },
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
    key: "type",
  
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",               l: "All Types"            },
      { v: "full_day",       l: "Full Day"        },
      { v: "short_leave",    l: "Short Leave"     },
      { v: "sick_leave",     l: "Sick Leave"      },
      { v: "emergency_leave",l: "Emergency Leave" },
    ],
  },
  {
    type: "select",
    key: "status",
    
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",         l: "All Status"      },
      { v: "approved", l: "Approved" },
      { v: "rejected", l: "Rejected" },
      { v: "pending",  l: "Pending"  },
    ],
  },
  {
    type: "date",
    key: "dateRange",
    placeholder: "Date Range",
    grid: { xs: 12, md: 2 },
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
      { v: "planning",   l: "Planning"    },
      { v: "in_progress",l: "In Progress" },
      { v: "on_hold",    l: "On Hold"     },
      { v: "completed",  l: "Completed"   },
    ],
  },
],

task_management: [
  {
    type: "search",
    key: "search",
    placeholder: "Search projects...",
    grid: { xs: 12, md: 3 },
  },
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",           l: "All Projects"          },
      { v: "ecommerce",  l: "E-Commerce Platform"   },
      { v: "healthcare", l: "Healthcare Portal"      },
      { v: "crm",        l: "CRM Dashboard"         },
      { v: "mobile",     l: "Mobile Banking App"    },
    ],
  },
  {
    type: "select",
    key: "assignee",
    placeholder: "All Assignees",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",        l: "All Assignees" },
      { v: "sarah",   l: "Sarah Chen"    },
      { v: "marcus",  l: "Marcus Webb"   },
      { v: "priya",   l: "Priya Patel"   },
      { v: "jake",    l: "Jake Morrison" },
    ],
  },
  {
    type: "select",
    key: "priority",
    placeholder: "All Priority",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",       l: "All priority" },
      { v: "low",    l: "Low"          },
      { v: "medium", l: "Medium"       },
      { v: "high",   l: "High"         },
    ],
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: 12, md: 2 },
    options: [
      { v: "",            l: "All"         },
      { v: "planning",    l: "Planning"    },
      { v: "in_progress", l: "In Progress" },
      { v: "on_hold",     l: "On Hold"     },
      { v: "completed",   l: "Completed"   },
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
emp_my_tasks:
[
    {
    type: "search",
    key: "search",
    placeholder: "Search tasks...",
    grid: { xs: 12, md: 3 },
  },
  {
    type: "select",
    key: "status",
    placeholder: "All Status",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",           l: "All Status"          },
      { v: "new",  l: "New"   },
      { v: "in_progress", l: "In Progress"      },
      { v: "review",        l: "Under Review"         },
      { v: "assigned",     l: "Assigned"    },
      { v: "completed",     l: "Completed"   },
    ],
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
  },
  {
    type: "select",
    key: "project",
    placeholder: "All Projects",
    grid: { xs: 12, md: 3 },
    options: [
      { v: "",           l: "All Projects"          },
      { v: "ecommerce",  l: "E-Commerce Platform"   },
      { v: "healthcare", l: "Healthcare Portal"      },
      { v: "crm",        l: "CRM Dashboard"         },
      { v: "mobile",     l: "Mobile Banking App"    },
    ],
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
      ? configs[mode]({ managers })
      : configs[mode] || configs.full;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" gap={2} alignItems="center">
        <Grid container spacing={2} width="100%">
          {fields.map((f, i) => (
            <Grid key={i} item size={f.grid}>
              {f.type === "search" && (
                <TextInput
                  placeholder={f.placeholder}
                  fullWidth
                  inputBgColor={f.inputBgColor ?? "#fff"}
                  height="45px"
                  InputStartIcon={<Search size={18} color="#808080" />}
                  value={values[f.key] || ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
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
                  isDisabled={f.disabled}
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
                }}
              />
            )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Filter;