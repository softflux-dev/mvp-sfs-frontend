// employees/employeeDetailTabs/salaryTab.jsx
import { Box, Grid, Typography } from "@mui/material";
import PaginatedTable from "../../../../components/dynamicTable";
import downloadIcon   from "../../../../assets/icons/download.svg";

// ── Mock payslip history ──────────────────────────────────────────────────────
const mockPayslips = [
  { id: 1, month: "February 2026", base: "Rs120000", bonus: "Rs10000", deductions: "Rs5000", netPay: "Rs125000", payslipStatus: "Paid" },
  { id: 2, month: "January 2026",  base: "Rs120000", bonus: "Rs0",     deductions: "Rs5000", netPay: "Rs115000", payslipStatus: "Paid" },
  { id: 3, month: "December 2025", base: "Rs120000", bonus: "Rs15000", deductions: "Rs5000", netPay: "Rs130000", payslipStatus: "Paid" },
];

const tableHeader = [
  { id: "month",      label: "Month"      },
  { id: "base",       label: "Base"       },
  { id: "bonus",      label: "Bonus"      },
  { id: "deductions", label: "Deductions" },
  { id: "netPay",     label: "Net Pay"    },
  { id: "status",     label: "Status"     },
  { id: "actions",    label: "Actions"    },
];

const displayRows = [
  "month",
  "base",
  "payslip_bonus",
  "payslip_deductions",
  "netPay",
  "payslip_status",
  "payslip_download",
];

// ── Stat card ─────────────────────────────────────────────────────────────────
const SalaryStatCard = ({ label, value }) => (
  <Box
    sx={{
      bgcolor: "#fff",
      border: "1px solid #F0F0F0",
      borderRadius: "16px",
      p: 2.5,
      flex: 1,
    }}
  >
    <Typography fontSize="12px" color="text.secondary" fontWeight={500} mb={0.5}>
      {label}
    </Typography>
    <Typography fontSize="26px" fontWeight={700} color="text.primary">
      {value}
    </Typography>
  </Box>
);

const SalaryTab = ({ employee = {} }) => {
  const monthlySalary  = employee.monthlySalary ?? 120000;
  const employmentType = employee.type          || "Full-time";

  const handleDownload = (row) => {
    console.log("Download payslip:", row.month);
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Top stat cards ───────────────────────────────────────────────── */}
      <Box display="flex" gap={2} mb={3}>
        <SalaryStatCard
          label="Monthly Salary"
          value={`Rs${Number(monthlySalary).toLocaleString()}`}
        />
        <SalaryStatCard
          label="Employment Type"
          value={employmentType}
        />
      </Box>

      {/* ── Payslip History ──────────────────────────────────────────────── */}
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={1.5}>
        Payslip History
      </Typography>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockPayslips}
          displayRows={displayRows}
          downloadIcon={downloadIcon}
          onDownloadClick={handleDownload}
          isLoading={false}
        />
      </Box>

    </Box>
  );
};

export default SalaryTab;