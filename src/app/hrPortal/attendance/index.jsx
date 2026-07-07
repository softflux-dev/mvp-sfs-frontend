// hrPortal/attendance/index.jsx — FULL REPLACEMENT
import { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography }            from "@mui/material";
import { Upload, AlertTriangle }            from "lucide-react";
import { useNavigate }                      from "react-router-dom";

import HeaderText    from "../../../components/headerText";
import CustomButton  from "../../../components/customButton";
import CustomTabs    from "../../../components/tabs";
import ExportIcon    from "../../../assets/icons/download-icon-white.svg";
import AttendanceRecordsTab   from "./attendanceRecordsTab";
import AttendanceHistoryTab   from "./attendanceHistoryTab";
import ImportAttendanceDialog from "./importAttendanceDialog";
import PartialPunchDialog     from "./partialPunchDialog";
import SuccessPopup           from "../../../components/popups/confirmationDialog";
import { useAttendanceSummary, useAttendanceImport } from "../../../hooks/attendance";
import { getPartialRecordsApi } from "../../../api/modules/attendance";
import { exportAttendancePdf }  from "../../../utils/exportAttendancePdf";
import ExportPdfDialog from "./exportPdfDialog";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const tabs = [
  { id: 1, label: "Attendance Records" },
  { id: 2, label: "Attendance History" },
];

const AttendanceMonitoring = () => {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState(1);
  const [importOpen,   setImportOpen]   = useState(false);
  const [partialOpen,  setPartialOpen]  = useState(false);
  const [partialCount, setPartialCount] = useState(0);
  const [exporting,    setExporting]    = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // ── Import result feedback ────────────────────────────────────────────
  const [importResultOpen, setImportResultOpen] = useState(false);
  const [importResultMsg,  setImportResultMsg]  = useState("");

  const { summary, loading: summaryLoading, error: summaryError, fetchSummary } = useAttendanceSummary();
  const {
    importLogs, setImportLogs, logsLoading, importing, importWarning, importRecords,
  } = useAttendanceImport();

  // ── Check partial count on mount ─────────────────────────────────────────
  const checkPartial = useCallback(async () => {
    try {
      const res = await getPartialRecordsApi();
      if (res?.status === 200 || res?.status === 201) {
        setPartialCount(res.data.data.count || 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { checkPartial(); }, []);

  const handleView = (row) => {
    navigate("/attendance-monitoring/detail", {
      state: {
        employee:   { empId: row.empId, name: row.name, avatar: row.avatar, department: row.department, designation: row.designation },
        employeeId: row.employeeDbId,
        month:      row.monthIndex,
        year:       row.yearNum,
      },
    });
  };

  const handleImport = async ({ month, year, file, records, fileBase64 }) => {
    const result = await importRecords({
      month, year,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      records,
      fileBase64,
    });
    if (result?.success) {
      fetchSummary();
      checkPartial();

      // ── Show clear feedback: first import for this month vs. an update
      // to records that already existed for this month. ───────────────────
      const monthLabel = `${MONTH_NAMES[result.month] ?? month} ${result.year ?? year}`;
      setImportResultMsg(
        result.isFirstImportForMonth
          ? `Attendance uploaded successfully for ${monthLabel}.`
          : `${monthLabel} already had attendance data — existing records have been updated with this new file.`
      );
      setImportResultOpen(true);
    }
  };

  const handleExportPdf = () => setExportDialogOpen(true);

  const handleConfirmExport = ({ records, title }) => {
    if (!records.length) return;
    setExporting(true);
    try {
      exportAttendancePdf(records, { title });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <HeaderText title="Attendance Monitoring" subtitle="Track and manage employee attendance records" />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <CustomButton btnLabel="Import" variant="grayOutlined" startIcon={<Upload size={15} />} handlePressBtn={() => setImportOpen(true)} />
            <CustomButton
              btnLabel={exporting ? "Exporting..." : "Export PDF"}
              variant="gradient"
              startIcon={<img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />}
              handlePressBtn={handleExportPdf}
              isDisabled={exporting || !summary.length}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Partial punch warning — persists until count reaches 0 ─────────── */}
      {partialCount > 0 && (
        <Box mb={2} px={2.5} py={1.75} sx={{
          backgroundColor: "#FFF7E6", borderRadius: "12px", border: "1px solid #FFE0A3",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <AlertTriangle size={18} color="#B45309" style={{ flexShrink: 0 }} />
            <Typography fontSize="13px" color="#B45309" fontWeight={500}>
              {partialCount} employee{partialCount !== 1 ? "s have" : " has"} incomplete punch records
              (missing check-in or check-out). These must be filled in manually.
            </Typography>
          </Box>
          <Box onClick={() => setPartialOpen(true)} sx={{
            px: 2, py: 0.75, borderRadius: "8px", cursor: "pointer", flexShrink: 0,
            backgroundColor: "#B45309", color: "#fff", fontSize: "12px", fontWeight: 600,
            "&:hover": { backgroundColor: "#92400E" },
          }}>
            Review & Fix
          </Box>
        </Box>
      )}

      {summaryError && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{summaryError}</Typography>
        </Box>
      )}

      {importWarning && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#F0F9FF", borderRadius: "10px", border: "1px solid #BAE6FD" }}>
          <Typography sx={{ fontSize: "13px", color: "#0369A1" }}>{importWarning}</Typography>
        </Box>
      )}

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 1 && (
        <AttendanceRecordsTab records={summary} loading={summaryLoading} onView={handleView} onFilterChange={fetchSummary} />
      )}
      {activeTab === 2 && (
        <AttendanceHistoryTab logs={importLogs} loading={logsLoading} onLogsChange={setImportLogs} />
      )}

      <ImportAttendanceDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} loading={importing} />

      <PartialPunchDialog
        open={partialOpen}
        onClose={() => {
          setPartialOpen(false);
          fetchSummary();
        }}
        onCountChange={(newCount) => {
          setPartialCount(newCount);
        }}
      />

      <ExportPdfDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleConfirmExport}
      />
      
      <SuccessPopup
        open={importResultOpen}
        onClose={() => setImportResultOpen(false)}
        message={importResultMsg}
        autoClose
        autoCloseDelay={3000}
      />

    </>
  );
};

export default AttendanceMonitoring;