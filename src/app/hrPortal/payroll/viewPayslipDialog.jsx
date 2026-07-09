// src/app/hrPortal/payroll/viewPayslipDialog.jsx — 
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Divider, Typography, CircularProgress } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton    from "../../../components/customButton";
import PayslipTemplate from "./payslipTemplate";
import jsPDF           from "jspdf";
import html2canvas     from "html2canvas";
import DownloadIcon    from "../../../assets/icons/download-icon-white.svg";
import LogoSrc         from "../../../assets/images/softflux-logo.png";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Logo cached once at module level ─────────────────────────────────────────
let _logo = "";
export const getLogo = () => new Promise((resolve) => {
  if (_logo) { resolve(_logo); return; }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    _logo = c.toDataURL("image/png");
    resolve(_logo);
  };
  img.onerror = () => resolve("");
  img.src = LogoSrc;
});

// ── Capture a DOM node → base64 PDF string ───────────────────────────────────
export const captureToPdfBase64 = async (node) => {
  const canvas = await html2canvas(node, {
    scale: 2, useCORS: true, allowTaint: false,
    backgroundColor: "#ffffff", logging: false,
  });
  const pdf = new jsPDF({
    orientation: "portrait", unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  return pdf.output("datauristring").split(",")[1];
};

// ── Hidden payslip renderer — used by index.jsx to generate email PDF ─────────
// Renders PayslipTemplate for a given payroll and exposes captureToBase64()
export const HiddenPayslipCapture = forwardRef(({ payroll, month, year, logoDataUrl }, ref) => {
  const nodeRef = useRef();

  useImperativeHandle(ref, () => ({
    captureToBase64: () => captureToPdfBase64(nodeRef.current),
  }));

  return (
    <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
      <Box ref={nodeRef}>
        <PayslipTemplate payroll={payroll} month={month} year={year} logoDataUrl={logoDataUrl} />
      </Box>
    </Box>
  );
});

// ── Main dialog ───────────────────────────────────────────────────────────────
const ViewPayslipDialog = ({ open, onClose, payroll = {}, month, year }) => {
  const templateRef  = useRef();
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState(_logo);
  const monthLabel = `${MONTH_NAMES[month] || ""} ${year || ""}`;

  useEffect(() => { getLogo().then(setLogoDataUrl); }, []);

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setDownloading(true);
    try {
      const base64 = await captureToPdfBase64(templateRef.current);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `payslip-${payroll.name?.replace(/\s+/g, "-") || "employee"}-${monthLabel}.pdf`;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
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
              (payroll.extraHours || 0) > 0
                ? { label: "Extra Hours (Paid)", value: `${payroll.extraHours} hrs`, color: "#04C373" }
                : { label: "Shortfall Hours", value: `${payroll.shortfallHours || 0} hrs`, color: (payroll.shortfallHours||0) > 0 ? "#FF3B30" : "text.primary" },
              { label: "Hourly Rate",     value: `Rs ${Number(payroll.hourlyRate||0).toFixed(2)}/hr` },
            ].map((r) => (
              <Box key={r.label} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
                <Typography fontSize="13px" color="text.secondary">{r.label}</Typography>
                <Typography fontSize="13px" fontWeight={500} color={r.color || "text.primary"}>{r.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
            {[
              { label: "Base Salary", value: `Rs ${Number(payroll.baseSalary  ||0).toLocaleString()}` },
             { label: "Bonus",       value: `+ Rs ${Number(payroll.bonus     ||0).toLocaleString()}`, color: "#04C373" },
              ...(payroll.extraAmount > 0 ? [{ label: "Overtime Pay", value: `+ Rs ${Number(payroll.extraAmount||0).toLocaleString()}`, color: "#04C373" }] : []),
              { label: "Deductions",  value: `- Rs ${Number(payroll.deductions||0).toLocaleString()}`, color: "#FF3B30" },
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
          btnLabel={downloading
            ? <Box display="flex" alignItems="center" gap={1}><CircularProgress size={14} sx={{ color: "#fff" }} />Generating...</Box>
            : "Download PDF"}
          variant="gradient"
          startIcon={!downloading ? <img src={DownloadIcon} alt="dl" style={{ width: 15, height: 15 }} /> : null}
          handlePressBtn={handleDownload}
          isDisabled={downloading}
        />
      </Box>

      {/* Hidden PayslipTemplate — captured on Download click */}
      <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
        <Box ref={templateRef}>
          <PayslipTemplate payroll={payroll} month={month} year={year} logoDataUrl={logoDataUrl} />
        </Box>
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;