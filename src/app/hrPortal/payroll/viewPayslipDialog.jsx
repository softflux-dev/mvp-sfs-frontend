import { Box, Typography, Divider } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton from "../../../components/customButton";
import DownloadIcon from "../../../assets/icons/download-icon-white.svg";

const ViewPayslipDialog = ({ open, onClose, payroll = {} }) => {
  const month = "March 2026"; // replace with dynamic month if needed

  const rows = [
    { label: "Working Days", value: payroll.working    ?? 22,                        color: "text.primary" },
    { label: "Present Days", value: payroll.present    ?? 20,                        color: "text.primary" },
    { label: "Leave Days",   value: String(payroll.leave ?? 2).padStart(2, "0"),      color: "text.primary" },
    { label: "Base Salary",  value: `$${(payroll.baseSalary ?? 7395).toLocaleString()}`, color: "text.primary" },
    { label: "Bonus",        value: `+$${(payroll.bonus ?? 444).toLocaleString()}`,   color: "#04C373"      },
    { label: "Deductions",   value: `-$${(payroll.deductions ?? 94).toLocaleString()}`, color: "#FF0000"    },
  ];

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
      <DialogHeader
        title={`Payslip — ${month}`}
        onClose={onClose}
        hideTitle={false}
      />

      <DialogBody>

        
        {/* ── Employee info ─────────────────────────────────────────────── */}
        <Box mb={3}>
          <Typography fontSize="20px" fontWeight={700} color="text.primary">
            {payroll.name || "Sarah Johnson"}
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            {payroll.designation || "Software Engineer"}
          </Typography>
        </Box>
         <Box sx={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "16px",
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}>

        {/* ── Payslip card ──────────────────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "14px",
            px: 3, py: 2.5,
          }}
        >
          {rows.map((row, idx) => (
            <Box key={row.label}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={1.5}
              >
                <Typography fontSize="13px" color="text.secondary">
                  {row.label}
                </Typography>
                <Typography fontSize="13px" fontWeight={500} color={row.color}>
                  {row.value}
                </Typography>
              </Box>
              {idx < rows.length - 1 && (
                <Divider sx={{ borderColor: "#E8E8E8" }} />
              )}
            </Box>
          ))}

          {/* Net Pay */}
          <Divider sx={{ borderColor: "#E8E8E8" }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pt={2}
          >
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              Net Pay
            </Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              ${(payroll.netPay ?? 7745).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        </Box>
      </DialogBody>

      {/* ── Download button ───────────────────────────────────────────── */}
      <Box px={3} pb={3} display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel="Download"
          variant="gradient"
          startIcon={
            <img src={DownloadIcon} alt="download" style={{ width: 15, height: 15 }} />
          }
          handlePressBtn={() => console.log("Download payslip:", payroll)}
        />
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;