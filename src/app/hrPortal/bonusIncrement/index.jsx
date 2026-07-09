// src/app/hrPortal/bonusIncrement/index.jsx — 
import { useState } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText  from "../../../components/headerText";
import CustomTabs  from "../../../components/tabs";
import BonusTab    from "./bonusTab";
import IncrementTab from "./incrementTab";

const tabs = [
  { id: 1, label: "Bonus"     },
  { id: 2, label: "Increment" },
];

const BonusIncrement = () => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <Box>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="Bonus & Increment"
            subtitle="Manage employee bonuses and salary increments"
          />
        </Grid>
      </Grid>

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <Box mt={2}>
        {activeTab === 1 && <BonusTab />}
        {activeTab === 2 && <IncrementTab />}
      </Box>
    </Box>
  );
};

export default BonusIncrement;