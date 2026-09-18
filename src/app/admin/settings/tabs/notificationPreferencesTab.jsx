// src/app/admin/settings/tabs/notificationPreferencesTab.jsx 
// Updated to match the notification matrix:
//   Toggleable for Admin: newTaskAssignment, leaveRequestSubmitted,
//                         leaveApprovedRejected, taskStatusUpdate, projectTeamUpdated
//   Always-on (shown as read-only): projectDeadlineReminder, projectDeadlineChanged,
//                                   projectModuleUpdated, newMessageReceived
//
// UNSAVED-CHANGES GUARD — FIX: previously derived dirty state by diffing
// `prefs` against a snapshot taken on first non-loading render. That raced
// with the data-loading hook: if `prefs` was set more than once during load
// (e.g. a default shape swapped for the real fetched values), the snapshot
// could be taken against the wrong version, so the very next legitimate
// load update looked identical to a user edit — falsely flagging the tab
// dirty on a plain tab switch with zero edits. Now dirty is set explicitly,
// only from the one place a real user edit happens (handleToggle), so
// nothing about how/when the hook loads or re-sets `prefs` can trigger it.

import { useState, useEffect, useRef } from "react"; 
import { Box, Typography, CircularProgress } from "@mui/material";

import CustomButton  from "../../../../components/customButton";
import SuccessPopup  from "../../../../components/popups/confirmationDialog";
import CustomSwitch  from "../../../../components/switch";
import { useNotificationPreferences } from "../../../../hooks/notificationPreferences";
import { useUnsavedChangesStore } from "../../../../zustand/useUnsavedChangesStore";

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
  const handleSaveRef = useRef();
const setSaveHandler = useUnsavedChangesStore((s) => s.setSaveHandler);

useEffect(() => {
  handleSaveRef.current = handleSave;
});

useEffect(() => {
  setSaveHandler(() => handleSaveRef.current());
  return () => setSaveHandler(null);
}, []);

  const handleToggle = (key, channel) => (e) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: e.target.checked },
    }));
    // Explicit — this is the only place a real user edit happens on this tab.
    onDirtyChange(true);
  };

  const handleSave = async () => {
    const result = await savePrefs(prefs);
    if (result.success) {
      setSaveSuccess(true);
      onDirtyChange(false);
    }
    return result;
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
              flexWrap: "wrap", rowGap: 1,
              backgroundColor: "#F5F5F5", borderRadius: "12px", px: 2, py: 1.5,
            }}
          >
            <Typography fontSize="13px" fontWeight={500} color="text.primary" sx={{ minWidth: 0, flexShrink: 1 }}>
              {label}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ ml: "auto" }}>
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
              flexWrap: "wrap", rowGap: 1,
              backgroundColor: "#F9F9F9", borderRadius: "12px", px: 2, py: 1.5,
              border: "1px solid #F0F0F0",
            }}
          >
            <Typography fontSize="13px" fontWeight={500} color="text.secondary" sx={{ minWidth: 0, flexShrink: 1 }}>
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