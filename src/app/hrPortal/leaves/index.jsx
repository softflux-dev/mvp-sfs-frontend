// src/app/hrPortal/leaves/index.jsx — Phase 5 (Leave Management Enhancement)
// Now a thin page shell: header + CustomTabs, delegating all content to
// leaveRequestsTab.jsx and leaveBalanceTab.jsx.

import { useState } from "react";
import { Box, Grid } from "@mui/material";
import HeaderText  from "../../../components/headerText";
import CustomTabs   from "../../../components/tabs";
import LeaveRequestsTab from "./leaveRequestsTab";
import LeaveBalanceTab  from "./leaveBalanceTab";

const MAIN_TABS = [
  { id: 1, label: "Leave Requests" },
  { id: 2, label: "Leave Balance"  },
];

const LeaveManagement = () => {
  const [mainTab, setMainTab] = useState(1);

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText title="Leave Management" subtitle="Review requests and monitor company-wide leave balances" />
        </Grid>
      </Grid>

      <CustomTabs tabs={MAIN_TABS} activeTab={mainTab} onTabChange={setMainTab} />

      <Box mt={2}>
        {mainTab === 1 && <LeaveRequestsTab />}
        {mainTab === 2 && <LeaveBalanceTab />}
      </Box>
    </>
  );
};

export default LeaveManagement;