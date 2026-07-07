// src/app/employeePortal/salary/index.jsx — FULL REPLACEMENT
import { useState } from "react";
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
const tableHeader = [
  { id: "checkbox",   label: ""            },
  { id: "month",      label: "Month"       },
  { id: "baseSalary", label: "Base Salary" },
  { id: "bonus",      label: "Bonus"       },
  { id: "deductions", label: "Deductions"  },
  { id: "netPay",     label: "Net Pay"     },
  { id: "status",     label: "Status"      },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "payroll_checkbox",   // ← checkbox column (reuses existing case)
  "ps_month",
  "ps_base_salary",
  "ps_bonus",
  "ps_deductions",
  "ps_net_pay",
  "ps_payroll_status",  // ← new status chip case
  "ps_actions",         // ← new actions case (view + download)
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

  const { payslips, loading, error } = useMyPayslips(selectedYear);

  const latestSlip = payslips.length
    ? [...payslips].sort((a, b) => b.monthIndex - a.monthIndex)[0]
    : null;

  const totals = payslips.reduce(
    (acc, p) => ({
      base:       acc.base       + (p.baseSalary || 0),
      bonus:      acc.bonus      + (p.bonus      || 0),
      deductions: acc.deductions + (p.deductions || 0),
      net:        acc.net        + (p.netPay     || 0),
    }),
    { base: 0, bonus: 0, deductions: 0, net: 0 }
  );

  const tableData = [...payslips]
    .sort((a, b) => b.monthIndex - a.monthIndex)
    .map((p) => ({
      id:         p.id,
      month:      `${p.month} ${p.year}`,
      baseSalary: p.baseSalary,
      bonus:      p.bonus,
      deductions: p.deductions,
      netPay:     p.netPay,
      status:     p.status,   // "draft" | "finalized"
      _raw:       p,
    }));

  // ── Row selection ──────────────────────────────────────────────────────────
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

  // ── Per-row download (single payslip PDF) ─────────────────────────────────
  const handleDownloadRow = (row) => {
    const p   = row._raw;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(170, 36, 147);
    doc.text(`Payslip — ${row.month}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      14, 26
    );

    autoTable(doc, {
      startY: 32,
      body: [
        ["Required Working Days", String(p.requiredDays   ?? "—")],
        ["Present Days",          String(p.presentDays    ?? "—")],
        ["Absent Days",           String(p.absentDays     ?? "—")],
        ["Leave Days",            String(p.leaveDays      ?? "—")],
        ["Required Hours",        `${p.requiredHours  ?? 0} hrs`],
        ["Actual Hours Worked",   `${p.actualHours    ?? 0} hrs`],
        ["Extra Hours (Paid)",    `${p.extraHours ?? 0} hrs — Rs ${Number(p.extraAmount || 0).toLocaleString()}`],
        ["Shortfall Hours",       `${p.shortfallHours ?? 0} hrs`],
        ["Hourly Rate",           `Rs ${Number(p.hourlyRate || 0).toFixed(2)}/hr`],
        ["Base Monthly Salary",   `Rs ${Number(p.baseSalary || 0).toLocaleString()}`],
        ["Bonus",                 `Rs ${Number(p.bonus      || 0).toLocaleString()}`],
        ["Deductions",            `Rs ${Number(p.deductions || 0).toLocaleString()}`],
        ["Net Pay",               `Rs ${Number(p.netPay     || 0).toLocaleString()}`],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 90 }, 1: { halign: "right" } },
      bodyStyles:   { fontSize: 9 },
      styles:       { cellPadding: 4 },
      theme:        "striped",
    });

    doc.save(`payslip-${p.month}-${p.year}.pdf`);
  };

  const handleFilterChange = (f) => {
    if (f.year) {
      const yr = new Date(f.year).getFullYear();
      if (!isNaN(yr)) setSelectedYear(yr);
    }
  };

  const fmt = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

  // ── Bulk export PDF (selected rows, or all if none selected) ──────────────
  const handleExportPDF = () => {
    const toExport = selectedRows.length
      ? tableData.filter((r) => selectedRows.includes(r.id))
      : tableData;
    if (!toExport.length) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(170, 36, 147);
    doc.text(`Salary Summary — ${selectedYear}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      14, 26
    );

    autoTable(doc, {
      startY: 32,
      head: [["Month", "Base Salary", "Bonus", "Deductions", "Net Pay", "Status"]],
      body: toExport.map((r) => [
        r.month,
        `Rs ${Number(r.baseSalary || 0).toLocaleString()}`,
        `Rs ${Number(r.bonus      || 0).toLocaleString()}`,
        `Rs ${Number(r.deductions || 0).toLocaleString()}`,
        `Rs ${Number(r.netPay     || 0).toLocaleString()}`,
        r.status || "—",
      ]),
      headStyles:         { fillColor: [170, 36, 147], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles:         { fontSize: 8 },
      alternateRowStyles: { fillColor: [250, 245, 255] },
      styles:             { cellPadding: 3 },
    });

    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(10);
    doc.setTextColor(170, 36, 147);
    doc.text(`Total Net Pay: Rs ${toExport.reduce((s, r) => s + (r.netPay || 0), 0).toLocaleString()}`, 14, finalY);

    doc.save(`salary-${selectedYear}.pdf`);
    setExportSuccess(true);
  };

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="My Salary"
            subtitle="View your payslips and salary history"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel={
                selectedRows.length > 0
                  ? `Export (${selectedRows.length})`
                  : "Export PDF"
              }
              variant="gradient"
              startIcon={
                <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
              }
              handlePressBtn={handleExportPDF}
              isDisabled={!payslips.length || loading}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Year filter ───────────────────────────────────────────────────── */}
      <Filter
        mode="salary_history"
        onFilterChange={handleFilterChange}
        defaultValues={{ year: new Date(selectedYear, 0, 1) }}
      />

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <Box mt={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      )}

      {/* ── Empty ─────────────────────────────────────────────────────────── */}
      {!loading && !error && payslips.length === 0 && (
        <Box
          display="flex" flexDirection="column" alignItems="center"
          justifyContent="center" mt={2} py={10} bgcolor="#fff" borderRadius="25px"
        >
          <Typography fontSize="32px" mb={1}>💰</Typography>
          <Typography fontSize="15px" fontWeight={600} color="text.primary" mb={0.5}>
            No payroll data for {selectedYear}
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            Your payslips will appear here once HR generates payroll.
          </Typography>
        </Box>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {!loading && payslips.length > 0 && (
        <>
          {/* Stat cards */}
          <Grid container spacing={2} mt={1} mb={2}>
            {[
              {
                label:  `Net Pay — ${latestSlip?.month}`,
                value:  fmt(latestSlip?.netPay),
                sub:    `${latestSlip?.month} ${latestSlip?.year}`,
                accent: "#AA2493",
                bg:     "#FDF4FF",
              },
              {
                label:  "Base Salary",
                value:  fmt(latestSlip?.baseSalary),
                sub:    "Monthly gross",
              },
              {
                label:  "Bonus",
                value:  fmt(latestSlip?.bonus),
                sub:    latestSlip?.bonus > 0 ? "This month" : "None this month",
                accent: latestSlip?.bonus > 0 ? "#04C373" : "text.secondary",
              },
              {
                label:  "Deductions",
                value:  fmt(latestSlip?.deductions),
                sub:    latestSlip?.deductions > 0
                  ? `${latestSlip?.shortfallHours}h shortfall`
                  : "No deductions",
                accent: latestSlip?.deductions > 0 ? "#FF3B30" : "text.secondary",
              },
              {
                label:  "Present Days",
                value:  `${latestSlip?.presentDays} / ${latestSlip?.requiredDays}`,
                sub:    `${latestSlip?.absentDays} absent`,
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

          {/* Table */}
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
    </>
  );
};

export default Salary;