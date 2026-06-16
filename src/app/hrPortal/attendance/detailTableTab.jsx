// hrPortal/attendance/attendanceDetail/detailTableTab.jsx — FULL REPLACEMENT
import { useState, useMemo } from "react";
import { Box }               from "@mui/material";

import Filter               from "../../../components/filterBar/filter";
import PaginatedTable       from "../../../components/dynamicTable";
import EditIcon             from "../../../assets/icons/editIcon.svg";
import EditAttendanceDialog from "./editAttendanceDialog";

const tableHeader = [
  { id: "date",             label: "Date"      },
  { id: "checkIn",          label: "Check-In"  },
  { id: "checkOut",         label: "Check-Out" },
  { id: "hours",            label: "Hours"     },
  { id: "attendanceStatus", label: "Status"    },
  { id: "notes",            label: "Notes"     },
  { id: "actions",          label: "Actions"   },
];

const displayRows = [
  "att_mon_date",
  "att_mon_check_in",
  "att_mon_check_out",
  "att_mon_hours",
  "att_mon_status",
  "att_mon_notes",
  "att_detail_actions",
];

const DetailTableTab = ({
  dailyRecords  = [],
  loading       = false,
  actionLoading = false,
  onEditSave,          // async (updated) → called for real API save
  onRecordsChange,     // local fallback state updater
}) => {
  const [editOpen,   setEditOpen]   = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [filters,    setFilters]    = useState({});

  const filteredRecords = useMemo(() => {
    return dailyRecords.filter((row) => {
      const status    = filters.status || "";
      const matchStatus = !status || row.attendanceStatus === status;
      let matchDate = true;
      if (filters.dateRange) {
        const rowDate    = new Date(row.date);
        const filterDate = new Date(filters.dateRange);
        matchDate =
          rowDate.getFullYear() === filterDate.getFullYear() &&
          rowDate.getMonth()    === filterDate.getMonth()    &&
          rowDate.getDate()     === filterDate.getDate();
      }
      return matchStatus && matchDate;
    });
  }, [dailyRecords, filters]);

  const handleEditSave = async (updated) => {
    setSaving(true);
    if (onEditSave) {
      // Real API path — hook updates records state internally
      const result = await onEditSave(updated);
      if (result?.success) {
        setEditOpen(false);
        setEditingRow(null);
      }
    } else {
      // Local fallback (mock mode)
      onRecordsChange?.((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      setEditOpen(false);
      setEditingRow(null);
    }
    setSaving(false);
  };

  return (
    <>
      <Box mt={2}>
        <Filter mode="attendance_detail" onFilterChange={setFilters} />
      </Box>

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredRecords}
          displayRows={displayRows}
          isLoading={loading}
          editIcon={EditIcon}
          onEditClick={(row) => { setEditingRow(row); setEditOpen(true); }}
          actionLoading={actionLoading || saving}
        />
      </Box>

      <EditAttendanceDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingRow(null); }}
        record={editingRow}
        onSave={handleEditSave}
        loading={saving}
      />
    </>
  );
};

export default DetailTableTab;