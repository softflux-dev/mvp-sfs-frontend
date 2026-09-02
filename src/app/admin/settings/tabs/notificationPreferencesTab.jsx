// src/app/admin/settings/tabs/notificationPreferencesTab.jsx 
// Updated to match the notification matrix:
//   Toggleable for Admin: newTaskAssignment, leaveRequestSubmitted,
//                         leaveApprovedRejected, taskStatusUpdate, projectTeamUpdated
//   Always-on (shown as read-only): projectDeadlineReminder, projectDeadlineChanged,
//                                   projectModuleUpdated, newMessageReceived
//
// UNSAVED-CHANGES GUARD: reports dirty state up via onDirtyChange whenever
// `prefs` drifts from the snapshot taken right after the initial load
// finishes / right after a successful save.

import { useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import CustomButton  from "../../../../components/customButton";
import SuccessPopup  from "../../../../components/popups/confirmationDialog";
import CustomSwitch  from "../../../../components/switch";
import { useNotificationPreferences } from "../../../../hooks/notificationPreferences";

// ── Toggleable (admin can turn on/off) ────────────────────────────────────────
const TOGGLEABLE = [
  { key: "newTaskAssignment",     label: "New Task Assignment"       },
  { key: "leaveRequestSubmitted", label: "Leave Request Submitted"   },
  { key: "leaveApprovedRejected", label: "Leave Approved / Rejected" },
  { key: "taskStatusUpdate",      label: "Task Status Update"        },
  { key: "projectTeamUpdated",    label: "Project Team Updated"      },
];

// ── Always-on (shown as info, no toggle) ─────────────────────────────────────
const ALWAYS_ON = [
  { key: "projectDeadlineReminder", label: "Project Deadline Reminder (7 & 3 Days)" },
  { key: "projectDeadlineChanged",  label: "Project Deadline Changed"               },
  { key: "projectModuleUpdated",    label: "Project Module Updated"                 },
  { key: "newMessageReceived",      label: "New Message Received (In-App Only)"     },
];

const NotificationPreferencesTab = ({ onDirtyChange = () => {} }) => {
  const {
    prefs,
    setPrefs,
    loading,
    actionLoading,
    error,
    savePrefs,
  } = useNotificationPreferences();

  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Unsaved-changes tracking ─────────────────────────────────────────────
  // Snapshot is taken once, the first time `loading` finishes — not on every
  // `prefs` change, since the hook may hand back a new object reference on
  // each load. After that, any drift from the snapshot is "dirty".
  const initialSnapshotRef = useRef(null);
  const hasSnapshotRef     = useRef(false);

  useEffect(() => {
    if (!loading && !hasSnapshotRef.current && prefs) {
      initialSnapshotRef.current = JSON.stringify(prefs);
      hasSnapshotRef.current = true;
    }
  }, [loading, prefs]);

  useEffect(() => {
    if (!initialSnapshotRef.current) return;
    onDirtyChange(JSON.stringify(prefs) !== initialSnapshotRef.current);
  }, [prefs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (key, channel) => (e) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: e.target.checked },
    }));
  };

  const handleSave = async () => {
    const result = await savePrefs(prefs);
    if (result.success) {
      setSaveSuccess(true);
      initialSnapshotRef.current = JSON.stringify(prefs);
      onDirtyChange(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress size={32} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={0.5}>
        Notification Preferences
      </Typography>
      <Typography fontSize="13px" color="text.secondary" mb={3}>
        Configure which notifications you receive. Critical system notifications are always delivered.
      </Typography>

      {error && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {/* ── Section: Toggleable ──────────────────────────────────────────── */}
      <Typography fontSize="14px" fontWeight={600} color="text.primary" mb={1.5}>
        Configurable Notifications
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        {TOGGLEABLE.map(({ key, label }) => (
          <Box
            key={key}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5,
            }}
          >
            <Typography fontSize="13px" fontWeight={500} color="text.primary">
              {label}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Email toggle */}
              <Box display="flex" alignItems="center" gap={0.75}>
                <CustomSwitch
                  checked={prefs[key]?.email ?? false}
                  onChange={handleToggle(key, "email")}
                />
                <Typography
                  fontSize="13px" fontWeight={500}
                  sx={{
                    color:      prefs[key]?.email ? "#AA2493" : "#67768B",
                    transition: "color 300ms",
                  }}
                >
                  Email
                </Typography>
              </Box>
              {/* In-App toggle */}
              <Box display="flex" alignItems="center" gap={0.75}>
                <CustomSwitch
                  checked={prefs[key]?.inApp ?? false}
                  onChange={handleToggle(key, "inApp")}
                />
                <Typography
                  fontSize="13px" fontWeight={500}
                  sx={{
                    color:      prefs[key]?.inApp ? "#AA2493" : "#67768B",
                    transition: "color 300ms",
                  }}
                >
                  In-App
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Section: Always-on ───────────────────────────────────────────── */}
      <Typography fontSize="14px" fontWeight={600} color="text.primary" mb={0.5}>
        Critical Notifications
      </Typography>
      <Typography fontSize="12px" color="text.secondary" mb={1.5}>
        These notifications are always delivered and cannot be disabled.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        {ALWAYS_ON.map(({ key, label }) => (
          <Box
            key={key}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              backgroundColor: "#F9F9F9", borderRadius: "12px", px: 2, py: 1.5,
              border: "1px solid #F0F0F0",
            }}
          >
            <Typography fontSize="13px" fontWeight={500} color="text.secondary">
              {label}
            </Typography>
            <Box
              sx={{
                px: 1.5, py: 0.5, borderRadius: "8px",
                backgroundColor: "#F3E8FB",
              }}
            >
              <Typography fontSize="11px" fontWeight={600} color="#AA2493">
                Always On
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel={
            actionLoading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : "Save Changes"
          }
          variant="gradient"
          handlePressBtn={handleSave}
          disabled={actionLoading}
        />
      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Notification preferences saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default NotificationPreferencesTab;