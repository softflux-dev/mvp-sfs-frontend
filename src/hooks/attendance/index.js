// src/hooks/attendance.js
import { useState, useCallback, useEffect } from "react";
import {
  getAttendanceSummaryApi,
  getAttendanceDetailApi,
  updateAttendanceRecordApi,
  createManualEntryApi,
  importAttendanceApi,
  getImportHistoryApi,
} from "../../api/modules/attendance";

// ── Small local helpers to keep offSite/extra/total hours in sync with the
// backend's "Xh Ym" formatting, without needing a full refetch after every
// edit — parses a formatted on-site hours string back to decimal, and
// formats decimal hours the same way the backend does. ─────────────────────
const parseHoursLabel = (str) => {
  if (!str) return 0;
  const match = String(str).match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return 0;
  const h = parseInt(match[1], 10) || 0;
  const m = parseInt(match[2], 10) || 0;
  return h + m / 60;
};

const formatDecimalHours = (decimal) => {
  if (!decimal || decimal <= 0) return "0h 0m";
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h}h ${m}m`;
};

// ── useAttendanceSummary ──────────────────────────────────────────────────────
export const useAttendanceSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAttendanceSummaryApi({ months: 3, ...filters });
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

        // ── Recompute off-site/extra/total display fields locally so the
        // table reflects the edit immediately, without a full refetch. ─────
        const onSiteDecimal = parseHoursLabel(updated.hours);
        const offSiteRaw    = updated.offSiteHours || 0;
        const extraRaw      = updated.extraHours   || 0;
        const totalDecimal  = onSiteDecimal + offSiteRaw + extraRaw;

        setRecords((prev) =>
          prev.map((r) =>
            r.id?.toString() === id?.toString()
              ? {
                  ...r,
                  checkIn:          updated.checkIn,
                  checkOut:         updated.checkOut,
                   offSiteCheckIn:   updated.offSiteCheckIn  || "",
                  offSiteCheckOut:  updated.offSiteCheckOut || "",
                  hours:            updated.hours,
                  onSiteHours:      updated.hours || "0h 0m",
                  offSiteHoursRaw:  offSiteRaw,
                  extraHoursRaw:    extraRaw,
                  offSiteHours:     formatDecimalHours(offSiteRaw),
                  extraHours:       formatDecimalHours(extraRaw),
                  totalHours:       formatDecimalHours(totalDecimal),
                  attendanceStatus: updated.attendanceStatus,
                  notes:            updated.notes,
                  isIncomplete:     updated.isIncomplete,
                  // Any HR edit is flagged manual server-side so a later
                  // re-import can't wipe it — keep the row in sync.
                  isManual:         updated.isManual ?? true,
                }
              : r
          )
        );
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch (err) {
  return { success: false, message: err?.response?.data?.message || "Something went wrong." };
} finally {
      setActionLoading(false);
    }
  }, []);

  // ── Create a brand-new record (Manual Entry button) ────────────────────────
  // Used when a date has NO existing Attendance doc — e.g. a non-working day
  // the employee worked, or a work-from-home day the machine never captured.
  const createManualEntry = useCallback(async (payload) => {
    setActionLoading(true);
    try {
      const res = await createManualEntryApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        const newRecord = res.data.data.record;

        const onSiteDecimal = parseHoursLabel(newRecord.hours);
        const offSiteRaw    = newRecord.offSiteHours || 0;
        const extraRaw      = newRecord.extraHours   || 0;
        const totalDecimal  = onSiteDecimal + offSiteRaw + extraRaw;

        const formatted = {
        id: newRecord._id,
        date: newRecord.date,
        rawDate: newRecord.rawDate || newRecord.date,
        checkIn: newRecord.checkIn || "",
        checkOut: newRecord.checkOut || "",
        offSiteCheckIn: newRecord.offSiteCheckIn || "",
        offSiteCheckOut: newRecord.offSiteCheckOut || "",
        hours: newRecord.hours,
        onSiteHours: newRecord.hours || "0h 0m",
        offSiteHoursRaw: offSiteRaw,
        extraHoursRaw: extraRaw,
        offSiteHours: formatDecimalHours(offSiteRaw),
        extraHours: formatDecimalHours(extraRaw),
        totalHours: formatDecimalHours(totalDecimal),
        attendanceStatus: newRecord.attendanceStatus,
        notes: newRecord.notes || "",
        isIncomplete: newRecord.isIncomplete || false,
        isOvertime: newRecord.isOvertime || false,
        isManual: newRecord.isManual ?? true,
        isNonWorkingDay: newRecord.isNonWorkingDay || false,
      };

      setRecords((prev) => {
        const idx = prev.findIndex((r) => r.id?.toString() === formatted.id?.toString());
        const next = idx === -1 ? [...prev, formatted] : prev.map((r, i) => (i === idx ? formatted : r));
        return next.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
      });
      return { success: true };
      }
      return { success: false, message: res?.data?.message || "Failed to create entry." };
    } catch (err) {
  return { success: false, message: err?.response?.data?.message || "Something went wrong." };
} finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return { records, loading, actionLoading, error, fetchDetail, updateRecord, createManualEntry, setRecords };
};

// ── Single source of truth for formatting an import log's date/time —
// used both right after a fresh import AND when refetching history, so
// the two paths can never disagree. ──────────────────────────────────────
const formatImportLog = (raw) => ({
  id:        raw._id || raw.id,
  date:      new Date(raw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  timestamp: new Date(raw.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  fileName:  raw.fileName,
  fileSize:  raw.fileSize,
  records:   raw.matchedRecords ?? raw.records,
  status:    raw.status,
});

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
        const raw = res.data.data.logs || [];
        setImportLogs(raw.map(formatImportLog));
      }
    } catch { /* silent */ }
    finally { setLogsLoading(false); }
  }, []);

 const importRecords = useCallback(async ({ month, year, fileName, fileSize, records, fileBase64 }) => {
    setImporting(true);
    setImportWarning("");
    setError("");
    try {
      const res = await importAttendanceApi({ month, year, fileName, fileSize, records, fileBase64 });
      if (res?.status === 200 || res?.status === 201) {
        const {
          unmatchedCount, unmatchedIds, partialCount, skippedManual, importLog,
        } = res.data.data;

        if (importLog) {
          setImportLogs((prev) => [formatImportLog(importLog), ...prev]);
        }

        const warnings = [];
        if (unmatchedCount > 0) {
          warnings.push(`${unmatchedCount} machine ID(s) didn't match any employee (IDs: ${unmatchedIds.join(", ")}). Set their "Attendance Machine ID" in Employees.`);
        }
        if (partialCount > 0) {
          warnings.push(`${partialCount} record(s) have only one punch — see the warning banner above to fix.`);
        }
        // Reassurance rather than a problem: manual entries and HR edits are
        // deliberately preserved, so HR knows their typed hours survived.
        
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