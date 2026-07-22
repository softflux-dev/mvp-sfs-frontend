// src/app/employeePortal/salary/viewPayslipDialog.jsx — 
import { Box, Divider, Typography } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton from "../../../components/customButton";
import jsPDF       from "jspdf";
import autoTable   from "jspdf-autotable";
import { useFormatCurrency, formatCurrencyForPdf } from "../../../utils/formatCurrency";
import DownloadIcon from "../../../assets/icons/download-icon-white.svg";

const BREAKDOWN_LABELS = [
  { key: "basicSalary",        label: "Basic Salary"        },
  { key: "securityAllowance",  label: "Security Allowance"  },
  { key: "medicalAllowance",   label: "Medical Allowance"   },
  { key: "transportAllowance", label: "Transport Allowance" },
  { key: "lunchAllowance",     label: "Lunch Allowance"     },
  { key: "housingAllowance",   label: "Housing Allowance"   },
];

const Row = ({ label, value, bold, color }) => (
  <Box
    display="flex" justifyContent="space-between" alignItems="center"
    py={1.25}
    sx={{ borderBottom: "1px solid #F3F4F6" }}
  >
    <Typography fontSize="13px" color="text.secondary" fontWeight={bold ? 600 : 400}>
      {label}
    </Typography>
    <Typography
      fontSize={bold ? "14px" : "13px"}
      fontWeight={bold ? 700 : 500}
      color={color || (bold ? "#AA2493" : "text.primary")}
    >
      {value}
    </Typography>
  </Box>
);

const SectionLabel = ({ children }) => (
  <Typography
    fontSize="11px" fontWeight={700} color="text.secondary"
    textTransform="uppercase" letterSpacing="0.6px"
    mt={2} mb={0.5}
  >
    {children}
  </Typography>
);

const ViewPayslipDialog = ({ open, onClose, payslip }) => {
    const { format } = useFormatCurrency();         

  if (!payslip) return null;

  const fmt    = (n) => format(n, { decimals: 0 });  
  const pdfFmt = (n) => formatCurrencyForPdf(n, { decimals: 0 });          
  const title = `${payslip.month} ${payslip.year}`;

  // ── Download individual payslip as PDF ────────────────────────────────────
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(170, 36, 147);
    doc.text(`Payslip — ${title}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      14, 26
    );

    autoTable(doc, {
      startY: 32,
      body: [
        ["Required Working Days", String(payslip.requiredDays   ?? "—")],
        ["Present Days",          String(payslip.presentDays    ?? "—")],
        ["Absent Days",           String(payslip.absentDays     ?? "—")],
        ["Leave Days",            String(payslip.leaveDays      ?? "—")],
        ["Required Hours",        `${payslip.requiredHours  ?? 0} hrs`],
        ["Actual Hours Worked",   `${payslip.actualHours    ?? 0} hrs`],
        ["Shortfall Hours",       `${payslip.shortfallHours ?? 0} hrs`],
        ["Hourly Rate",         `${formatCurrencyForPdf(payslip.hourlyRate || 0)}/hr`],
        ["Base Monthly Salary", pdfFmt(payslip.baseSalary)],
        ["Bonus",               pdfFmt(payslip.bonus)],
        ["Deductions",          pdfFmt(payslip.deductions)],
        ["Net Pay",             pdfFmt(payslip.netPay)],
      ],
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { halign: "right" },
      },
      headStyles:   { fillColor: [170, 36, 147], textColor: 255 },
      bodyStyles:   { fontSize: 9 },
      styles:       { cellPadding: 4 },
      theme:        "striped",
    });

    doc.save(`payslip-${payslip.month}-${payslip.year}.pdf`);
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="500px" fullWidth>
      <DialogHeader title={`Payslip — ${title}`} onClose={onClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          maxHeight: "65vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
        }}>
          <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", px: 2.5, py: 1.5 }}>

            {/* ── Attendance ──────────────────────────────────────────────── */}
            <SectionLabel>Attendance</SectionLabel>
            <Row label="Required Working Days" value={payslip.requiredDays   ?? "—"} />
            <Row label="Present Days"          value={payslip.presentDays    ?? "—"} />
            <Row label="Absent Days"           value={payslip.absentDays     ?? "—"} />
            <Row label="Leave Days"            value={payslip.leaveDays      ?? "—"} />

            {/* ── Hours ───────────────────────────────────────────────────── */}
            <SectionLabel>Hours</SectionLabel>
            <Row label="Required Hours"      value={`${payslip.requiredHours  ?? 0} hrs`} />
            <Row label="Actual Hours Worked" value={`${payslip.actualHours    ?? 0} hrs`} />
            <Row
              label="Shortfall Hours"
              value={`${payslip.shortfallHours ?? 0} hrs`}
              color={(payslip.shortfallHours || 0) > 0 ? "#FF3B30" : "text.primary"}
            />
          <Row label="Hourly Rate" value={`${format(payslip.hourlyRate || 0)}/hr`} />

            {/* ── Salary ──────────────────────────────────────────────────── */}
            <SectionLabel>Salary</SectionLabel>
            <Row label="Base Monthly Salary" value={fmt(payslip.baseSalary)} />
            <Row label="Bonus"               value={`+ ${fmt(payslip.bonus)}`}      color="#04C373" />
            <Row label="Deductions"          value={`- ${fmt(payslip.deductions)}`} color="#FF3B30" />

            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />

            {/* Net pay */}
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
              <Typography fontSize="15px" fontWeight={700} color="text.primary">
                Net Pay
              </Typography>
              <Typography fontSize="17px" fontWeight={700} color="#AA2493">
                {fmt(payslip.netPay)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogBody>

      {/* Download button */}
      <Box px={3} pb={3} display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel="Download PDF"
          variant="gradient"
          startIcon={
            <img src={DownloadIcon} alt="download" style={{ width: 15, height: 15 }} />
          }
          handlePressBtn={handleDownload}
        />
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;