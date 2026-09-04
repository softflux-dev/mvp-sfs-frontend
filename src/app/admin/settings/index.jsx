import { useState, useEffect, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText              from "../../../components/headerText";
import CustomTabs              from "../../../components/tabs";
import ConfirmationDialog      from "../../../components/popups/confirmation";
import UnsavedChangesIndicator from "../../../components/unsavedChangesIndicator";

import CompanyProfileTab          from "./tabs/companyProfileTab";
import WorkingHoursTab            from "./tabs/workingHoursTab";
import LeavePolicyTab             from "./tabs/leavePolicyTab";
import NotificationPreferencesTab from "./tabs/notificationPreferencesTab";
import EmailConfigurationTab      from "./tabs/emailConfigurationTab";
import SecurityTab                from "./tabs/securityTab";
import DepartmentTab              from "./tabs/departmentTab";

import { useUnsavedChangesStore } from "../../../zustand/useUnsavedChangesStore";

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
  const confirmDialogRef = useRef();

  const isDirty        = useUnsavedChangesStore((s) => s.isDirty);
  const setDirty        = useUnsavedChangesStore((s) => s.setDirty);
  const dialogOpen       = useUnsavedChangesStore((s) => s.dialogOpen);
  const saving           = useUnsavedChangesStore((s) => s.saving);
  const guardNavigate   = useUnsavedChangesStore((s) => s.guardNavigate);
  const confirmDiscard  = useUnsavedChangesStore((s) => s.confirmDiscard);
  const confirmSave      = useUnsavedChangesStore((s) => s.confirmSave);
  const closeDialog      = useUnsavedChangesStore((s) => s.closeDialog);

  const handleTabChange = (newTabId) => {
    if (newTabId === activeTab) return;
    guardNavigate(() => setActiveTab(newTabId));
  };

  // Any tab navigated INTO starts clean.
  useEffect(() => {
    setDirty(false);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Only 2 buttons: "Save Changes" (primary, calls confirmSave) and
  // "Discard & Leave" (secondary, calls confirmDiscard). No neutral
  // "stay/cancel" option — this is a deliberate two-choice dialog now.
  useEffect(() => {
    if (dialogOpen) {
      confirmDialogRef.current?.open({
        title:       "Unsaved Changes",
        description: "You have unsaved changes. Save them before leaving, or discard them.",
        confirmText: saving ? "Saving..." : "Save Changes",
        cancelText:  "Discard & Leave",
        confirmDisabled: saving,
        onConfirm:   confirmSave,
        onClose:     confirmDiscard,   // the cancelText button routes here, not a plain close
      });
    } else {
      confirmDialogRef.current?.close?.();
    }
  }, [dialogOpen, saving]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <HeaderText
              title="Settings"
              subtitle="Configure system preferences"
            />
            <UnsavedChangesIndicator dirty={isDirty} />
          </Box>
        </Grid>
      </Grid>

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <Box mt={2}>
        {activeTab === 1 && <CompanyProfileTab          onDirtyChange={setDirty} />}
        {activeTab === 2 && <WorkingHoursTab            onDirtyChange={setDirty} />}
        {activeTab === 3 && <LeavePolicyTab              onDirtyChange={setDirty} />}
        {activeTab === 4 && <NotificationPreferencesTab onDirtyChange={setDirty} />}
        {activeTab === 5 && <EmailConfigurationTab />}
        {activeTab === 6 && <SecurityTab                onDirtyChange={setDirty} />}
        {activeTab === 7 && <DepartmentTab />}
      </Box>

      <ConfirmationDialog ref={confirmDialogRef} />
    </Box>
  );
};

export default Settings;