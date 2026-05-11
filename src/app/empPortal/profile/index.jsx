// profile/index.jsx
import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText  from "../../../components/headerText";
import CustomTabs  from "../../../components/tabs";
import ProfileHeader from "./profileHeader";
import PersonalTab   from "./tabs/personalTab";
import SecurityTab   from "./tabs/securityTab";



// ── Static mock — swap with API/redux data ─────────────────────────────
const MOCK_PROFILE = {
  name:         "John Doe",
  status:       "Active",
  designation:  "Senior Developer",
  department:   "Engineering",
  empId:        "EMP-2024-042",
  email:        "john.doe@company.com",
  phone:        "+1 (555) 123-4567",
  joiningDate:  "2024-06-15",
  empType:      "Full-time",
  workingHours: "8 hours",
};

const tabs = [
  { id: 1, label: "Personal"  },
  { id: 2, label: "Security"  },
  
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(1);



  return (
    <Box>
      {/* ── Page header ── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="Profile"
            subtitle="Configure system preferences"
          />
        </Grid>
      </Grid>

      {/* ── Employee card ── */}
      <ProfileHeader profile={MOCK_PROFILE}  />

      {/* ── Tabs ── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab content ── */}
      <Box mt={2}>
        {activeTab === 1 && <PersonalTab  profile={MOCK_PROFILE} />}
        {activeTab === 2 && <SecurityTab />}
       
      </Box>
    </Box>
  );
};

export default Profile;