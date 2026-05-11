import { useState, useEffect, useRef } from "react";
import { Box, Typography, MenuItem, IconButton } from "@mui/material";
import { Play, Square, Trash2 } from "lucide-react";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { TimePicker }           from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs }         from "@mui/x-date-pickers/AdapterDayjs";
import dayjs                    from "dayjs";

import CustomButton     from "../../../components/customButton";
import CustomSelect     from "../../../components/customSelect";
import TextInput        from "../../../components/textInput";
import CustomInputLabel from "../../../components/customInputLabel";
import SuccessPopup     from "../../../components/popups/confirmationDialog";
import GlobalStyle      from "../../../style/style";
import deleteIcon      from "../../../assets/icons/delete-icon-inactive.svg";

// ── Status options ────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "new",          label: "New"          },
  { value: "in_progress",  label: "In Progress"  },
  { value: "under_review", label: "Under Review" },
  { value: "completed",    label: "Completed"    },
];

// ── Mock time logs ────────────────────────────────────────────────────────
const mockTimeLogs = [
  { id: 1, type: "Timer",  duration: "0h 0m",  note: "Initial project setup and depende...", date: "2026-03-24" },
  { id: 2, type: "manual", duration: "4h 0m",  note: "Initial project setup and depende...", date: "2026-03-24" },
  { id: 3, type: "Timer",  duration: "7h 20m", note: "Initial project setup and depende...", date: "2026-03-24" },
];

// ── Helper: pad number ────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const formatSeconds = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const totalLogged = (logs) => {
  let totalMins = 0;
  logs.forEach((l) => {
    const match = l.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) totalMins += parseInt(match[1]) * 60 + parseInt(match[2]);
  });
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
};

// ── Log type chip ─────────────────────────────────────────────────────────
const LogTypeBadge = ({ type }) => {
  const isTimer = type === "Timer";
  return (
    <Box
      component="span"
      sx={{
        fontSize: "10px", fontWeight: 600,
        borderRadius: "4px", px: 0.8, py: 0.2,
        backgroundColor: isTimer ? "#2B6EFF1A" : "#04C3731A",
        color:           isTimer ? "#2B6EFF"   : "#04C373",
      }}
    >
      {type}
    </Box>
  );
};

const EmpTaskSidebar = ({ task = {}, onStatusUpdate }) => {
  // ── Update Status ──────────────────────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusSuccess,  setStatusSuccess]  = useState(false);

  // ── Timer ──────────────────────────────────────────────────────────────
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed,      setElapsed]      = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const handleTimerToggle = () => {
    if (timerRunning) {
      // stop — save to logs
      setTimeLogs((prev) => [
        ...prev,
        {
          id:       Date.now(),
          type:     "Timer",
          duration: `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`,
          note:     "Timer session",
          date:     new Date().toISOString().slice(0, 10),
        },
      ]);
      setElapsed(0);
    }
    setTimerRunning((p) => !p);
  };

  // ── Manual Entry ───────────────────────────────────────────────────────
  const [manual,      setManual]      = useState({ duration: null, date: null, note: "" });
  const [manualErrors,setManualErrors]= useState({});
  const [entrySuccess,setEntrySuccess]= useState(false);

  // ── Time Logs ──────────────────────────────────────────────────────────
  const [timeLogs, setTimeLogs] = useState(mockTimeLogs);

  const handleManualChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setManual((prev) => ({ ...prev, [field]: val }));
    if (manualErrors[field]) setManualErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateManual = () => {
    const e = {};
    if (!manual.duration || !manual.duration.isValid()) e.duration = "Duration is required";
    if (!manual.date)                                    e.date     = "Date is required";
    return e;
  };

  const handleAddEntry = () => {
    const errs = validateManual();
    if (Object.keys(errs).length) { setManualErrors(errs); return; }
    setTimeLogs((prev) => [
      ...prev,
      {
        id:       Date.now(),
        type:     "manual",
        duration: manual.duration
          ? `${manual.duration.hour()}h ${manual.duration.minute()}m`
          : "0h 0m",
        note:     manual.note || "Manual entry",
        date:     manual.date
          ? dayjs(manual.date).format("YYYY-MM-DD")
          : "",
      },
    ]);
    setManual({ duration: null, date: null, note: "" });
    setEntrySuccess(true);
  };

  const handleDeleteLog = (id) =>
    setTimeLogs((prev) => prev.filter((l) => l.id !== id));

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    onStatusUpdate?.(selectedStatus);
    setStatusSuccess(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection="column" gap={3}>

        {/* ── Update Status ──────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Update Status
          </Typography>
          <CustomSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth
            height="45px"
            inputBgColor="#F5F5F5"
            displayEmpty
            sx={{mb:2}}
          >
           
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </CustomSelect>
          <CustomButton
            btnLabel="Update Status"
            variant="gradient"
            handlePressBtn={handleStatusUpdate}
            sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%" }}
          />
        </Box>

        {/* ── Time Tracker ───────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Time Tracker
          </Typography>

          {/* Clock display */}
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "12px",
              py: 3,
              textAlign: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "32px", fontWeight: 700,
                color: "#030229", letterSpacing: "3px",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {formatSeconds(elapsed)}
            </Typography>
          </Box>

          {/* Start / Stop button */}
           <CustomButton
            btnLabel={timerRunning ? "Stop Timer" : "Start Timer"}
            variant="checkIn"
            handlePressBtn={handleTimerToggle}
            fullWidth
            startIcon={timerRunning ? <Square size={14} /> : <Play size={14} />}
            sx={{
              height: "46px", fontSize: "14px", fontWeight: 600, width: "100%",
              background: timerRunning
                ? "#48B504"
                : undefined, 
            }}
          />
        </Box>

        {/* ── Manual Entry ───────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Manual Entry
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>

            {/* Duration — TimePicker (HH:MM) */}
            <Box>
              <CustomInputLabel label="Duration (HH:MM)" />
              <TimePicker
                value={manual.duration}
                onChange={(val) => {
                  setManual((prev) => ({ ...prev, duration: val }));
                  if (manualErrors.duration)
                    setManualErrors((prev) => ({ ...prev, duration: "" }));
                }}
                ampm={false}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "02:30",
                    error: !!manualErrors.duration,
                    helperText: manualErrors.duration || "",
                  },
                }}
                sx={{ ...GlobalStyle.datePickerStyle, width: "100%" }}
              />
            </Box>

            {/* Date */}
            <Box>
              <CustomInputLabel label="Date" />
              <DatePicker
                value={manual.date}
                onChange={(val) => {
                  setManual((prev) => ({ ...prev, date: val }));
                  if (manualErrors.date)
                    setManualErrors((prev) => ({ ...prev, date: "" }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "Select Date",
                    error: !!manualErrors.date,
                    helperText: manualErrors.date || "",
                  },
                }}
                sx={{ ...GlobalStyle.datePickerStyle, width: "100%" }}
              />
            </Box>

            {/* Note */}
            <Box>
              <CustomInputLabel label="Note" />
              <TextInput
                placeholder="Add Notes"
                value={manual.note}
                onChange={handleManualChange("note")}
                inputBgColor="#F5F5F5"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            <CustomButton
              btnLabel="Add Entry"
              variant="gradient"
              handlePressBtn={handleAddEntry}
              fullWidth
              sx={{ height: "46px", fontSize: "14px", fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* ── Time Logs ──────────────────────────────────────────────────── */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Time Logs
          </Typography>

          <Box display="flex" flexDirection="column" gap={1}>
            {timeLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: "12px",
                  px: 2, py: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.4}>
                    <Typography fontSize="13px" fontWeight={700} color="text.primary">
                      {log.duration}
                    </Typography>
                    <LogTypeBadge type={log.type} />
                  </Box>
                  <Typography fontSize="12px" color="text.secondary" noWrap>
                    {log.note}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.4}>
                    <Box
                      sx={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        flexShrink: 0,
                      }}
                    />
                    <Typography fontSize="11px" color="text.secondary">
                      {log.date}
                    </Typography>
                  </Box>
                </Box>

                <Box
                                             sx={{
                                               width: 36, height: 36,
                                               backgroundColor: "#fff",
                                               borderRadius: "8px",
                                               display: "flex",
                                               alignItems: "center",
                                               justifyContent: "center",
                                               flexShrink: 0,
                                             }}
                                           >
                                             <img src={deleteIcon} alt="file" style={{ width: 18, height: 18 }} />
                                           </Box>
              </Box>
            ))}
          </Box>

          {/* Total logged */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            pt={2}
            sx={{ borderTop: "1px solid #F0F0F0" }}
          >
            <Typography fontSize="13px" fontWeight={600} color="text.secondary">
              Total Logged Time
            </Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {totalLogged(timeLogs)}
            </Typography>
          </Box>
        </Box>

      </Box>

      {/* ── Success popups ──────────────────────────────────────────────── */}
      <SuccessPopup
        open={statusSuccess}
        onClose={() => setStatusSuccess(false)}
        message="Status updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={entrySuccess}
        onClose={() => setEntrySuccess(false)}
        message="Time entry added"
        autoClose
        autoCloseDelay={1500}
      />
    </LocalizationProvider>
  );
};

export default EmpTaskSidebar;