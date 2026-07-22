// employees/employeeDetailTabs/salaryTab.jsx — 
import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PaginatedTable from "../../../../components/dynamicTable";
import downloadIcon   from "../../../../assets/icons/download.svg";
import { getEmployeePayrollHistoryApi } from "../../../../api/modules/payroll";
import { captureToPdfBase64, getLogo } from "../../../hrPortal/payroll/viewPayslipDialog";
import PayslipTemplate from "../../../hrPortal/payroll/payslipTemplate";
import { useFormatCurrency } from "../../../../utils/formatCurrency";

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
  const [payslips,     setPayslips]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { format } = useFormatCurrency();

  useEffect(() => {
    if (!employee.id) return;
    setLoading(true);
    getEmployeePayrollHistoryApi(employee.id).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setPayslips(res.data.data.payslips || []);
      }
    }).finally(() => setLoading(false));
  }, [employee.id]);

  const monthlySalary  = employee.monthlySalary ?? 0;
  const employmentType = employee.type          || "—";

  // ── Table rows — most recent month/year first ────────────────────────────
  const sortedPayslips = [...payslips].sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);

  const tableData = sortedPayslips.map((p) => ({
    id:            p.id,
    month:         `${p.month} ${p.year}`,
    base:   format(p.baseSalary || 0, { decimals: 0 }),
    bonus:         p.bonus,
    deductions:    p.deductions,
   netPay: format(p.netPay     || 0, { decimals: 0 }),
    payslipStatus: p.status === "finalized" ? "Paid" : "Draft",
  }));

  // ── Download — renders the same PayslipTemplate off-screen, captures it
  // via html2canvas, exactly like ViewPayslipDialog's handleDownload ────────
  const handleDownload = async (row) => {
    const full = sortedPayslips.find((p) => p.id === row.id);
    if (!full) return;

    setDownloadingId(row.id);
    try {
      const logoDataUrl = await getLogo();

      // Off-screen container — same pattern as HiddenPayslipCapture
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);

      await new Promise((resolve) => {
        root.render(
          <PayslipTemplate
            payroll={full}
            month={full.monthIndex}
            year={full.year}
            logoDataUrl={logoDataUrl}
          />
        );
        // Wait a tick for paint before capturing
        setTimeout(resolve, 300);
      });

      const base64 = await captureToPdfBase64(container.firstChild);

      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `payslip-${(full.name || employee.name || "employee").replace(/\s+/g, "-")}-${full.month}-${full.year}.pdf`;
      link.click();

      root.unmount();
      document.body.removeChild(container);
    } catch (err) {
      console.error("Payslip download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Top stat cards ───────────────────────────────────────────────── */}
      <Box display="flex" gap={2} mb={3}>
        <SalaryStatCard
          label="Monthly Salary"
         value={format(monthlySalary, { decimals: 0 })}
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
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={28} sx={{ color: "#AA2493" }} />
          </Box>
        ) : (
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={tableData}
            displayRows={displayRows}
            downloadIcon={downloadIcon}
            onDownloadClick={handleDownload}
            isLoading={false}
          />
        )}
      </Box>

    </Box>
  );
};

export default SalaryTab;