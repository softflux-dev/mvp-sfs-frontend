// employees/employeeDetailTabs/attendanceLogTable.jsx
import PaginatedTable from "../../../../components/dynamicTable";

// ── Mock data — replace with real API data ────────────────────────────────────
const mockAttendanceLogs = [
  { id: 1,  date: "Mon, Mar 2",  checkIn: "08:57 am", checkOut: "05:30 pm", hours: "8:33 hrs", attendanceStatus: "Present" },
  { id: 2,  date: "Tue, Mar 3",  checkIn: "08:50 am", checkOut: "05:00 pm", hours: "8:10 hrs", attendanceStatus: "Present" },
  { id: 3,  date: "Wed, Mar 4",  checkIn: "09:45 am", checkOut: "05:00 pm", hours: "7:15 hrs", attendanceStatus: "Late"    },
  { id: 4,  date: "Thu, Mar 5",  checkIn: "—",         checkOut: "—",        hours: "—",         attendanceStatus: "Absent"  },
  { id: 5,  date: "Fri, Mar 6",  checkIn: "08:55 am", checkOut: "05:00 pm", hours: "8:05 hrs", attendanceStatus: "Present" },
  { id: 6,  date: "Sun, Mar 1",  checkIn: "—",         checkOut: "—",        hours: "—",         attendanceStatus: "Weekend" },
  { id: 7,  date: "Mon, Mar 9",  checkIn: "08:57 am", checkOut: "05:30 pm", hours: "8:33 hrs", attendanceStatus: "Present" },
  { id: 8,  date: "Tue, Mar 10", checkIn: "08:50 am", checkOut: "05:00 pm", hours: "8:10 hrs", attendanceStatus: "Present" },
  { id: 9,  date: "Wed, Mar 11", checkIn: "—",         checkOut: "—",        hours: "—",         attendanceStatus: "Leave"   },
  { id: 10, date: "Thu, Mar 12", checkIn: "08:57 am", checkOut: "05:30 pm", hours: "8:33 hrs", attendanceStatus: "Present" },
];

const tableHeader = [
  { id: "date",             label: "Date"      },
  { id: "checkIn",          label: "Check-In"  },
  { id: "checkOut",         label: "Check-Out" },
  { id: "hours",            label: "Hours"     },
  { id: "attendanceStatus", label: "Status"    },
];

// Uses the new cases added to dynamicTable.jsx
const displayRows = [
  "attendance_date",
  "attendance_check_in",
  "attendance_check_out",
  "attendance_hours",
  "attendance_status",
];

const AttendanceLogTable = ({ data = mockAttendanceLogs, isLoading = false }) => {
  return (
    <PaginatedTable
      tableHeader={tableHeader}
      tableData={data}
      displayRows={displayRows}
      isLoading={isLoading}
    />
  );
};

export default AttendanceLogTable;