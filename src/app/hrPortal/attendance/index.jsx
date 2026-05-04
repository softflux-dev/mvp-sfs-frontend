import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText    from "../../../components/headerText";
import CustomButton  from "../../../components/customButton";
import Filter        from "../../../components/filterBar/filter";
import PaginatedTable from "../../../components/dynamicTable";
import viewIcon      from "../../../assets/icons/view.svg";
import ExportIcon  from "../../../assets/icons/download-icon-white.svg";
import EmployeeAttendanceDialog from "./employeeAttendanceDialog";

const mockAttendance = [
  { id: 1,  name: "Sarah Johnson",   avatar: "", department: "Engineering", date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""              },
  { id: 2,  name: "James Chen",      avatar: "", department: "Design", date: "Jun 29, 2026", checkIn: "",          checkOut: "",          hours: "",      attendanceStatus: "Absent",  notes: ""              },
  { id: 3,  name: "Aisha Patel",     avatar: "", department: "Engineering", date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Late",    notes: "Traffic delay" },
  { id: 4,  name: "Michael Williams",avatar: "", department: "QA", date: "Jun 29, 2026", checkIn: "",          checkOut: "",          hours: "",      attendanceStatus: "Absent",  notes: ""              },
  { id: 5,  name: "Priya Garcia",    avatar: "", department: "HR", date: "Jun 29, 2026", checkIn: "",          checkOut: "",          hours: "",      attendanceStatus: "Leave",   notes: "Approved leave"},
  { id: 6,  name: "David Kim",       avatar: "", department: "Design", date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""              },
  { id: 7,  name: "Maria Brown",     avatar: "", department: "QA", date: "Jun 29, 2026", checkIn: "",          checkOut: "",          hours: "",      attendanceStatus: "Absent",  notes: ""              },
  { id: 8,  name: "Chen Singh",      avatar: "", department: "HR", date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""              },
  { id: 9,  name: "Omar Ahmed",      avatar: "", department: "Engineering", date: "Jun 29, 2026", checkIn: "",          checkOut: "",          hours: "",      attendanceStatus: "Leave",   notes: "Approved leave"}
];
  

const tableHeader = [
  { id: "name",             label: "Employee"  },
  { id: "department",  label: "Department"   },
  { id: "date",             label: "Date"      },
  { id: "checkIn",          label: "Check-In"  },
  { id: "checkOut",         label: "Check-Out" },
  { id: "hours",            label: "Hours"     },
  { id: "attendanceStatus", label: "Status"    },
  { id: "notes",            label: "Notes"     },
  { id: "actions",          label: "Actions"   },
];

const displayRows = [
  "att_mon_employee",
  "department",
  "att_mon_date",
  "att_mon_check_in",
  "att_mon_check_out",
  "att_mon_hours",
  "att_mon_status",
  "att_mon_notes",
  "att_mon_view",
];

const AttendanceMonitoring = () => {
  const [filters, setFilters] = useState({});
  const [viewOpen,    setViewOpen]    = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const filteredData = mockAttendance.filter((row) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";
    const matchSearch = !search || row.name.toLowerCase().includes(search);
    const matchStatus = !status || row.attendanceStatus.toLowerCase() === status;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Attendance Monitoring"
            subtitle="Track and manage employee attendance records"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Export PDF"
              variant="gradient"
              startIcon={
                <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
              }
              handlePressBtn={() => console.log("Export PDF")}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="attendance_monitoring" onFilterChange={setFilters} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={false}
          viewIcon={viewIcon}
          onViewClick={(row) => { setSelectedEmp(row); setViewOpen(true); }}
        />
      </Box>

      <EmployeeAttendanceDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedEmp(null); }}
        employee={selectedEmp || {}}
        />
    </>
  );
};

export default AttendanceMonitoring;