import { useState, useEffect, useRef } from "react";
import { Box, Typography, MenuItem } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomSelect       from "../../../components/customSelect";
import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ManualTimeEntry    from "./manualTimeEntry";
import WeeklyProductivity from "./weeklyProductivity";
import BreakdownByTask    from "./breakdownByTask";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";

const taskOptions = [
  { v: "task1", l: "Build user authentication module" },
  { v: "task2", l: "Design product listing page"      },
  { v: "task3", l: "Setup CI/CD pipeline"             },
  { v: "task4", l: "Patient records API"              },
  { v: "task5", l: "Write unit tests for auth module" },
];

const mockTimeLogs = [
  { id: 1, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "02:30", type: "Timer",  note: "Worked on JWT implementation" },
  { id: 2, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "01:45", type: "Timer",  note: "Debugging webhook handler"    },
  { id: 3, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "03:00", type: "Manual", note: "SendGrid integration"          },
  { id: 4, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "02:00", type: "Timer",  note: "Refresh token logic"          },
  { id: 5, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "02:00", type: "Manual", note: "Template design"              },
  { id: 6, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "02:00", type: "Manual", note: "Added retry logic"            },
  { id: 7, taskName: "Build user authentication module", project: "Project Alpha", date: "Mar 25, 2026", duration: "02:00", type: "Timer",  note: "Login flow"                   },
];

const tableHeader = [
  { id: "task",     label: "Task"     },
  { id: "date",     label: "Date"     },
  { id: "duration", label: "Duration" },
  { id: "type",     label: "Type"     },
  { id: "note",     label: "Note"     },
  { id: "actions",  label: "Actions"  },
];

const displayRows = [
  "tl_task",
  "tl_date",
  "tl_duration",
  "tl_type",
  "tl_note",
  "tl_delete",
];

const TimeTracking = () => {
  const [selectedTask,  setSelectedTask]  = useState("");
  const [isRunning,     setIsRunning]     = useState(false);
  const [elapsed,       setElapsed]       = useState(0);
  const [logs,          setLogs]          = useState(mockTimeLogs);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const intervalRef  = useRef(null);
  const confirmRef   = useRef();
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current  = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatElapsed = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleStop = () => {
    setIsRunning(false);
    if (elapsed > 0 && selectedTask) {
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const taskLabel = taskOptions.find((t) => t.v === selectedTask)?.l || selectedTask;
      setLogs((prev) => [{
        id:       Date.now(),
        taskName: taskLabel,
        project:  "Project Alpha",
        date:     new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        duration: `${h}:${m}`,
        type:     "Timer",
        note:     "",
      }, ...prev]);
    }
    setElapsed(0);
  };

  const handleDelete = (row) => {
    confirmRef.current?.open({
      title:       "Delete Entry?",
      description: "Are you sure you want to delete this time log?",
      confirmText: "Yes",
      cancelText:  "Cancel",
      onConfirm: () => {
        setLogs((prev) => prev.filter((l) => l.id !== row.id));
        setDeleteSuccess(true);
      },
    });
  };

  const handleAddManual = (entry) => {
    const taskLabel = taskOptions.find((t) => t.v === entry.task)?.l || entry.task;
    setLogs((prev) => [{
      id:       Date.now(),
      taskName: taskLabel,
      project:  "Project Alpha",
      date:     entry.date,
      duration: entry.duration,
      type:     "Manual",
      note:     entry.note,
    }, ...prev]);
  };

  return (
    <>
      <HeaderText title="Time Tracking" subtitle="Track and log time spent on your tasks" />

      {/* ── Live Timer bar ─────────────────────────────────────────────────── */}
      <Box sx={{
        backgroundColor: "#F5F5F5",
        borderRadius: "25px",
        p: "16px 24px",
        mt: 3,
        mb: 3,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}>
        <Box flex={1}>
          <CustomSelect
            placeholder="Select task"
            fullWidth
            height="48px"
            inputBgColor="#fff"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            isDisabled={isRunning}
          >
            {taskOptions.map((op) => (
              <MenuItem key={op.v} value={op.v}>{op.l}</MenuItem>
            ))}
          </CustomSelect>
        </Box>

        <Typography sx={{
          fontSize: "32px", fontWeight: 700,
          fontFamily: '"Poppins", sans-serif',
          color: "text.primary", minWidth: "160px",
          textAlign: "center", letterSpacing: "2px",
        }}>
          {formatElapsed(elapsed)}
        </Typography>

        <Box display="flex" gap={1.5}>
          <CustomButton
            btnLabel="Start"
            handlePressBtn={() => setIsRunning(true)}
            disabled={isRunning || !selectedTask}
            sx={{
              minWidth: "90px", height: "44px",
              backgroundColor: "#48B504", color: "#fff",
              borderRadius: "12px", fontSize: "15px", fontWeight: 600,
              "&:hover": { backgroundColor: "#3a9003" },
              "&.Mui-disabled": { backgroundColor: "#48B50460", color: "#fff" },
            }}
          />
          <CustomButton
            btnLabel="Stop"
            handlePressBtn={handleStop}
            disabled={!isRunning}
            sx={{
              minWidth: "90px", height: "44px",
              backgroundColor: "#ef0404ee", color: "#fff",
              borderRadius: "12px", fontSize: "15px", fontWeight: 600,
              "&:hover": { backgroundColor: "#cc2b0be7" },
              "&.Mui-disabled": { backgroundColor: "#FFACAC", color: "#fff" },
            }}
          />
        </Box>
      </Box>

      {/* ── Manual Time Entry ──────────────────────────────────────────────── */}
      <ManualTimeEntry onAddEntry={handleAddManual} />

      {/* ── Time Logs ─────────────────────────────────────────────────────── */}
      <Box mb={3}>
        <Typography fontSize="20px" fontWeight={700} color="text.primary" mb={2}>
          Time Logs
        </Typography>
        <Box bgcolor="#fff" borderRadius="25px" p={1}>
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={logs}
            displayRows={displayRows}
            isLoading={false}
            onDeleteClick={handleDelete}
          />
        </Box>
      </Box>

      {/* ── Weekly Productivity chart ──────────────────────────────────────── */}
      <WeeklyProductivity />

      {/* ── Breakdown by Task ─────────────────────────────────────────────── */}
      <BreakdownByTask />

      <ConfirmationDialog ref={confirmRef} />
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Time log deleted"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default TimeTracking;