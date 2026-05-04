// app/hrPortal/dashboard/upcomingPayroll.jsx
import { Box, Typography } from "@mui/material";
import CustomButton from "../../../components/customButton";

const UpcomingPayroll = ({ onGoToPayroll }) => (
  <Box
    sx={{
      backgroundColor: "#fff",
      borderRadius:    "25px",
      p:               3,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "space-between",
      flexWrap:        "wrap",
      gap:             2,
    }}
  >
    <Box>
      <Typography fontSize="12px" color="text.secondary" mb={0.5}>
        Upcoming Payroll
      </Typography>
      <Typography fontSize="18px" fontWeight={700} color="text.primary">
        March 31, 2026
      </Typography>
      <Typography
        fontSize="32px"
        fontWeight={700}
        color="text.primary"
        lineHeight={1.1}
        sx={{
          background:           "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
        }}
      >
        $70,831
      </Typography>
      <Typography fontSize="12px" color="text.secondary" mt={0.5}>
        Estimated total payout for 12 employees
      </Typography>
    </Box>

    <CustomButton
      btnLabel="Go To Payroll"
      variant="gradient"
      handlePressBtn={onGoToPayroll}
      sx={{ px: 4, py: 1.5 }}
    />
  </Box>
);

export default UpcomingPayroll;