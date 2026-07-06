// src/utils/reportPdfExport.js — 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_PINK = [170, 36, 147];
const BRAND_NAVY = [2, 33, 121];

// ── Branded header band + generated timestamp ─────────────────────────────
export const createReportDoc = (reportTitle, periodLabel = "") => {
  const doc = new jsPDF();

  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, 210, 30, "F");

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.text("Software Flux Solutions", 14, 14);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(230, 230, 230);
  doc.text("Reports & Analytics", 14, 21);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.text(reportTitle, 196, 14, { align: "right" });

  if (periodLabel) {
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(230, 230, 230);
    doc.text(periodLabel, 196, 21, { align: "right" });
  }

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
    14, 38
  );

  return doc;
};

// ── Row of quick-glance stat cards (e.g. Total / Approved / Pending) ──────
export const addSummaryCards = (doc, cards, startY = 44) => {
  const marginX = 14, marginRight = 196;
  const gap = 4;
  const cardWidth = (marginRight - marginX - (cards.length - 1) * gap) / cards.length;
  let x = marginX;

  cards.forEach((c) => {
    doc.setFillColor(248, 248, 250);
    doc.roundedRect(x, startY, cardWidth, 18, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont(undefined, "normal");
    doc.text(String(c.label), x + 4, startY + 7);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...(c.color || [30, 30, 30]));
    doc.text(String(c.value), x + 4, startY + 14);
    x += cardWidth + gap;
  });

  return startY + 18 + 8;
};

// ── Styled data table, returns finalY so callers can stack more content ──
export const addReportTable = (doc, { head, body, startY, columnStyles = {} }) => {
  autoTable(doc, {
    startY,
    head: [head],
    body,
    headStyles: { fillColor: BRAND_PINK, textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    styles: { cellPadding: 3, overflow: "linebreak" },
    columnStyles,
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, 196, 290, { align: "right" });
      doc.text("Software Flux Solutions — Confidential", 14, 290);
    },
  });
  return doc.lastAutoTable.finalY;
};

export const savePdf = (doc, filename) => doc.save(filename);