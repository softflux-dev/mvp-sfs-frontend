// src/app/employeePortal/salary/index.jsx — Phase 4 fix (Leave Management Enhancement)
// FIX: "Deductions" (table column, stat card, PDF export) only ever reflected
// the shortfall-hours deduction — unpaidLeaveDeduction was silently excluded,
// so summing Base+Bonus+Overtime−Deductions never matched Net Pay. Combined
// here for the summary views. Safe to combine (unlike HR's payroll table)
// because employees have no edit-payroll path that could double-count it —
// the itemized ViewPayslipDialog still shows both lines separately.

import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import jsPDF     from "jspdf";
import autoTable from "jspdf-autotable";

import HeaderText        from "../../../components/headerText";
import CustomButton      from "../../../components/customButton";
import Filter            from "../../../components/filterBar/filter";
import PaginatedTable    from "../../../components/dynamicTable";
import SuccessPopup      from "../../../components/popups/confirmationDialog";
import ViewPayslipDialog from "./viewPayslipDialog";
import { useMyPayslips } from "../../../hooks/empSalary";

import ExportIcon    from "../../../assets/icons/download-icon-white.svg";
import DownloadIcon  from "../../../assets/icons/download.svg";
import ViewIcon      from "../../../assets/icons/view.svg";
import { useFormatCurrency, formatCurrencyForPdf } from "../../../utils/formatCurrency";

import PayslipTemplate from "../../hrPortal/payroll/payslipTemplate";
import { getLogo, captureToPdfBase64 } from "../../hrPortal/payroll/viewPayslipDialog";
import { createReportDoc, addReportTable, savePdf } from "../../../utils/reportPdfExport";

const MONTH_INDEX = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const tableHeader = [
  { id: "checkbox",   label: ""            },
  { id: "month",      label: "Month"       },
  { id: "baseSalary", label: "Base Salary" },
  { id: "bonus",      label: "Bonus"       },
  { id: "overtime",   label: "Overtime Pay"    },
  { id: "deductions", label: "Deductions"  },
  { id: "netPay",     label: "Net Pay"     },
  { id: "status",     label: "Status"      },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "payroll_checkbox",
  "ps_month",
  "ps_base_salary",
  "ps_bonus",
  "payroll_overtime",
  "ps_deductions",
  "ps_net_pay",
  "ps_payroll_status",
  "ps_actions",
];

const StatCard = ({ label, value, sub, accent = "text.primary", bg = "#fff" }) => (
  <Box sx={{ backgroundColor: bg, borderRadius: "16px", p: 2.5, height: "100%" }}>
    <Typography fontSize="12px" color="text.secondary" fontWeight={500} mb={0.5}>
      {label}
    </Typography>
    <Typography fontSize="22px" fontWeight={700} color={accent} lineHeight={1.2}>
      {value}
    </Typography>
    {sub && (
      <Typography fontSize="11px" color="text.secondary" mt={0.5}>{sub}</Typography>
    )}
  </Box>
);

const Salary = () => {
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedSlip,  setSelectedSlip]  = useState(null);
  const [selectedRows,  setSelectedRows]  = useState([]);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { format } = useFormatCurrency();

  const { payslips, company, loading, error } = useMyPayslips(selectedYear);

  // ── Branded per-row PDF ────────────────────────────────────────────────────
  const [logoDataUrl,  setLogoDataUrl]  = useState("");
  const [rowToCapture, setRowToCapture] = useState(null);
  const rowTemplateRef = useRef();
  const companyName = company?.companyName?.trim() || "Sprintexa";

  useEffect(() => {
    if (company?.logoUrl) getLogo(company.logoUrl).then(setLogoDataUrl);
  }, [company?.logoUrl]);

  const latestSlip = payslips.length
    ? [...payslips].sort((a, b) => b.monthIndex - a.monthIndex)[0]
    : null;

  // NEW — combined deduction figure (shortfall + unpaid leave) so it
  // reconciles with Net Pay everywhere below.
  const latestSlipDeductions = (latestSlip?.deductions || 0) + (latestSlip?.unpaidLeaveDeduction || 0);

 const totals = payslips.reduce(
    (acc, p) => ({
      base:       acc.base       + (p.baseSalary  || 0),
      bonus:      acc.bonus      + (p.bonus       || 0),
      overtime:   acc.overtime   + (p.extraAmount || 0),
      deductions: acc.deductions + (p.deductions  || 0) + (p.unpaidLeaveDeduction || 0),
      net:        acc.net        + (p.netPay      || 0),
    }),
    { base: 0, bonus: 0, overtime: 0, deductions: 0, net: 0 }
  );

  const tableData = [...payslips]
    .sort((a, b) => b.monthIndex - a.monthIndex)
    .map((p) => ({
      id:           p.id,
      month:        `${p.month} ${p.year}`,
      baseSalary:   p.baseSalary,
      bonus:        p.bonus,
      // Combined so the table column and PDF export match Net Pay. The
      // itemized ViewPayslipDialog still breaks this into its two real
      // components (Shortfall Deduction / Unpaid Leave Deduction).
      deductions:   (p.deductions || 0) + (p.unpaidLeaveDeduction || 0),
      netPay:       p.netPay,
      extraHours:   p.extraHours,
      extraAmount:  p.extraAmount,
      otMultiplier: p.otMultiplier,
      status:       p.status,
      _raw:         p,
    }));

  const handleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const handleSelectAll = () =>
    setSelectedRows((prev) =>
      prev.length === tableData.length ? [] : tableData.map((r) => r.id)
    );

  const handleView = (row) => {
    setSelectedSlip(row._raw);
    setViewOpen(true);
  };

  // ── Per-row download — now uses the branded PayslipTemplate ───────────────
  const handleDownloadRow = async (row) => {
    setRowToCapture(row._raw);
    // wait one tick for the hidden template to paint
    await new Promise((r) => setTimeout(r, 300));
    if (!rowTemplateRef.current) { setRowToCapture(null); return; }
    try {
      const base64 = await captureToPdfBase64(rowTemplateRef.current);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `payslip-${row._raw.month}-${row._raw.year}.pdf`;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setRowToCapture(null);
    }
  };

  const handleFilterChange = (f) => {
    if (f.year) {
      const yr = new Date(f.year).getFullYear();
      if (!isNaN(yr)) setSelectedYear(yr);
    }
  };

  const fmt = (n) => format(n, { decimals: 0 });

  
const handleExportPDF = async () => {
  const toExport = selectedRows.length
    ? tableData.filter((r) => selectedRows.includes(r.id))
    : tableData;
  if (!toExport.length) return;

  const branding = {
    logoUrl:     company?.logoUrl     || "",
    companyName: company?.companyName || "",
  };

  const doc = await createReportDoc(
    "Salary Summary Report",
    String(selectedYear),          // period label → shows "· 2026" in the header
    branding
  );

  const finalY = addReportTable(doc, {
    head: ["Month", "Base Salary", "Bonus", "Overtime", "Deductions", "Net Pay", "Status"],
    body: toExport.map((r) => [
      r.month,
      formatCurrencyForPdf(r.baseSalary  || 0, { decimals: 0 }),
      formatCurrencyForPdf(r.bonus       || 0, { decimals: 0 }),
      formatCurrencyForPdf(r.extraAmount || 0, { decimals: 0 }),
      formatCurrencyForPdf(r.deductions  || 0, { decimals: 0 }),
      formatCurrencyForPdf(r.netPay      || 0, { decimals: 0 }),
      r.status || "—",
    ]),
    startY: 44,
    companyName: branding.companyName,
  });

  // Total net pay line under the table (brand pink), matching your old export
  doc.setFontSize(10);
  doc.setTextColor(170, 36, 147);
  doc.text(
    `Total Net Pay: ${formatCurrencyForPdf(
      toExport.reduce((s, r) => s + (r.netPay || 0), 0),
      { decimals: 0 }
    )}`,
    14, finalY + 8
  );

  savePdf(doc, `salary-${selectedYear}.pdf`);
  setExportSuccess(true);
};

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText title="My Salary" subtitle="View your payslips and salary history" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel={selectedRows.length > 0 ? `Export (${selectedRows.length})` : "Export PDF"}
              variant="gradient"
              startIcon={<img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />}
              handlePressBtn={handleExportPDF}
              isDisabled={!payslips.length || loading}
            />
          </Box>
        </Grid>
      </Grid>

      <Filter
        mode="salary_history"
        onFilterChange={handleFilterChange}
        defaultValues={{ year: new Date(selectedYear, 0, 1) }}
      />

      {error && (
        <Box mt={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      )}

      {!loading && !error && payslips.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center"
          justifyContent="center" mt={2} py={10} bgcolor="#fff" borderRadius="25px">
          <Typography fontSize="32px" mb={1}>💰</Typography>
          <Typography fontSize="15px" fontWeight={600} color="text.primary" mb={0.5}>
            No payroll data for {selectedYear}
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            Your payslips will appear here once HR generates payroll.
          </Typography>
        </Box>
      )}

      {!loading && payslips.length > 0 && (
        <>
          <Grid container spacing={2} mt={1} mb={2}>
            {[
              {
                label:  `Net Pay — ${latestSlip?.month}`,
                value:  fmt(latestSlip?.netPay),
                sub:    `${latestSlip?.month} ${latestSlip?.year}`,
                accent: "#AA2493",
                bg:     "#FDF4FF",
              },
                           { label: "Base Salary", value: fmt(latestSlip?.baseSalary), sub: "Monthly gross" },
              {
                label:  "Bonus",
                value:  fmt(totals.bonus),
                sub:    `${selectedYear} total`,
                accent: totals.bonus > 0 ? "#04C373" : "text.secondary",
              },
              {
                label:  "Overtime",
                value:  fmt(totals.overtime),
                sub:    `${selectedYear} total`,
                accent: totals.overtime > 0 ? "#04C373" : "text.secondary",
              },
              {
                label:  "Deductions",
                value:  fmt(totals.deductions),
                sub:    `${selectedYear} total`,
                accent: totals.deductions > 0 ? "#FF3B30" : "text.secondary",
              },
          
              {
                label:  `${selectedYear} Net Total`,
                value:  fmt(totals.net),
                sub:    `${payslips.length} month${payslips.length !== 1 ? "s" : ""}`,
                accent: "#022179",
              },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          <Box bgcolor="#fff" borderRadius="25px" p={1}>
            <PaginatedTable
              tableHeader={tableHeader}
              tableData={tableData}
              displayRows={displayRows}
              isLoading={false}
              onViewClick={handleView}
              onDownloadClick={handleDownloadRow}
              viewIcon={ViewIcon}
              downloadIcon={DownloadIcon}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
            />
          </Box>
        </>
      )}

      <ViewPayslipDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedSlip(null); }}
        payslip={selectedSlip}
        company={company}
      />

      <SuccessPopup
        open={exportSuccess}
        onClose={() => setExportSuccess(false)}
        message={
          selectedRows.length > 0
            ? `${selectedRows.length} payslip(s) exported successfully`
            : "Salary PDF exported successfully"
        }
        autoClose
        autoCloseDelay={2000}
      />

      {/* Hidden branded template for per-row download */}
      {rowToCapture && (
        <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
          <Box ref={rowTemplateRef}>
            <PayslipTemplate
              payroll={rowToCapture}
              month={MONTH_INDEX[rowToCapture.month] ?? 0}
              year={rowToCapture.year}
              logoDataUrl={logoDataUrl}
              companyName={companyName}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default Salary;