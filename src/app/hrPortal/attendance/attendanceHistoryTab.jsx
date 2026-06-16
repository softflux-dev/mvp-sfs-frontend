// hrPortal/attendance/attendanceHistoryTab.jsx — FULL REPLACEMENT
import { useRef, useState } from "react";
import { Box } from "@mui/material";

import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import { downloadImportFileApi, deleteImportBatchApi } from "../../../api/modules/attendance";

const tableHeader = [
  { id: "date",      label: "Date"       },
  { id: "timestamp", label: "Time Stamp" },
  { id: "fileName",  label: "File Name"  },
  { id: "fileSize",  label: "File Size"  },
  { id: "records",   label: "Records"    },
  { id: "status",    label: "Status"     },
  { id: "actions",   label: "Actions"    },
];

const displayRows = [
  "imp_date",
  "imp_timestamp",
  "imp_file_name",
  "imp_file_size",
  "imp_records",
  "imp_status",
  "imp_actions",
];

const AttendanceHistoryTab = ({ logs = [], loading = false, onLogsChange }) => {
  const confirmRef = useRef();
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  // ── Download the original uploaded sheet ───────────────────────────────
  const handleDownload = async (row) => {
    try {
      const res = await downloadImportFileApi(row.id);
      if (res?.status === 200) {
        const blob = new Blob([res.data]);
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = row.fileName || "attendance_import.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setApiError("Could not download the original file for this import.");
      }
    } catch {
      setApiError("Could not download the original file for this import.");
    }
  };

  // ── Delete an import batch + its attendance records ────────────────────
  const handleDelete = (row) => {
    confirmRef.current?.open({
      title: "Delete Import Record?",
      description: `This will permanently delete "${row.fileName}" and all ${row.records} attendance record(s) created from it. This cannot be undone.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const res = await deleteImportBatchApi(row.id);
          if (res?.status === 200 || res?.status === 201) {
            onLogsChange?.((prev) => prev.filter((l) => l.id !== row.id));
            setSuccessMsg(res.data?.message || "Import deleted successfully.");
            setShowSuccess(true);
          } else {
            setApiError(res?.data?.message || "Failed to delete import record.");
          }
        } catch {
          setApiError("Failed to delete import record.");
        }
      },
    });
  };

  return (
    <>
      {apiError && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Box component="span" sx={{ fontSize: "13px", color: "#DC2626" }}>{apiError}</Box>
        </Box>
      )}

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={logs}
          displayRows={displayRows}
          isLoading={loading}
          onDownloadClick={handleDownload}
          onDeleteClick={handleDelete}
        />
      </Box>

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AttendanceHistoryTab;