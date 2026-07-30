// src/app/employeePortal/salary/viewPayslipDialog.jsx — Phase 4 fix (Leave Management Enhancement)
// FIX: added a conditional "Unpaid Leave Deduction" row (only shown when > 0)
// so the itemized breakdown actually adds up to Net Pay — netSalary already
// subtracts it on the backend, this dialog just never displayed it.

import { useRef, useState, useEffect } from "react";
import { Box, Divider, Typography, CircularProgress } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomButton from "../../../components/customButton";
import { useFormatCurrency } from "../../../utils/formatCurrency";
import DownloadIcon from "../../../assets/icons/download-icon-white.svg";
import PayslipTemplate from "../../hrPortal/payroll/payslipTemplate";
import { getLogo, captureToPdfBase64 } from "../../hrPortal/payroll/viewPayslipDialog";

const MONTH_INDEX = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const Row = ({ label, value, bold, color, sub }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={1.25}
    sx={{ borderBottom: "1px solid #F3F4F6" }}>
    <Box>
      <Typography fontSize="13px" color="text.secondary" fontWeight={bold ? 600 : 400}>{label}</Typography>
      {sub && <Typography fontSize="10px" color="text.secondary">{sub}</Typography>}
    </Box>
    <Typography fontSize={bold ? "14px" : "13px"} fontWeight={bold ? 700 : 500}
      color={color || (bold ? "#AA2493" : "text.primary")}>{value}</Typography>
  </Box>
);

const SectionLabel = ({ children }) => (
  <Typography fontSize="11px" fontWeight={700} color="text.secondary"
    textTransform="uppercase" letterSpacing="0.6px" mt={2} mb={0.5}>
    {children}
  </Typography>
);

const ViewPayslipDialog = ({ open, onClose, payslip, company = { companyName: "", logoUrl: "" } }) => {
  const { format } = useFormatCurrency();
  const templateRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");

  const companyName = company?.companyName?.trim() || "Sprintexa";

  useEffect(() => {
    if (company?.logoUrl) getLogo(company.logoUrl).then(setLogoDataUrl);
    else setLogoDataUrl("");
  }, [company?.logoUrl]);

  if (!payslip) return null;

  const fmt   = (n) => format(n, { decimals: 0 });
  const title = `${payslip.month} ${payslip.year}`;
  const monthIdx = MONTH_INDEX[payslip.month] ?? 0;
  const hasOvertime = (payslip.extraHours || 0) > 0 || (payslip.extraAmount || 0) > 0;
  const hasUnpaidLeave = (payslip.unpaidLeaveDeduction || 0) > 0;

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setDownloading(true);
    try {
      const base64 = await captureToPdfBase64(templateRef.current);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `payslip-${payslip.month}-${payslip.year}.pdf`;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="500px" fullWidth>
      <DialogHeader title={`Payslip — ${title}`} onClose={onClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5,
          maxHeight: "65vh", overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
        }}>
          <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", px: 2.5, py: 1.5 }}>

            <SectionLabel>Attendance</SectionLabel>
            <Row label="Base Working Days"     value={`${payslip.baseWorkingDays ?? "—"}`} />
            <Row label="Paid Holidays / Leave" value={`${payslip.paidAbsenceDays ?? 0}`} />
            <Row label="Required Working Days" value={payslip.requiredDays ?? "—"} />
            <Row label="Present Days"          value={payslip.presentDays ?? "—"} />
            <Row label="Absent Days"           value={payslip.absentDays ?? "—"} />
            <Row label="Leave Days"            value={payslip.leaveDays ?? "—"} />
            {(payslip.unpaidLeaveDays || 0) > 0 && (
              <Row label="Unpaid Leave Days" value={payslip.unpaidLeaveDays} color="#B45309" />
            )}

            <SectionLabel>Hours</SectionLabel>
            <Row label="Required Hours"      value={`${payslip.requiredHours ?? 0} hrs`} />
            <Row label="Actual Hours Worked" value={`${payslip.actualHours ?? 0} hrs`} />
            {hasOvertime ? (
              <Row label="Extra Hours (Paid)" value={`${payslip.extraHours ?? 0} hrs`}
                sub={`Paid at ${payslip.otMultiplier ?? 1}x`} color="#04C373" />
            ) : (
              <Row label="Shortfall Hours" value={`${payslip.shortfallHours ?? 0} hrs`}
                color={(payslip.shortfallHours || 0) > 0 ? "#FF3B30" : "text.primary"} />
            )}
            <Row label="Hourly Rate" value={`${format(payslip.hourlyRate || 0)}/hr`}
              sub={payslip.rateBasisHours ? `Salary ÷ ${payslip.rateBasisHours} base hrs` : null} />

            <SectionLabel>Salary</SectionLabel>
            <Row label="Base Monthly Salary" value={fmt(payslip.baseSalary)} />
            <Row label="Bonus" value={`+ ${fmt(payslip.bonus)}`} color="#04C373" />
            {hasOvertime && (
              <Row label="Overtime Pay" value={`+ ${fmt(payslip.extraAmount)}`}
                sub={`${payslip.extraHours}h × ${format(payslip.hourlyRate || 0)} × ${payslip.otMultiplier ?? 1}x`}
                color="#04C373" />
            )}
            <Row label="Shortfall Deduction" value={`- ${fmt(payslip.deductions)}`} color="#FF3B30" />
            {/* NEW — was missing entirely; Net Pay already reflected it, the
                breakdown just didn't show where the money went. */}
            {hasUnpaidLeave && (
              <Row label="Unpaid Leave Deduction" value={`- ${fmt(payslip.unpaidLeaveDeduction)}`}
                sub={`${payslip.unpaidLeaveDays || 0} day(s) unpaid leave`} color="#FF3B30" />
            )}

            <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
              <Typography fontSize="15px" fontWeight={700} color="text.primary">Net Pay</Typography>
              <Typography fontSize="17px" fontWeight={700} color="#AA2493">{fmt(payslip.netPay)}</Typography>
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
          startIcon={!downloading ? <img src={DownloadIcon} alt="download" style={{ width: 15, height: 15 }} /> : null}
          handlePressBtn={handleDownload}
          isDisabled={downloading}
        />
      </Box>

      {/* Hidden branded template — captured on download */}
      <Box sx={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
        <Box ref={templateRef}>
          <PayslipTemplate
            payroll={payslip}
            month={monthIdx}
            year={payslip.year}
            logoDataUrl={logoDataUrl}
            companyName={companyName}
          />
        </Box>
      </Box>
    </DialogContainer>
  );
};

export default ViewPayslipDialog;