import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomTabs         from "../../../components/tabs";
import ConfirmationDialog from "../../../components/popups/confirmation";

import CompanyProfileTab          from "./tabs/companyProfileTab";
import WorkingHoursTab            from "./tabs/workingHoursTab";
import LeavePolicyTab             from "./tabs/leavePolicyTab";
import NotificationPreferencesTab from "./tabs/notificationPreferencesTab";
import EmailConfigurationTab      from "./tabs/emailConfigurationTab";
import SecurityTab                from "./tabs/securityTab";
import DepartmentTab               from "./tabs/departmentTab";

const tabs = [
  { id: 1, label: "Company Profile"           },
  { id: 2, label: "Working Hours"             },
  { id: 3, label: "Leave Policy"              },
  { id: 4, label: "Notification Preferences"  },
  { id: 5, label: "Email Configuration"       },
  { id: 6, label: "Security"                  },
  { id: 7, label: "Departments"               },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState(1);

  // ── Unsaved-changes guard ────────────────────────────────────────────────
  // Tracks whether the CURRENTLY active tab has edits that haven't been
  // saved yet. Each tab that supports this reports it up via the
  // `onDirtyChange` callback passed to it below. Reset to false whenever the
  // tab actually switches, so the next tab always starts clean.
  const [isDirty, setIsDirty] = useState(false);
  const confirmDialogRef = useRef();

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setIsDirty(false);
  };

  const handleTabChange = (newTabId) => {
    if (newTabId === activeTab) return;

    if (isDirty) {
      confirmDialogRef.current?.open({
        title:       "Unsaved Changes",
        description: "You have unsaved changes on this tab. Save your changes before leaving, or they'll be lost.",
        confirmText: "Discard & Leave",
        cancelText:  "Stay on This Tab",
        onConfirm:   () => switchTab(newTabId),
      });
      return;
    }

    switchTab(newTabId);
  };

  return (
    <Box>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="Settings"
            subtitle="Configure system preferences"
          />
        </Grid>
      </Grid>

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <Box mt={2}>
        {activeTab === 1 && <CompanyProfileTab          onDirtyChange={setIsDirty} />}
        {activeTab === 2 && <WorkingHoursTab            onDirtyChange={setIsDirty} />}
        {activeTab === 3 && <LeavePolicyTab              onDirtyChange={setIsDirty} />}
        {activeTab === 4 && <NotificationPreferencesTab onDirtyChange={setIsDirty} />}
        {activeTab === 5 && <EmailConfigurationTab />}
        {activeTab === 6 && <SecurityTab                onDirtyChange={setIsDirty} />}
        {activeTab === 7 && <DepartmentTab />}
      </Box>

      <ConfirmationDialog ref={confirmDialogRef} />
    </Box>
  );
};

export default Settings;