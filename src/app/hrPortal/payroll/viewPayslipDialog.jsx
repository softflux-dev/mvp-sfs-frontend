// src/app/hrPortal/payroll/viewPayslipDialog.jsx — FULL REPLACEMENT
import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Divider, Typography, CircularProgress } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton    from "../../../components/customButton";
import PayslipTemplate from "./payslipTemplate";
import jsPDF           from "jspdf";
import html2canvas     from "html2canvas";

import DownloadIcon from "../../../assets/icons/download-icon-white.svg";
import LogoSrc      from "../../../assets/images/softflux-logo.png";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Convert logo to base64 once at module level (not per-render) ──────────────
let cachedLogoBase64 = "";
const getLogoBase64 = () =>
  new Promise((resolve) => {
    if (cachedLogoBase64) { resolve(cachedLogoBase64); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      cachedLogoBase64 = c.toDataURL("image/png");
      resolve(cachedLogoBase64);
    };
    img.onerror = () => resolve("");
    img.src = LogoSrc;
  });

// ── Capture a DOM node → PDF base64 ──────────────────────────────────────────
const domToPdfBase64 = async (domNode) => {
  const canvas = await html2canvas(domNode, {
    scale:           2,
    useCORS:         true,
    allowTaint:      false,
    backgroundColor: "#ffffff",
    logging:         false,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit:        "px",
    format:      [canvas.width / 2, canvas.height / 2],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  return pdf.output("datauristring").split(",")[1]; // base64 only
};

// ── EXPORTED: generates PDF base64 for a payroll row using a hidden DOM node ──
// This is called by payroll/index.jsx for email sending.
// It renders PayslipTemplate into a temporary off-screen div and captures it.
// Logo is cached so first call takes ~200ms, subsequent calls are instant.
export const generatePayslipPdfBase64 = async (payroll, month, year) => {
  const logoDataUrl = await getLogoBase64();

  // Create temp container
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-999;background:#fff;width:720px;";
  document.body.appendChild(container);

  // Dynamically import React/ReactDOM to avoid bundle issues
  const [{ default: React }, { createRoot }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
  ]);

  return new Promise((resolve, reject) => {
    const root = createRoot(container);
    root.render(
      React.createElement(PayslipTemplate, { payroll, month, year, logoDataUrl })
    );
    // Wait for render (fonts + layout settle in ~300ms)
    setTimeout(async () => {
      try {
        const base64 = await domToPdfBase64(container.firstChild || container);
        root.unmount();
        document.body.removeChild(container);
        resolve(base64);
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 350);
  });
};

// ── Dialog component ──────────────────────────────────────────────────────────
const ViewPayslipDialog = ({ open, onClose, payroll = {}, month, year }) => {
  const templateRef   = useRef();
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState(cachedLogoBase64);

  const monthLabel = `${MONTH_NAMES[month] || ""} ${year || ""}`;

  // Load logo once
  useEffect(() => {
    getLogoBase64().then(setLogoDataUrl);
  }, []);

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setDownloading(true);
    try {
      const base64 = await domToPdfBase64(templateRef.current);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit:        "px",
        format:      [templateRef.current.offsetWidth, templateRef.current.offsetHeight],
      });
      // Re-render properly sized
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, useCORS: true, allowTaint: false,
        backgroundColor: "#ffffff", logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdfFinal = new jsPDF({
        orientation: "portrait",
        unit:        "px",
        format:      [canvas.width / 2, canvas.height / 2],
      });
      pdfFinal.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdfFinal.save(`payslip-${payroll.name?.replace(/\s+/g, "-") || "employee"}-${monthLabel}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="560px" fullWidth>
      <DialogHeader title={`Payslip — ${monthLabel}`} onClose={onClose} />

      <DialogBody>
        <Box mb={2.5}>
          <Typography fontSize="20px" fontWeight={700} color="text.primary">{payroll.name || "—"}</Typography>
          <Typography fontSize="13px" color="text.secondary">
            {payroll.designation || ""}{payroll.department ? ` · ${payroll.department}` : ""}
          </Typography>
          <Typography fontSize="12px" color="text.secondary" mt={0.25}>{payroll.empId || ""}</Typography>
        </Box>

        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5 }}>
          <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", px: 3, py: 2 }}>
            {[
              { label: "Required Hours",  value: `${payroll.requiredHours  || 0} hrs` },
              { label: "Actual Hours",    value: `${payroll.actualHours    || 0} hrs` },
              { label: "Shortfall Hours", value: `${payroll.shortfallHours || 0} hrs`, color: (payroll.shortfallHours||0) > 0 ? "#FF3B30" : "text.primary" },
              { label: "Hourly Rate",     value: `Rs ${Number(payroll.hourlyRate||0).toFixed(2)}/hr` },
            ].map((r) => (
              <Box key={r.label} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
                <Typography fontSize="13px" color="text.secondary">{r.label}</Typography>
                <Typography fontSize="13px" fontWeight={500} color={r.color || "text.primary"}>{r.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
            {[
              { label: "Base Salary",  value: `Rs ${Number(payroll.baseSalary  ||0).toLocaleString()}` },
              { label: "Bonus",        value: `+ Rs ${Number(payroll.bonus     ||0).toLocaleString()}`, color: "#04C373" },
              { label: "Deductions",   value: `- Rs ${Number(payroll.deductions||0).toLocaleString()}`, color: "#FF3B30" },
            ].map((r) => (
              <Box key={r.label} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
                <Typography fontSize="13px" color="text.secondary">{r.label}</Typography>
                <Typography fontSize="13px" fontWeight={500} color={r.color || "text.primary"}>{r.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
              <Typography fontSize="15px" fontWeight={700} color="text.primary">Net Pay</Typography>
              <Typography fontSize="17px" fontWeight={700} color="#AA2493">
                Rs {Number(payroll.netPay||0).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogBody>

      <Box px={3} pb={3} display="flex" justifyContent="flex-end">
        <CustomButton
          btnLabel={
            downloading
              ? <Box display="flex" alignItems="center" gap={1}><CircularProgress size={14} sx={{ color: "#fff" }} />Generating...</Box>
              : "Download PDF"
          }
          variant="gradient"
          startIcon={!downloading ? <img src={DownloadIcon} alt="dl" style={{ width: 15, height: 15 }} /> : null}
          handlePressBtn={handleDownload}
          isDisabled={downloading}
        />
      </Box>

      {/* Hidden template — used for download */}
      <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
        <Box ref={templateRef}>
          <PayslipTemplate payroll={payroll} month={month} year={year} logoDataUrl={logoDataUrl} />
        </Box>
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;