// src/utils/generatePayslipPdf.js — NEW FILE
// Pure jsPDF — no html2canvas, no DOM, no React rendering.
// Generates a complete branded payslip PDF in < 100ms.
// Returns base64 string (without the data:application/pdf;base64, prefix).

import jsPDF from "jspdf";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmtN = (n) => Number(n || 0).toLocaleString("en-PK");

// Simulate gradient header with two rects + a blended middle strip
const drawHeader = (doc, pageW, h = 36) => {
  doc.setFillColor(2, 33, 121);   // #022179
  doc.rect(0, 0, pageW * 0.55, h, "F");
  doc.setFillColor(170, 36, 147); // #AA2493
  doc.rect(pageW * 0.45, 0, pageW * 0.55, h, "F");
  // Blend strip in the middle
  doc.setFillColor(80, 35, 135);
  doc.rect(pageW * 0.40, 0, pageW * 0.20, h, "F");
};

const drawSectionLabel = (doc, text, x, y, pageW, margin) => {
  doc.setTextColor(170, 36, 147);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(text, x, y);
  doc.setDrawColor(220, 180, 230);
  doc.setLineWidth(0.25);
  doc.line(x, y + 1.5, pageW - margin, y + 1.5);
};

const drawTableHead = (doc, x, w, y) => {
  doc.setFillColor(2, 33, 121);
  doc.roundedRect(x, y, w, 6.5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text("Component", x + 3, y + 4.3);
  doc.text("PKR", x + w - 3, y + 4.3, { align: "right" });
};

const drawTableRow = (doc, x, w, y, h, label, value, labelColor, bg, sub) => {
  doc.setFillColor(...bg);
  doc.rect(x, y, w, h, "F");
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.15);
  doc.line(x, y + h, x + w, y + h);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...labelColor);
  doc.text(label, x + 3, y + (sub ? 3.5 : 4.8));

  if (sub) {
    doc.setFontSize(6); doc.setTextColor(180, 180, 180);
    doc.text(sub, x + 3, y + h - 1.2);
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...labelColor);
  doc.text(fmtN(value), x + w - 3, y + 4.8, { align: "right" });
};

const drawTotalRow = (doc, x, w, y, label, value, textColor) => {
  doc.setFillColor(247, 240, 253);
  doc.roundedRect(x, y, w, 7, 1, 1, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 33, 121);
  doc.text(label, x + 3, y + 4.7);
  doc.setTextColor(...textColor);
  doc.text(fmtN(value), x + w - 3, y + 4.7, { align: "right" });
};

export const generatePayslipPdf = (payroll, month, year, logoDataUrl = "") => {
  const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW  = 210;
  const margin = 13;
  const cW     = pageW - margin * 2; // content width
  const hdrH   = 34;

  // ── HEADER ─────────────────────────────────────────────────────────────────
  drawHeader(doc, pageW, hdrH);

  // Logo box
  doc.setFillColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 0.18 }));
  doc.roundedRect(margin, 7, 18, 18, 2, 2, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", margin + 0.5, 7.5, 17, 17); }
    catch { /* fallback text */ }
  }
  if (!logoDataUrl) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("SF", margin + 9, 18, { align: "center" });
  }

  // Company info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text("Software Flux Solutions", margin + 21, 15);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 185, 230);
  doc.text("HR Management System", margin + 21, 20.5);

  // Slip title (right side)
  const mn = MONTH_NAMES[month] || "";
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15); doc.setFont("helvetica", "bold");
  doc.text("Salary Slip", pageW - margin, 14, { align: "right" });
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 185, 230);
  doc.text(`For the Month of ${mn}, ${year}`, pageW - margin, 20, { align: "right" });

  let y = hdrH + 8;

  // ── EMPLOYEE DETAILS ────────────────────────────────────────────────────────
  drawSectionLabel(doc, "EMPLOYEE DETAILS", margin, y, pageW, margin);
  y += 5;

  const empType =
    payroll.employmentType === "full_time" ? "Full-time" :
    payroll.employmentType === "part_time" ? "Part-time" :
    payroll.employmentType === "contract"  ? "Contract"  : "—";

  const empRows = [
    ["Employee Name", payroll.name || "—",        "Employee ID",     payroll.empId || "—"],
    ["Designation",   payroll.designation || "—", "Department",      payroll.department || "—"],
    ["Employment Type", empType,                  "Pay Period",      `${mn} ${year}`],
  ];

  const empGridH = empRows.length * 10 + 3;
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y - 2, cW, empGridH, 2, 2, "FD");

  // Vertical divider
  doc.setDrawColor(235, 235, 235);
  doc.line(margin + cW / 2, y - 2, margin + cW / 2, y - 2 + empGridH);

  empRows.forEach(([l1, v1, l2, v2], i) => {
    const ry = y + i * 10;
    if (i > 0) {
      doc.setDrawColor(238, 238, 238);
      doc.line(margin, ry - 1, margin + cW, ry - 1);
    }
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(l1.toUpperCase(), margin + 4, ry + 3);
    doc.text(l2.toUpperCase(), margin + cW / 2 + 4, ry + 3);
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 46);
    doc.text(v1, margin + 4, ry + 8.5);
    doc.text(v2, margin + cW / 2 + 4, ry + 8.5);
  });

  y += empGridH + 6;

  // ── EARNINGS & DEDUCTIONS ───────────────────────────────────────────────────
  const colW = (cW - 4) / 2;
  const lx   = margin;
  const rx   = margin + colW + 4;

  // Section labels
  drawSectionLabel(doc, "EARNINGS",   lx, y, lx + colW, 0);
  drawSectionLabel(doc, "DEDUCTIONS", rx, y, rx + colW, 0);
  y += 5;

  // Table heads
  drawTableHead(doc, lx, colW, y);
  drawTableHead(doc, rx, colW, y);
  y += 7.5;

  const bd = payroll.salaryBreakdown || {};
  const earningRows = [
    { label: "Basic Salary",        value: bd.basicSalary        ?? 0 },
    { label: "Security Allowance",  value: bd.securityAllowance  ?? 0 },
    { label: "Medical Allowance",   value: bd.medicalAllowance   ?? 0 },
    { label: "Transport Allowance", value: bd.transportAllowance ?? 0 },
    { label: "Lunch Allowance",     value: bd.lunchAllowance     ?? 0 },
    { label: "Housing Allowance",   value: bd.housingAllowance   ?? 0 },
  ];
  if ((payroll.bonus || 0) > 0) {
    earningRows.push({ label: "Bonus / Incentive", value: payroll.bonus, isBonus: true });
  }

  const shortfallSub = (payroll.shortfallHours || 0) > 0
    ? `${payroll.shortfallHours}h × Rs ${Number(payroll.hourlyRate||0).toFixed(0)}/hr`
    : null;
  const deductionRows = [
    { label: "Shortfall Deduction", value: payroll.deductions || 0, isDeduction: true, sub: shortfallSub },
    { label: "Provident Fund",      value: 0 },
    { label: "Other Deductions",    value: 0 },
  ];

  const rowH    = 7;
  const startY  = y;
  const maxRows = Math.max(earningRows.length, deductionRows.length);

  for (let i = 0; i < maxRows; i++) {
    const ry = startY + i * rowH;
    const bg = i % 2 === 0 ? [255, 255, 255] : [252, 250, 255];

    // Earning row
    if (earningRows[i]) {
      const r = earningRows[i];
      const isZero  = r.value === 0;
      const isBonus = r.isBonus;
      const lc = isBonus ? [5, 150, 105] : isZero ? [190, 190, 190] : [51, 51, 51];
      drawTableRow(doc, lx, colW, ry, rowH, r.label, r.value, lc, bg, null);
    }

    // Deduction row
    if (deductionRows[i]) {
      const r   = deductionRows[i];
      const isRed  = r.isDeduction && r.value > 0;
      const isGrey = r.value === 0;
      const lc  = isRed ? [220, 38, 38] : isGrey ? [190, 190, 190] : [51, 51, 51];
      drawTableRow(doc, rx, colW, ry, rowH, r.label, r.value, lc, bg, r.sub || null);
    }
  }

  y = startY + maxRows * rowH + 1;

  // Total rows
  const grossEarnings = (payroll.baseSalary || 0) + (payroll.bonus || 0);
  drawTotalRow(doc, lx, colW, y, "Gross Earnings", grossEarnings, [170, 36, 147]);
  drawTotalRow(doc, rx, colW, y, "Total Deductions", payroll.deductions || 0,
    (payroll.deductions || 0) > 0 ? [220, 38, 38] : [2, 33, 121]);

  y += 11;

  // ── HOURS SUMMARY ───────────────────────────────────────────────────────────
  drawSectionLabel(doc, "HOURS SUMMARY", margin, y, pageW, margin);
  y += 5;

  const cards = [
    { label: "REQUIRED",    value: `${payroll.requiredHours  || 0}h`, color: [2, 33, 121]   },
    { label: "ACTUAL",      value: `${payroll.actualHours    || 0}h`, color: [5, 150, 105]   },
    { label: "SHORTFALL",   value: `${payroll.shortfallHours || 0}h`, color: [220, 38, 38]   },
    { label: "HOURLY RATE", value: `Rs ${Number(payroll.hourlyRate || 0).toFixed(0)}`, color: [170, 36, 147] },
  ];
  const cardW = (cW - 3 * 3) / 4;
  cards.forEach((card, i) => {
    const cx = margin + i * (cardW + 3);
    doc.setFillColor(249, 249, 249);
    doc.setDrawColor(238, 238, 238);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, y, cardW, 15, 2, 2, "FD");
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(card.label, cx + cardW / 2, y + 5.5, { align: "center" });
    doc.setFontSize(10.5); doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(card.value, cx + cardW / 2, y + 12, { align: "center" });
  });

  y += 19;

  // ── NET PAY BAR ─────────────────────────────────────────────────────────────
  drawHeader(doc, pageW, 0); // reset — we draw a rounded rect instead
  doc.setFillColor(2, 33, 121);
  doc.roundedRect(margin, y, cW * 0.5, 22, 2, 2, "F");
  doc.setFillColor(170, 36, 147);
  doc.roundedRect(margin + cW * 0.5 - 2, y, cW * 0.5 + 2, 22, 2, 2, "F");
  doc.setFillColor(80, 35, 135);
  doc.rect(margin + cW * 0.4, y, cW * 0.2, 22, "F");

  doc.setTextColor(210, 185, 230);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.text("Net Salary Payable", margin + 5, y + 7);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(`${mn} ${year}`, margin + 5, y + 14);

  doc.setFontSize(15); doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`PKR ${fmtN(payroll.netPay)}`, pageW - margin - 4, y + 11, { align: "right" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 185, 230);
  doc.text(
    `Gross Rs ${fmtN(grossEarnings)}  −  Deductions Rs ${fmtN(payroll.deductions)}`,
    pageW - margin - 4, y + 17.5, { align: "right" }
  );

  y += 26;

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  doc.setLineDash([1, 2]);
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineDash([]);
  y += 4;
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.setTextColor(185, 185, 185);
  doc.text("System-generated slip · No signature required", margin, y);
  doc.text("Software Flux Solutions", pageW - margin, y, { align: "right" });

  // Return base64 string only (no data URI prefix)
  return doc.output("datauristring").split(",")[1];
};