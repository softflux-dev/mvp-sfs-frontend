// hrPortal/attendance/attendanceRecordsTab.jsx 
import { useState, useMemo } from "react";
import { Box }               from "@mui/material";

import Filter         from "../../../components/filterBar/filter";
import PaginatedTable from "../../../components/dynamicTable";
import ViewIcon       from "../../../assets/icons/view.svg";

const tableHeader = [
  { id: "empId",         label: "Emp ID"              },
  { id: "name",          label: "Employee"            },
  { id: "department",    label: "Department"          },
  { id: "month",         label: "Month"                },
   { id: "onSiteHours",   label: "Work Hours On-Site"  },
  { id: "offSiteHours",  label: "Work Hours Off-Site" },
  { id: "extraHours",    label: "Extra Hours"         },
  { id: "totalHours",    label: "Total Hours"         },
  { id: "totalPresent",  label: "Total Present"       },
  { id: "totalAbsent",   label: "Total Absent"        },
  { id: "actions",       label: "Actions"             },
];

const displayRows = [
  "empId",
  "employee_details",
  "department",
  "att_summary_month",
  "att_summary_onsite_hours",
  "att_summary_offsite_hours",
  "att_summary_extra_hours",
  "att_summary_hours",
  "att_summary_present",
  "att_summary_absent",
  "att_summary_actions",
];

const AttendanceRecordsTab = ({ records = [], loading = false, onView, onFilterChange }) => {
  const [filters, setFilters] = useState({});

  const employees = useMemo(() => {
    const seen = new Map();
    records.forEach((r) => {
      if (!seen.has(r.empId)) seen.set(r.empId, { _id: r.empId, fullName: r.name });
    });
    return Array.from(seen.values());
  }, [records]);

 const handleFilterChange = (newFilters) => {
  setFilters(newFilters);

  // ── Compute how many months back the backend needs to look, so a
  // specific older month selected in the filter is actually included in
  // the fetched window (backend only understands "last N months"). ─────
  let months = 3; // default rolling window
  if (newFilters.monthYear) {
    const now = new Date();
    const selMonth = newFilters.monthYear.getMonth();
    const selYear  = newFilters.monthYear.getFullYear();
    const monthsAgo = (now.getFullYear() - selYear) * 12 + (now.getMonth() - selMonth) + 1;
    months = Math.max(3, monthsAgo); // never shrink below the default window
  }

  onFilterChange?.({
    search:     newFilters.search     || "",
    department: newFilters.department || "",
    months,
  });
};

// In filteredData:
const filteredData = records.filter((row) => {
  const search = filters.search?.toLowerCase() || "";
  const dept   = filters.department || "";
  const emp    = filters.employee   || "";
  
  // monthYear is a Date object from the DatePicker
  const selectedMonth = filters.monthYear ? filters.monthYear.getMonth()     : null;  // 0-indexed
  const selectedYear  = filters.monthYear ? filters.monthYear.getFullYear()  : null;

  const matchSearch = !search || row.name.toLowerCase().includes(search) || row.empId?.toLowerCase().includes(search);
  const matchDept   = !dept   || row.department?.toLowerCase() === dept.toLowerCase();
  const matchEmp    = !emp    || row.empId === emp;
  const matchMonth  = selectedMonth === null || row.monthIndex === selectedMonth;
  const matchYear   = !selectedYear           || row.yearNum   === selectedYear;

  return matchSearch && matchDept && matchEmp && matchMonth && matchYear;
});


  return (
    <>
      <Box mt={2}>
        <Filter mode="attendance_monitoring" employees={employees} onFilterChange={handleFilterChange} />
      </Box>

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={loading}
          viewIcon={ViewIcon}
          onViewClick={onView}
        />
      </Box>
    </>
  );
};

export default AttendanceRecordsTab;