import { useState } from "react";
import { Box, Grid } from "@mui/material";
import { Upload }    from "lucide-react";

import HeaderText    from "../../../components/headerText";
import CustomButton  from "../../../components/customButton";
import CustomTabs    from "../../../components/tabs";
import ExportIcon    from "../../../assets/icons/download-icon-white.svg";
import EmployeeAttendanceDialog from "./employeeAttendanceDialog";
import AttendanceRecordsTab     from "./attendanceRecordsTab";
import AttendanceHistoryTab     from "./attendanceHistoryTab";

const tabs = [
  { id: 1, label: "Attendance Records" },
  { id: 2, label: "Attendance History"     },
];

const DEFAULT_RECORDS = [
  { id: 1,  empId: "EMP001",name: "Sarah Johnson",    avatar: "", department: "Engineering", designation: "Senior Developer", date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""               },
  { id: 2,  empId: "EMP001",name: "James Chen",       avatar: "", department: "Design",      designation: "Project Manager",  date: "Jun 29, 2026", checkIn: "",         checkOut: "",         hours: "",     attendanceStatus: "Absent",  notes: ""               },
  { id: 3, empId: "EMP001", name: "Aisha Patel",      avatar: "", department: "Engineering", designation: "Project Manager",  date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Late",    notes: "Traffic delay"  },
  { id: 4,  empId: "EMP001", name: "Michael Williams", avatar: "", department: "QA",           designation: "QA", date: "Jun 29, 2026", checkIn: "",         checkOut: "",         hours: "",     attendanceStatus: "Absent",  notes: ""               },
  { id: 5,  empId: "EMP001",name: "Priya Garcia",     avatar: "", department: "HR",          designation: "Project Manager",  date: "Jun 29, 2026", checkIn: "",         checkOut: "",         hours: "",     attendanceStatus: "Leave",   notes: "Approved leave" },
  { id: 6,  empId: "EMP001",name: "David Kim",        avatar: "", department: "Design",      designation: "UI/UX Designer",  date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""               },
  { id: 7, empId: "EMP001", name: "Maria Brown",      avatar: "", department: "QA",           designation: "Project Manager", date: "Jun 29, 2026", checkIn: "",         checkOut: "",         hours: "",     attendanceStatus: "Absent",  notes: ""               },
  { id: 8,  empId: "EMP001",name: "Chen Singh",       avatar: "", department: "HR",          designation: "Project Manager",  date: "Jun 29, 2026", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8.5h", attendanceStatus: "Present", notes: ""               },
  { id: 9,  empId: "EMP001",name: "Omar Ahmed",       avatar: "", department: "Engineering",  designation: "Project Manager", date: "Jun 29, 2026", checkIn: "",         checkOut: "",         hours: "",     attendanceStatus: "Leave",   notes: "Approved leave" },
];

const DEFAULT_LOGS = [
  { id: 1, date: "Jun 29, 2026", timestamp: "10:45 AM", fileName: "attendance_june_w4.csv", fileSize: "124 KB", records: 9,  status: "Success" },
  { id: 2, date: "Jun 22, 2026", timestamp: "09:30 AM", fileName: "attendance_june_w3.csv", fileSize: "118 KB",  records: 43, status: "Success" },
  { id: 3, date: "Jun 15, 2026", timestamp: "11:10 AM", fileName: "attendance_june_w2.csv", fileSize: "132 KB",   records: 0,  status: "Failed"  },
  { id: 4, date: "Jun 8, 2026",  timestamp: "08:55 AM", fileName: "attendance_june_w1.csv", fileSize: "110 KB", records: 41, status: "Success" },
  { id: 5, date: "Jun 1, 2026",  timestamp: "02:20 PM", fileName: "attendance_may_w4.csv",  fileSize: "128 KB",    records: 44, status: "Partial" },
];

const AttendanceMonitoring = () => {
  const [activeTab,   setActiveTab]   = useState(1);
  const [viewOpen,    setViewOpen]    = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [allRecords,  setAllRecords]  = useState(DEFAULT_RECORDS);
  const [importLogs,  setImportLogs]  = useState(DEFAULT_LOGS);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Mock: simulate parsed rows from the uploaded file
      const newRecords = [
        { id: Date.now() + 1, name: "Sara Ahmed",  avatar: "", department: "Engineering", date: "Jul 1, 2026", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9h", attendanceStatus: "Present", notes: "" },
        { id: Date.now() + 2, name: "Jon Williams", avatar: "", department: "Design",     date: "Jul 1, 2026", checkIn: "",         checkOut: "",         hours: "",   attendanceStatus: "Absent",  notes: "" },
      ];

      const newLog = {
        id:         Date.now(),
        date:       new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        timestamp:  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        fileName:   file.name,
        fileSize:   `${(file.size / 1024).toFixed(0)} KB`,
       
        records:    newRecords.length,
        status:     "Success",
      };

      setAllRecords((prev) => [...newRecords, ...prev]);
      setImportLogs((prev)  => [newLog, ...prev]);
    };
    input.click();
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <HeaderText
            title="Attendance Monitoring"
            subtitle="Track and manage employee attendance records"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton
              btnLabel="Import"
              variant="grayOutlined"
              startIcon={<Upload size={15} />}
              handlePressBtn={handleImport}
            />
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

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 1 && (
        <AttendanceRecordsTab
          records={allRecords}
          onView={(row) => { setSelectedEmp(row); setViewOpen(true); }}
          onRecordsChange={setAllRecords}
        />
      )}
      {activeTab === 2 && (
        <AttendanceHistoryTab logs={importLogs} />
      )}

      <EmployeeAttendanceDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedEmp(null); }}
        employee={selectedEmp || {}}
      />
    </>
  );
};

export default AttendanceMonitoring;