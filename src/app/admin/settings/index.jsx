import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText from "../../../components/headerText";
import CustomTabs from "../../../components/tabs";

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

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <Box mt={2}>
        {activeTab === 1 && <CompanyProfileTab />}
        {activeTab === 2 && <WorkingHoursTab />}
        {activeTab === 3 && <LeavePolicyTab />}
        {activeTab === 4 && <NotificationPreferencesTab />}
        {activeTab === 5 && <EmailConfigurationTab />}
        {activeTab === 6 && <SecurityTab />}
        {activeTab === 7 && <DepartmentTab />}
       
      </Box>
    </Box>
  );
};

export default Settings;