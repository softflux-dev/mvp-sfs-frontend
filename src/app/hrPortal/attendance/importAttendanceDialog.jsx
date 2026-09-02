// hrPortal/attendance/importAttendanceDialog.jsx — 
import { useState, useRef } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { DialogContainer, DialogHeader, DialogBody, CustomSelect } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import GlobalStyle         from "../../../style/style";

// ── Required columns in the uploaded sheet ────────────────────────────────────
// Accept common header variations (case-insensitive)
const REQUIRED_COLUMNS = [
  { key: "empId",    labels: ["id"] },
  { key: "name",     labels: ["name"] },
  { key: "date",     labels: ["date"] },
  { key: "checkIn",  labels: ["check-in time", "check in time", "checkin", "check-in", "check in"] },
  { key: "checkOut", labels: ["check-out time", "check out time", "checkout", "check-out", "check out"] },
  { key: "duration", labels: ["duration", "hours", "working hours", "working hrs"] },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const normalize = (str) => String(str || "").trim().toLowerCase().replace(/\s+/g, " ");

// ── Excel date/time cells now come through as real JS Date objects
// (because of cellDates: true below) — normalize both those AND legacy
// plain-text cells into consistent strings. ──────────────────────────────
const cellToDateStr = (val) => {
  if (val instanceof Date) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val || "").trim();
};

const cellToTimeStr = (val) => {
  if (val instanceof Date) {
    const hh = String(val.getUTCHours()).padStart(2, "0");
    const mm = String(val.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return String(val || "").trim();
};

// Convert ArrayBuffer → base64 in chunks to avoid call-stack overflow on large files
const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const ImportAttendanceDialog = ({ open, onClose, onImport }) => {
  const [month,    setMonth]    = useState(new Date().getMonth());
  const [yearDate, setYearDate] = useState(dayjs());
  const [file,     setFile]     = useState(null);
  const [error,    setError]    = useState("");
  const [parsing,  setParsing]  = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setError("");
    setParsing(false);
  };

  const handleClose = () => {
    resetState();
    setMonth(new Date().getMonth());
    setYearDate(dayjs());
    onClose?.();
  };

  // ── Validate headers against required columns ───────────────────────────────
  const validateHeaders = (headerRow) => {
    const normalizedHeaders = headerRow.map(normalize);
    const missing = [];
    const mapping = {};

    REQUIRED_COLUMNS.forEach(({ key, labels }) => {
      const idx = normalizedHeaders.findIndex((h) => labels.includes(h));
      if (idx === -1) missing.push(key);
      else mapping[key] = idx;
    });

    return { missing, mapping };
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError("");

    const validExt = /\.(xlsx|xls|csv)$/i.test(selected.name);
    if (!validExt) {
      setError("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }
     // ── Guard: can't import a month that hasn't happened yet ──────────────
  const now = new Date();
  const selectedYM = yearDate.year() * 12 + month;
  const currentYM  = now.getFullYear() * 12 + now.getMonth();
  if (selectedYM > currentYM) {
    setError(
      `You can't import attendance for ${MONTHS[month]} ${yearDate.year()} — it's a future month. ` +
      `Attendance can only be imported for the current or a past month.`
    );
    return;
  }

    setParsing(true);
    setError("");

    try {
      const data = await file.arrayBuffer();
      const fileBase64 = arrayBufferToBase64(data);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows  = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (!rows.length) {
        setError("The uploaded file is empty.");
        setParsing(false);
        return;
      }

      // ── Find the actual header row — skip blank/metadata rows at the top ──
      // The real header row is the first row that contains at least 2 of our
      // expected column keywords (case-insensitive).
      const knownKeywords = ["name", "id", "date", "check", "duration", "time"];
      let headerRowIndex = -1;

      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const rowNorm = rows[i].map(normalize);
        const hits = rowNorm.filter((cell) =>
          knownKeywords.some((kw) => cell.includes(kw))
        ).length;
        if (hits >= 2) { headerRowIndex = i; break; }
      }

      if (headerRowIndex === -1) {
        setError("Could not find the header row in this file. Make sure the sheet contains columns: Name, ID, Date, Check-In Time, Check-Out Time, Duration.");
        setParsing(false);
        return;
      }

      const headerRow = rows[headerRowIndex];
      const { missing, mapping } = validateHeaders(headerRow);

      if (missing.length > 0) {
        const labels = missing.map((key) => REQUIRED_COLUMNS.find((c) => c.key === key)?.labels[0] || key);
        setError(
          `Missing required column(s): ${labels.join(", ")}. ` +
          `Required: Name, ID, Date, Check-In Time, Check-Out Time, Duration.`
        );
        setParsing(false);
        return;
      }

      // Data rows start right after the header row
      const dataRows = rows
        .slice(headerRowIndex + 1)
        .filter((r) => r.some((cell) => String(cell).trim() !== ""));

      const parsedRecords = dataRows.map((row) => ({
        empId:    String(row[mapping.empId]    || "").trim(),
        name:     String(row[mapping.name]     || "").trim(),
        date:     cellToDateStr(row[mapping.date]),
        checkIn:  cellToTimeStr(row[mapping.checkIn]),
        checkOut: cellToTimeStr(row[mapping.checkOut]),
        duration: String(row[mapping.duration] || "").trim(),
      }))
      // Filter out subtotal/total rows (no empId or name)
      .filter((r) => r.empId || r.name);

      if (parsedRecords.length === 0) {
        setError("No valid data rows found in the file.");
        setParsing(false);
        return;
      }

      // ── Guard: block future-dated rows, and block an incomplete row
// (check-in with no check-out, or vice versa) for TODAY specifically —
// today's punch cycle isn't finished yet, so a lone check-in is expected,
// not an error to fix; but the row can't be imported as "complete" data. ───
const todayStr = (() => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
})();

const futureRows = parsedRecords.filter((r) => r.date && r.date > todayStr);
if (futureRows.length > 0) {
  const dates = [...new Set(futureRows.map((r) => r.date))].sort();
  setError(
    `This file contains ${futureRows.length} row(s) with future date(s) (${dates[0]}${dates.length > 1 ? ` to ${dates[dates.length - 1]}` : ""}). ` +
    `Attendance can't be uploaded for dates that haven't happened yet. Remove these rows and re-upload.`
  );
  setParsing(false);
  return;
}

const todayIncompleteRows = parsedRecords.filter((r) => {
  if (r.date !== todayStr) return false;
  const hasIn  = r.checkIn  && r.checkIn  !== "-" && r.checkIn.trim()  !== "";
  const hasOut = r.checkOut && r.checkOut !== "-" && r.checkOut.trim() !== "";
  return hasIn !== hasOut; // exactly one of the two present
});
if (todayIncompleteRows.length > 0) {
  setError(
    `${todayIncompleteRows.length} row(s) for today (${todayStr}) have only a check-in or only a check-out. ` +
    `Today's attendance isn't complete yet — remove today's row(s) and re-upload once the day has ended, or upload today separately later.`
  );
  setParsing(false);
  return;
}


      // ── Guard: make sure the file's actual dates match the selected period.
      // Prevents the silent "0 present / all absent" corruption caused by
      // trusting the dropdown instead of the file's real dates. ─────────────
      const monthCounts = {};
      parsedRecords.forEach((r) => {
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      });

      const totalDated = Object.values(monthCounts).reduce((a, b) => a + b, 0);
      const selectedKey = `${yearDate.year()}-${month}`;
      const matching = monthCounts[selectedKey] || 0;

      if (totalDated > 0 && matching / totalDated < 0.5) {
        const [dominantKey] = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
        const [domYear, domMonth] = dominantKey.split("-").map(Number);
        setError(
          `This file's dates mostly belong to ${MONTHS[domMonth]} ${domYear}, but you selected ${MONTHS[month]} ${yearDate.year()}. ` +
          `Change the Attendance Period above to ${MONTHS[domMonth]} ${domYear} and try again.`
        );
        setParsing(false);
        return;
      }

      onImport?.({
        month, year: yearDate.year(), file,
        records: parsedRecords,
        fileBase64,
      });
      handleClose();
    } catch (err) {
      console.error("Parse error:", err);
      setError("Failed to parse the file. Please make sure it's a valid Excel/CSV file.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DialogContainer open={open} onClose={handleClose} maxWidth="480px" fullWidth>
      <DialogHeader title="Import Attendance Records" onClose={handleClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Month / Year selection */}
          <Box>
            <CustomInputLabel label="Attendance Period — which month is this data for?" />
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <CustomSelect value={month} onChange={(e) => setMonth(e.target.value)} fullWidth height="45px" inputBgColor="#fff">
                {MONTHS.map((m, idx) => (
                  <MenuItem key={m} value={idx}>{m}</MenuItem>
                ))}
              </CustomSelect>
             <DatePicker
              views={["year"]}
              value={yearDate}
              onChange={(val) => val && setYearDate(val)}
              sx={{
                ...GlobalStyle.datePickerStyle,
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  "& fieldset": { border: "none" },
                },
              }}
              slotProps={{
                textField: { size: "small", fullWidth: true },
                popper: { sx: GlobalStyle.datePickerPopperSx },
              }}
            />
            </Box>
          </Box>

          {/* File upload */}
          <Box>
            <CustomInputLabel label="Attendance Sheet" />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed #D1D5DB", borderRadius: "14px", backgroundColor: "#fff",
                py: 4, px: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                cursor: "pointer", transition: "all 0.15s ease",
                "&:hover": { borderColor: "#AA2493", backgroundColor: "#AA249308" },
              }}
            >
              {file ? (
                <>
                  <FileSpreadsheet size={28} color="#AA2493" />
                  <Typography fontSize="13px" fontWeight={600} color="text.primary">{file.name}</Typography>
                  <Typography fontSize="11px" color="text.secondary">{(file.size / 1024).toFixed(0)} KB — click to change</Typography>
                </>
              ) : (
                <>
                  <Upload size={28} color="#9CA3AF" />
                  <Typography fontSize="13px" fontWeight={600} color="text.primary">Click to upload Excel or CSV</Typography>
                  <Typography fontSize="11px" color="text.secondary">.xlsx, .xls, or .csv format</Typography>
                </>
              )}
            </Box>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileSelect} />
          </Box>

          {/* Required columns hint */}
          <Box sx={{ backgroundColor: "#F0E8FA", borderRadius: "10px", px: 2, py: 1.5 }}>
            <Typography fontSize="12px" fontWeight={600} color="#AA2493" mb={0.5}>Required columns in sheet:</Typography>
            <Typography fontSize="11px" color="text.secondary">
              ID, Name, Date, Check In, Check Out, Duration
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", backgroundColor: "#FFF0F0", border: "1px solid #FFCCCC", borderRadius: "10px", px: 2, py: 1.5 }}>
              <AlertCircle size={16} color="#FF3B30" style={{ flexShrink: 0, marginTop: 1 }} />
              <Typography fontSize="12px" color="error">{error}</Typography>
            </Box>
          )}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleImport}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Import"
        variant="gradient"
        confirmLoading={parsing}
      />
    </DialogContainer>
    </LocalizationProvider>
  );
};

export default ImportAttendanceDialog;