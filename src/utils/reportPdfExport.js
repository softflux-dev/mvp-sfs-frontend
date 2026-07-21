// src/utils/reportPdfExport.js — 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_PINK = [170, 36, 147];
const BRAND_NAVY = [2, 33, 121];
const DEFAULT_COMPANY_NAME = "Sprintexa";

// ── Fetch a remote image (e.g. Cloudinary logo URL) and convert to a
// base64 data URL — jsPDF's addImage() needs raw image data, not a URL. ────
async function loadImageAsDataUrl(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("Logo fetch failed");
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load company logo for PDF:", err.message);
    return null;
  }
}

// ── Load the data URL into an actual Image element so we can read its
// natural width/height — needed to keep the logo's aspect ratio correct
// instead of stretching/squashing it inside the PDF header. ────────────────
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Light/neutral header band + generated timestamp ────────────────────────
// Layout: [logo] Company Name (bold, large)
//               Report Title  (medium, brand pink) — stacked BELOW the name,
//               instead of floating large on the far right.
//               Reports & Analytics · periodLabel (small, gray)
export const createReportDoc = async (reportTitle, periodLabel = "", branding = {}) => {
  const doc = new jsPDF();
  const companyName = branding.companyName?.trim() || DEFAULT_COMPANY_NAME;

  const HEADER_HEIGHT = 34; // slightly taller than before to fit 3 stacked lines

  // Light background band instead of solid dark navy — keeps ANY logo
  // color (including black/dark logos) visible, generic for white-label use.
  doc.setFillColor(248, 248, 250);
  doc.rect(0, 0, 210, HEADER_HEIGHT, "F");

  // Thin brand-colored underline to keep the header visually distinct
  // from the page body, without needing a dark fill to do it.
  doc.setDrawColor(...BRAND_PINK);
  doc.setLineWidth(0.6);
  doc.line(0, HEADER_HEIGHT, 210, HEADER_HEIGHT);

  let textStartX = 14; // where text starts — shifts right if a logo icon was drawn

  if (branding.logoUrl) {
    const dataUrl = await loadImageAsDataUrl(branding.logoUrl);
    const mime = dataUrl?.match(/data:image\/([a-zA-Z0-9+.-]+);/)?.[1]?.toLowerCase();

    if (dataUrl && mime && !mime.includes("svg")) {
      try {
        const imgEl = await loadImageElement(dataUrl);
        const maxHeight = 18; // mm — fits comfortably in the taller header band
        const ratio  = imgEl.naturalWidth / imgEl.naturalHeight || 1;
        const height = maxHeight;
        const width  = height * ratio;

        const format = mime.includes("png") ? "PNG" : mime.includes("webp") ? "WEBP" : "JPEG";

        doc.addImage(dataUrl, format, 14, 7, width, height);
        textStartX = 14 + width + 6;
      } catch (err) {
        console.error("Failed to render logo in PDF:", err.message);
      }
    }
  }

  // ── Line 1: Company name — always shown, logo is just an icon/mark ──────
  doc.setFontSize(17);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(companyName, textStartX, 15);

  // ── Line 2: Report title — stacked below the name, small/medium size,
  // brand-colored — replaces the old large right-aligned floating heading. ──
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...BRAND_PINK);
  doc.text(reportTitle, textStartX, 22);

  // ── Line 3: subtitle + optional period label, small gray ────────────────
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(120, 120, 120);
  const subtitleLine = periodLabel ? `Reports & Analytics · ${periodLabel}` : "Reports & Analytics";
  doc.text(subtitleLine, textStartX, 28);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
    14, HEADER_HEIGHT + 8
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
export const addReportTable = (doc, { head, body, startY, columnStyles = {}, companyName = DEFAULT_COMPANY_NAME }) => {
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
      doc.text(`${companyName} — Confidential`, 14, 290);

      doc.setFontSize(7);
      doc.setTextColor(190, 190, 190);
      doc.text("Powered by Sprintexa", 105, 290, { align: "center" });
    },
  });
  return doc.lastAutoTable.finalY;
};

export const savePdf = (doc, filename) => doc.save(filename);