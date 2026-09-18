// src/app/hrPortal/payroll/viewPayslipDialog.jsx — Phase 4 fix (Leave Management Enhancement)
// FIX: added a conditional "Unpaid Leave Deduction" row (only shown when > 0),
// matching the existing "Overtime Pay" conditional pattern. Net Pay was
// always correct (netSalary already subtracts it on the backend) — this was
// purely a missing display line that made the itemized list not add up.

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Divider, Typography, CircularProgress } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton    from "../../../components/customButton";
import PayslipTemplate from "./payslipTemplate";
import jsPDF           from "jspdf";
import html2canvas     from "html2canvas";
import DownloadIcon    from "../../../assets/icons/download-icon-white.svg";
import { useCompanyProfile } from "../../../hooks/companySettings";
import { useFormatCurrency } from "../../../utils/formatCurrency";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Logo cache — keyed by URL, so it only refetches when the company logo
// actually changes (e.g. after a new upload in Settings → Company Profile).
// Pass no URL / empty string to get "" back (template falls back to
// showing the company's initials instead of an image). ─────────────────────
let _logoCache = { url: "", dataUrl: "" };

export const getLogo = (logoUrl = "") => new Promise((resolve) => {
  if (!logoUrl) { resolve(""); return; }
  if (_logoCache.url === logoUrl && _logoCache.dataUrl) { resolve(_logoCache.dataUrl); return; }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const dataUrl = c.toDataURL("image/png");
    _logoCache = { url: logoUrl, dataUrl };
    resolve(dataUrl);
  };
  img.onerror = () => resolve("");
  img.src = logoUrl;
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
export const HiddenPayslipCapture = forwardRef(({ payroll, month, year, logoDataUrl, companyName }, ref) => {
  const nodeRef = useRef();

  useImperativeHandle(ref, () => ({
    captureToBase64: () => captureToPdfBase64(nodeRef.current),
  }));

  return (
    <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
      <Box ref={nodeRef}>
        <PayslipTemplate payroll={payroll} month={month} year={year} logoDataUrl={logoDataUrl} companyName={companyName} />
      </Box>
    </Box>
  );
});

// ── Main dialog ───────────────────────────────────────────────────────────────
const ViewPayslipDialog = ({ open, onClose, payroll = {}, month, year }) => {
  const templateRef  = useRef();
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const monthLabel = `${MONTH_NAMES[month] || ""} ${year || ""}`;
  const { format } = useFormatCurrency();

  const { profile: companyProfile } = useCompanyProfile();
  const companyName = companyProfile?.companyName?.trim() || "Sprintexa";

  useEffect(() => {
    if (companyProfile?.logoUrl) {
      getLogo(companyProfile.logoUrl).then(setLogoDataUrl);
    }
  }, [companyProfile?.logoUrl]);

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
              { label: "Extra Hours (Paid)", value: `${payroll.extraHours || 0} hrs`, color: (payroll.extraHours || 0) > 0 ? "#04C373" : "text.secondary" },
              { label: "Shortfall Hours",    value: `${payroll.shortfallHours || 0} hrs`, color: (payroll.shortfallHours || 0) > 0 ? "#FF3B30" : "text.secondary" },
              { label: "Hourly Rate", value: `${format(payroll.hourlyRate || 0)}/hr` },
            ].map((r) => (
              <Box key={r.label} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
                <Typography fontSize="13px" color="text.secondary">{r.label}</Typography>
                <Typography fontSize="13px" fontWeight={500} color={r.color || "text.primary"}>{r.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
           {[
 { label: "Base Salary", value: format(payroll.baseSalary || 0, { decimals: 0 }) },
 { label: "Bonus",       value: `+ ${format(payroll.bonus || 0, { decimals: 0 })}`, color: "#04C373" },
{ label: "Extra Hours Pay", value: `+ ${format(payroll.extraAmount || 0, { decimals: 0 })}`, color: (payroll.extraAmount || 0) > 0 ? "#04C373" : "text.secondary" },
].map((r) => (
  <Box key={r.label} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
    <Typography fontSize="13px" color="text.secondary">{r.label}</Typography>
    <Typography fontSize="13px" fontWeight={500} color={r.color || "text.primary"}>{r.value}</Typography>
  </Box>
))}

{/* ── Deductions — always shown as three clearly separate rows ─────────── */}
<Box display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
  <Typography fontSize="13px" color="text.secondary">Shortfall Deduction</Typography>
  <Typography fontSize="13px" fontWeight={500} color="#FF3B30">
    - {format(payroll.deductions || 0, { decimals: 0 })}
  </Typography>
</Box>

<Box display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
  <Box>
    <Typography fontSize="13px" color="text.secondary">Unpaid Leave Deduction</Typography>
    {(payroll.unpaidLeaveDays || 0) > 0 && (
      <Typography fontSize="10px" color="text.secondary">{payroll.unpaidLeaveDays} day(s)</Typography>
    )}
  </Box>
  <Typography fontSize="13px" fontWeight={500} color="#FF3B30">
    - {format(payroll.unpaidLeaveDeduction || 0, { decimals: 0 })}
  </Typography>
</Box>

<Box display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: "1px solid #F3F4F6" }}>
  <Typography fontSize="13px" fontWeight={700} color="text.primary">Total Deduction</Typography>
  <Typography fontSize="13px" fontWeight={700} color="#FF3B30">
    - {format((payroll.deductions || 0) + (payroll.unpaidLeaveDeduction || 0), { decimals: 0 })}
  </Typography>
</Box>
            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
              <Typography fontSize="15px" fontWeight={700} color="text.primary">Net Pay</Typography>
              <Typography fontSize="17px" fontWeight={700} color="#AA2493">
                {format(payroll.netPay || 0, { decimals: 0 })}
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
          <PayslipTemplate payroll={payroll} month={month} year={year} logoDataUrl={logoDataUrl} companyName={companyName} />
        </Box>
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;