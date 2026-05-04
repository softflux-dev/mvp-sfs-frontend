// tabs/leavePolicyTab.jsx
import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";

import CustomInputLabel from "../../../../components/customInputLabel";
import TextInput        from "../../../../components/textInput";
import CustomButton     from "../../../../components/customButton";
import SuccessPopup     from "../../../../components/popups/confirmationDialog";
import CustomSwitch     from "../../../../components/switch";

const LeavePolicyTab = () => {
  const [formData, setFormData] = useState({
    annualLeaveDays:       "1",
    sickLeaveDays:         "1",
    emergencyLeaveDays:    "1",
    shortLeaveMaxDuration: "1",
    autoApprove:           false,
    autoApproveDays:       "1",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    console.log("Leave policy:", formData);
    setSaveSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      <Typography fontSize="18px" fontWeight={600} color="text.darkGray" mb={3}>
        Leave Policies
      </Typography>

      {/* ── Fields ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Annual Leave Days" />
          <TextInput
            placeholder="1"
            value={formData.annualLeaveDays}
            onChange={handleChange("annualLeaveDays")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Sick Leave Days" />
          <TextInput
            placeholder="1"
            value={formData.sickLeaveDays}
            onChange={handleChange("sickLeaveDays")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Emergency Leave Days" />
          <TextInput
            placeholder="1"
            value={formData.emergencyLeaveDays}
            onChange={handleChange("emergencyLeaveDays")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInputLabel label="Short Leave Max Duration (hours)" />
          <TextInput
            placeholder="1"
            value={formData.shortLeaveMaxDuration}
            onChange={handleChange("shortLeaveMaxDuration")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
          />
        </Grid>

      </Grid>

      {/* ── Auto-approve toggle ──────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <CustomSwitch
          checked={formData.autoApprove}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, autoApprove: e.target.checked }))
          }
        />
        <Typography fontSize="13px" color="text.secondary">
          Auto-approve leaves under X days
        </Typography>

        <Box sx={{ width: 100 }}>
          <TextInput
            value={formData.autoApproveDays}
            onChange={handleChange("autoApproveDays")}
            inputBgColor="#F5F5F5"
            fullWidth
            type="number"
            disabled={!formData.autoApprove}
          />
        </Box>
      </Box>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel="Save Changes"
          variant="gradient"
          handlePressBtn={handleSave}
        />
      </Box>

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Leave policy saved successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default LeavePolicyTab;