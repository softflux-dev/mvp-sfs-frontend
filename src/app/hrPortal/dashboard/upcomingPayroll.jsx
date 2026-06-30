// app/hrPortal/dashboard/upcomingPayroll.jsx — 
import { Box, Typography, Skeleton } from "@mui/material";
import CustomButton from "../../../components/customButton";

const UpcomingPayroll = ({ payroll, loading, onGoToPayroll }) => {
  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius:    "25px",
      p:               3,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "space-between",
      flexWrap:        "wrap",
      gap:             2,
    }}>
      <Box>
        <Typography fontSize="12px" color="text.secondary" mb={0.5}>
          Last Month Payroll
        </Typography>

        {loading ? (
          <>
            <Skeleton variant="text" width={140} height={28} />
            <Skeleton variant="text" width={120} height={48} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width={180} height={18} sx={{ mt: 0.5 }} />
          </>
        ) : !payroll?.hasData ? (
          <>
            <Typography fontSize="18px" fontWeight={700} color="text.primary">
              {payroll?.month || "—"} {payroll?.year || ""}
            </Typography>
            <Typography fontSize="22px" fontWeight={700} color="text.secondary">
              No data yet
            </Typography>
            <Typography fontSize="12px" color="text.secondary" mt={0.5}>
              Payroll not generated for last month
            </Typography>
          </>
        ) : (
          <>
            <Typography fontSize="18px" fontWeight={700} color="text.primary">
              {payroll.month} {payroll.year}
            </Typography>
            <Typography
              fontSize="32px" fontWeight={700} color="text.primary"
              lineHeight={1.1}
              sx={{
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}
            >
              Rs {payroll.totalPayout.toLocaleString()}
            </Typography>
            <Typography fontSize="12px" color="text.secondary" mt={0.5}>
              Total payout for {payroll.employeeCount} employee{payroll.employeeCount !== 1 ? "s" : ""}
            </Typography>
          </>
        )}
      </Box>

      <CustomButton
        btnLabel="Go To Payroll"
        variant="gradient"
        handlePressBtn={onGoToPayroll}
      />
    </Box>
  );
};

export default UpcomingPayroll;