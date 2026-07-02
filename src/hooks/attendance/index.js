// src/hooks/attendance.js — FULL REPLACEMENT
import { useState, useCallback, useEffect } from "react";
import {
  getAttendanceSummaryApi,
  getAttendanceDetailApi,
  updateAttendanceRecordApi,
  createManualEntryApi,
  importAttendanceApi,
  getImportHistoryApi,
} from "../../api/modules/attendance";

// ── useAttendanceSummary ──────────────────────────────────────────────────────
export const useAttendanceSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAttendanceSummaryApi({ months: 2, ...filters });
      if (res?.status === 200 || res?.status === 201) {
        const raw = res.data.data.summary || [];
        setSummary(raw.map((s) => ({
          ...s,
          id:           `${s.empId}_${s.yearNum}_${s.monthIndex}`,
          employeeDbId: s.employeeDbId || "",
          month:        `${new Date(s.yearNum, s.monthIndex, 1).toLocaleString("default", { month: "short" })} ${s.yearNum}`,
        })));
      } else {
        setError(res?.data?.message || "Failed to fetch attendance.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, []);

  return { summary, loading, error, fetchSummary };
};

// ── useAttendanceDetail ───────────────────────────────────────────────────────
export const useAttendanceDetail = (employeeId, month, year) => {
  const [records,       setRecords]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchDetail = useCallback(async () => {
    if (!employeeId || month === undefined || !year) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAttendanceDetailApi(employeeId, month, year);
      if (res?.status === 200 || res?.status === 201) {
        setRecords(res.data.data.records || []);
      } else {
        setError(res?.data?.message || "Failed to fetch records.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, month, year]);

  const updateRecord = useCallback(async (id, payload) => {
    setActionLoading(true);
    try {
      const res = await updateAttendanceRecordApi(id, payload);
      if (res?.status === 200 || res?.status === 201) {
        const updated = res.data.data.record;
        setRecords((prev) =>
          prev.map((r) =>
            r.id?.toString() === id?.toString()
              ? { ...r, checkIn: updated.checkIn, checkOut: updated.checkOut, hours: updated.hours, attendanceStatus: updated.attendanceStatus, notes: updated.notes, isIncomplete: updated.isIncomplete }
              : r
          )
        );
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch {
      return { success: false, message: "Something went wrong." };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Create a brand-new record (Manual Entry button) ────────────────────────
  // Used when a date has NO existing Attendance doc — e.g. a weekend the
  // employee worked but the machine sheet never captured.
  const createManualEntry = useCallback(async (payload) => {
    setActionLoading(true);
    try {
      const res = await createManualEntryApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        const newRecord = res.data.data.record;
        const formatted = {
          id:               newRecord._id,
          date:             new Date(newRecord.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          rawDate:          newRecord.date,
          checkIn:          newRecord.checkIn  || "",
          checkOut:         newRecord.checkOut || "",
          hours:            newRecord.hours,
          attendanceStatus: newRecord.attendanceStatus,
          notes:            newRecord.notes || "",
          isIncomplete:     newRecord.isIncomplete || false,
          isOvertime:       newRecord.isOvertime   || false,
        };
        // Insert in date order
        setRecords((prev) =>
          [...prev, formatted].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
        );
        return { success: true };
      }
      return { success: false, message: res?.data?.message || "Failed to create entry." };
    } catch {
      return { success: false, message: "Something went wrong." };
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return { records, loading, actionLoading, error, fetchDetail, updateRecord, createManualEntry, setRecords };
};

// ── useAttendanceImport ───────────────────────────────────────────────────────
export const useAttendanceImport = () => {
  const [importLogs,    setImportLogs]    = useState([]);
  const [logsLoading,   setLogsLoading]   = useState(false);
  const [importing,     setImporting]     = useState(false);
  const [importWarning, setImportWarning] = useState("");
  const [error,         setError]         = useState("");

  const fetchImportHistory = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await getImportHistoryApi({ limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        setImportLogs(res.data.data.logs || []);
      }
    } catch { /* silent */ }
    finally { setLogsLoading(false); }
  }, []);

  const importRecords = useCallback(async ({ month, year, fileName, fileSize, records,fileBase64 }) => {
    setImporting(true);
    setImportWarning("");
    setError("");
    try {
      const res = await importAttendanceApi({ month, year, fileName, fileSize, records,fileBase64 });
      if (res?.status === 200 || res?.status === 201) {
        const { unmatchedCount, unmatchedIds, partialCount, importLog } = res.data.data;

        if (importLog) {
          setImportLogs((prev) => [{
            id:        importLog._id,
            date:      new Date(importLog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            timestamp: new Date(importLog.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            fileName:  importLog.fileName,
            fileSize:  importLog.fileSize,
            records:   importLog.matchedRecords,
            status:    importLog.status,
          }, ...prev]);
        }

        const warnings = [];
        if (unmatchedCount > 0) {
          warnings.push(`${unmatchedCount} machine ID(s) didn't match any employee (IDs: ${unmatchedIds.join(", ")}). Set their "Attendance Machine ID" in Employees.`);
        }
        if (partialCount > 0) {
          warnings.push(`${partialCount} record(s) have only one punch — see the warning banner above to fix.`);
        }
        if (warnings.length) setImportWarning(warnings.join(" · "));

        return { success: true, ...res.data.data };
      }
      const msg = res?.data?.message || "Import failed.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Import failed. Please try again.");
      return { success: false };
    } finally {
      setImporting(false);
    }
  }, []);

  useEffect(() => { fetchImportHistory(); }, []);

  return { importLogs, setImportLogs, logsLoading, importing, importWarning, error,
    importRecords, fetchImportHistory };
};