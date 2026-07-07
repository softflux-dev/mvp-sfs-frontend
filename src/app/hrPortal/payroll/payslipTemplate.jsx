// src/app/hrPortal/payroll/payslipTemplate.jsx — NEW FILE (lives in payroll/ folder)
import { Box, Typography } from "@mui/material";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => Number(n || 0).toLocaleString("en-PK");

const SectionLabel = ({ children, mt = 2 }) => (
  <Box mt={mt} mb={1} pb={0.75} sx={{ borderBottom: "1px solid #ede0f5" }}>
    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#AA2493", textTransform: "uppercase", letterSpacing: "1px" }}>
      {children}
    </Typography>
  </Box>
);

const DetailCell = ({ label, value, borderRight, borderBottom }) => (
  <Box sx={{ p: "9px 14px", borderRight: borderRight ? "1px solid #f2f2f2" : "none", borderBottom: borderBottom ? "1px solid #f2f2f2" : "none" }}>
    <Typography sx={{ fontSize: "10px", color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", mb: "2px" }}>{label}</Typography>
    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e" }}>{value}</Typography>
  </Box>
);

const TblHead = () => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 110px", background: "#022179", borderRadius: "8px 8px 0 0" }}>
    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#fff", p: "8px 12px" }}>Component</Typography>
    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#fff", p: "8px 12px", textAlign: "right" }}>PKR</Typography>
  </Box>
);

const TblRow = ({ label, value, color, bg, sub }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 110px", background: bg || "transparent", borderBottom: "1px solid #f5f5f5" }}>
    <Box sx={{ p: "7px 12px" }}>
      <Typography sx={{ fontSize: "12px", color: color || "#333" }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: "10px", color: "#bbb", mt: "2px" }}>{sub}</Typography>}
    </Box>
    <Box sx={{ p: "7px 12px", textAlign: "right" }}>
      <Typography sx={{ fontSize: "12px", fontWeight: 500, color: color || "#333" }}>{value}</Typography>
    </Box>
  </Box>
);

const TblFoot = ({ label, value, color }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 110px", background: "#f7f0fd", borderRadius: "0 0 8px 8px" }}>
    <Typography sx={{ fontSize: "12px", fontWeight: 700, p: "8px 12px", color: "#022179" }}>{label}</Typography>
    <Typography sx={{ fontSize: "12px", fontWeight: 700, p: "8px 12px", textAlign: "right", color: color || "#AA2493" }}>{value}</Typography>
  </Box>
);

const HourCard = ({ label, value, color }) => (
  <Box sx={{ background: "#f9f9f9", border: "1px solid #efefef", borderRadius: "8px", p: "10px 12px", textAlign: "center" }}>
    <Typography sx={{ fontSize: "10px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", mb: "4px" }}>{label}</Typography>
    <Typography sx={{ fontSize: "14px", fontWeight: 700, color }}>{value}</Typography>
  </Box>
);

const PayslipTemplate = ({ payroll = {}, month, year, logoDataUrl = "" }) => {
  const monthName = MONTH_NAMES[month] || "";

  // ── Debug: log what we receive ────────────────────────────────────────────
  console.log("[PayslipTemplate] payroll.salaryBreakdown:", payroll.salaryBreakdown);
  console.log("[PayslipTemplate] payroll.baseSalary:", payroll.baseSalary);

  const bd = payroll.salaryBreakdown || {};

  // Always show all 6 rows — even if 0
  const breakdown = [
    { label: "Basic Salary",        value: bd.basicSalary        ?? 0 },
    { label: "Security Allowance",  value: bd.securityAllowance  ?? 0 },
    { label: "Medical Allowance",   value: bd.medicalAllowance   ?? 0 },
    { label: "Transport Allowance", value: bd.transportAllowance ?? 0 },
    { label: "Lunch Allowance",     value: bd.lunchAllowance     ?? 0 },
    { label: "Housing Allowance",   value: bd.housingAllowance   ?? 0 },
  ];

const grossEarnings = (payroll.baseSalary || 0) + (payroll.bonus || 0) + (payroll.extraAmount || 0);

  const empType =
    payroll.employmentType === "full_time" ? "Full-time"  :
    payroll.employmentType === "part_time" ? "Part-time"  :
    payroll.employmentType === "contract"  ? "Contract"   : "—";

  return (
    <Box sx={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", width: "720px", position: "relative", overflow: "hidden" }}>

      {/* Watermark */}
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.03, fontSize: "64px", fontWeight: 900, color: "#022179", whiteSpace: "nowrap", pointerEvents: "none", letterSpacing: "6px", zIndex: 0 }}>
        SOFTWARE FLUX
      </Box>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box sx={{ background: "linear-gradient(135deg, #022179 0%, #AA2493 100%)", p: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1.75}>
          <Box sx={{ width: 52, height: 52, borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {logoDataUrl
              ? <img src={logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>SF</Typography>
            }
          </Box>
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Software Flux Solutions</Typography>
            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.72)", mt: "2px" }}>HR Management System</Typography>
          </Box>
        </Box>
        <Box textAlign="right">
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Salary Slip</Typography>
          <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", mt: "3px" }}>For the Month of {monthName}, {year}</Typography>
        </Box>
      </Box>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <Box sx={{ p: "24px 32px 28px", position: "relative", zIndex: 1 }}>

        <SectionLabel mt={0}>Employee Details</SectionLabel>
        <Box sx={{ border: "1px solid #ebebeb", borderRadius: "8px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <DetailCell label="Employee Name"   value={payroll.name        || "—"} borderRight borderBottom />
          <DetailCell label="Employee ID"     value={payroll.empId       || "—"} borderBottom />
          <DetailCell label="Designation"     value={payroll.designation || "—"} borderRight borderBottom />
          <DetailCell label="Department"      value={payroll.department  || "—"} borderBottom />
          <DetailCell label="Employment Type" value={empType}                    borderRight />
          <DetailCell label="Pay Period"      value={`${monthName} ${year}`} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>

          {/* Earnings */}
          <Box>
            <SectionLabel mt={0}>Earnings</SectionLabel>
            <Box sx={{ border: "1px solid #ebebeb", borderRadius: "8px", overflow: "hidden" }}>
              <TblHead />
              {breakdown.map((r) => (
                <TblRow
                  key={r.label}
                  label={r.label}
                  value={fmt(r.value)}
                  color={r.value === 0 ? "#bbb" : "#333"}
                />
              ))}
              {(payroll.bonus || 0) > 0 && (
                <TblRow label="Bonus / Incentive" value={fmt(payroll.bonus)} color="#059669" bg="#f0fdf4" />
              )}
               {(payroll.extraAmount || 0) > 0 && (
                <TblRow
                  label="Overtime Pay"
                  value={fmt(payroll.extraAmount)}
                  color="#059669" bg="#f0fdf4"
                  sub={`${payroll.extraHours}h × Rs ${Number(payroll.hourlyRate || 0).toFixed(0)}/hr`}
                />
              )}
              <TblFoot label="Gross Earnings" value={fmt(grossEarnings)} color="#AA2493" />
            </Box>
          </Box>

          {/* Deductions + Hours */}
          <Box>
            <SectionLabel mt={0}>Deductions</SectionLabel>
            <Box sx={{ border: "1px solid #ebebeb", borderRadius: "8px", overflow: "hidden" }}>
              <TblHead />
              <TblRow
                label="Shortfall Deduction"
                value={fmt(payroll.deductions)}
                color={(payroll.deductions || 0) > 0 ? "#DC2626" : "#bbb"}
                sub={
                  (payroll.shortfallHours || 0) > 0
                    ? `${payroll.shortfallHours}h × Rs ${Number(payroll.hourlyRate || 0).toFixed(0)}/hr`
                    : "No shortfall this month"
                }
              />
              <TblRow label="Provident Fund"   value={fmt(0)} color="#bbb" />
              <TblRow label="Other Deductions" value={fmt(0)} color="#bbb" />
              <TblFoot
                label="Total Deductions"
                value={fmt(payroll.deductions)}
                color={(payroll.deductions || 0) > 0 ? "#DC2626" : "#022179"}
              />
            </Box>

           <SectionLabel>Hours Summary</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <HourCard label="Required"    value={`${payroll.requiredHours  || 0}h`} color="#022179" />
              <HourCard label="Actual"      value={`${payroll.actualHours    || 0}h`} color="#059669" />
              {(payroll.extraHours || 0) > 0 ? (
                <HourCard label="Extra Hours" value={`${payroll.extraHours}h`} color="#059669" />
              ) : (
                <HourCard label="Shortfall" value={`${payroll.shortfallHours || 0}h`} color="#DC2626" />
              )}
              <HourCard label="Hourly Rate" value={`Rs ${Number(payroll.hourlyRate || 0).toFixed(0)}`} color="#AA2493" />
            </Box>
          </Box>
        </Box>

        {/* Net Pay */}
        <Box sx={{ background: "linear-gradient(135deg, #022179 0%, #AA2493 100%)", borderRadius: "10px", p: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Net Salary Payable</Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{monthName} {year}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}>PKR {fmt(payroll.netPay)}</Typography>
            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", mt: "2px" }}>
              Gross Rs {fmt(grossEarnings)} − Deductions Rs {fmt(payroll.deductions)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 1.5, borderTop: "1px dashed #e5e5e5" }}>
          <Typography sx={{ fontSize: "10px", color: "#bbb" }}>System-generated slip · No signature required</Typography>
          <Typography sx={{ fontSize: "10px", color: "#bbb" }}>Software Flux Solutions</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PayslipTemplate;