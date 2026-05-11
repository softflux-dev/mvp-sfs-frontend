import { useState } from "react";
import { Box }       from "@mui/material";

import Filter         from "../../../components/filterBar/filter";
import PaginatedTable from "../../../components/dynamicTable";
import ViewIcon       from "../../../assets/icons/view.svg";
import EditIcon       from "../../../assets/icons/editIcon.svg";
import EditAttendanceDialog from "./editAttendanceDialog";

const tableHeader = [
   { id: "empId",       label: "ID"           },
  { id: "name",        label: "Employee"     },
  { id: "department",       label: "Department" },
  { id: "date",             label: "Date"       },
  { id: "checkIn",          label: "Check-In"   },
  { id: "checkOut",         label: "Check-Out"  },
  { id: "hours",            label: "Hours"      },
  { id: "attendanceStatus", label: "Status"     },
  { id: "notes",            label: "Notes"      },
  { id: "actions",          label: "Actions"    },
];

const displayRows = [
  "empId",
  "employee_details", 
  "department",
  "att_mon_date",
  "att_mon_check_in",
  "att_mon_check_out",
  "att_mon_hours",
  "att_mon_status",
  "att_mon_notes",
  "att_rec_actions",   // ← new case with view + edit
];

const AttendanceRecordsTab = ({ records = [], onView, onRecordsChange }) => {
  const [filters,     setFilters]     = useState({});
  const [editOpen,    setEditOpen]    = useState(false);
  const [editingRow,  setEditingRow]  = useState(null);

  const filteredData = records.filter((row) => {
    const search = filters.search?.toLowerCase() || "";
    const status = filters.status || "";
    const matchSearch = !search || row.name.toLowerCase().includes(search);
    const matchStatus = !status || row.attendanceStatus.toLowerCase() === status;
    return matchSearch && matchStatus;
  });

  const handleEditSave = (updated) => {
    onRecordsChange((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setEditOpen(false);
    setEditingRow(null);
  };

  return (
    <>
      <Box mt={2}>
        <Filter mode="attendance_monitoring" onFilterChange={setFilters} />
      </Box>

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={false}
          viewIcon={ViewIcon}
          editIcon={EditIcon}
          onViewClick={onView}
          onEditClick={(row) => { setEditingRow(row); setEditOpen(true); }}
        />
      </Box>

      <EditAttendanceDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingRow(null); }}
        record={editingRow}
        onSave={handleEditSave}
      />
    </>
  );
};

export default AttendanceRecordsTab;