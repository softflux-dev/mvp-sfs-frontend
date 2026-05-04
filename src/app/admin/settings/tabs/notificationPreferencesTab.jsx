// tabs/notificationPreferencesTab.jsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";

import CustomButton  from "../../../../components/customButton";
import SuccessPopup  from "../../../../components/popups/confirmationDialog";
import CustomSwitch  from "../../../../components/switch";

const NOTIFICATIONS = [
  { key: "newTaskAssignment",    label: "New Task Assignment" },
  { key: "deadlineReminder",     label: "Deadline Reminder" },
  { key: "leaveRequestSubmitted",label: "Leave Request Submitted" },
  { key: "leaveApprovedRejected",label: "Leave Approved / Rejected" },
  { key: "taskStatusUpdate",     label: "Task Status Update" },
  { key: "projectUpdate",        label: "Project Update" },
  { key: "newMessageReceived",   label: "New Message Received" },
];

const initialState = NOTIFICATIONS.reduce((acc, { key }) => {
  acc[key] = { email: false, inApp: false };
  return acc;
}, {});

const NotificationPreferencesTab = () => {
  const [prefs, setPrefs]           = useState(initialState);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key, channel) => (e) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: e.target.checked },
    }));
  };

  const handleSave = () => {
    console.log("Notification prefs:", prefs);
    setSaveSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={2}>
        Notification Preferences
      </Typography>

      {/* ── Rows ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {NOTIFICATIONS.map(({ key, label }) => (
          <Box
            key={key}
            sx={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              backgroundColor: "#F5F5F5",
              borderRadius:   "12px",
              px: 2,
              py: 1.5,
            }}
          >
            {/* Notification name */}
            <Typography fontSize="13px" fontWeight={500} color="text.primary">
              {label}
            </Typography>

            {/* Toggles */}
            <Box display="flex" alignItems="center" gap={2}>
              {/* Email */}
              <Box display="flex" alignItems="center" gap={0.75}>
                <CustomSwitch
                  checked={prefs[key].email}
                  onChange={handleToggle(key, "email")}
                />
                <Typography
                  fontSize="13px"
                  fontWeight={500}
                  sx={{
                    color: prefs[key].email ? "#AA2493" : "#67768B",
                    transition: "color 300ms",
                  }}
                >
                  Email
                </Typography>
              </Box>

              {/* In-App */}
              <Box display="flex" alignItems="center" gap={0.75}>
                <CustomSwitch
                  checked={prefs[key].inApp}
                  onChange={handleToggle(key, "inApp")}
                />
                <Typography
                  fontSize="13px"
                  fontWeight={500}
                  sx={{
                    color: prefs[key].inApp ? "#AA2493" : "#67768B",
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

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <CustomButton
          btnLabel="Save Changes"
          variant="gradient"
          handlePressBtn={handleSave}
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