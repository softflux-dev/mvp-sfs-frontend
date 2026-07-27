// src/app/hrPortal/payroll/index.jsx — 
// Email PDF: renders PayslipTemplate in hidden div, html2canvas captures it.
// Same template, same UI. One render per employee, then instant capture.
import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import ViewPayslipDialog, { HiddenPayslipCapture, getLogo } from "./viewPayslipDialog";
import EditPayrollDialog  from "./editPayrollDialog";
import { usePayroll }     from "../../../hooks/payroll";
import { useCompanyProfile } from "../../../hooks/companySettings";
import GlobalStyle        from "../../../style/style";
import { sendPayslipWithPdfApi } from "../../../api/modules/payroll";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const tableHeader = [
  { id: "checkbox",   label: ""            },
  { id: "empId",      label: "ID"          },
  { id: "name",       label: "Employee"    },
  { id: "department", label: "Department"  },
  { id: "working",    label: "Req. Days"   },
  { id: "present",    label: "Present"     },
  { id: "leave",      label: "Leave"       },
  { id: "extraHours", label: "Extra Hrs"   },
  { id: "baseSalary", label: "Base Salary" },
  { id: "bonus",      label: "Bonus"       },
  { id: "overtime",   label: "Overtime"    },
  { id: "deductions", label: "Deductions"  },
  { id: "netPay",     label: "Net Pay"     },
  { id: "actions",    label: ""            },
];

// MUST stay index-for-index aligned with tableHeader above — a mismatch
// silently renders every later cell under the wrong column heading.
const displayRows = [
  "payroll_checkbox",
  "payroll_emp_id",
  "employee_details",
  "payroll_department",
  "payroll_working",
  "payroll_present",
  "payroll_leave",
  "payroll_extra_hours",
  "payroll_salary",
  "payroll_bonus_col",
  "payroll_overtime",
  "payroll_deductions_col",
  "payroll_net",
  "actions_menu",
];

const menuOptions = [
  { value: "view_payslip", label: "View Payslip" },
  { value: "edit_payroll", label: "Edit Payroll"  },
  { value: "send",         label: "Send Payslip"  },
];

const PayrollManagement = () => {
 const { payrolls, loading, actionLoading, error, attendanceImported, fetchPayroll, generatePayroll, updatePayroll } = usePayroll();
  const { profile: companyProfile } = useCompanyProfile();

  const [selectedDate,    setSelectedDate]    = useState(new Date());
  const [hasGenerated,    setHasGenerated]    = useState(false);
  const [selectedRows,    setSelectedRows]    = useState([]);
  const [viewOpen,        setViewOpen]        = useState(false);
  const [editOpen,        setEditOpen]        = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [sending,         setSending]         = useState(false);
  const [sendProgress,    setSendProgress]    = useState("");
  const [successMsg,      setSuccessMsg]      = useState("");
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [apiError,        setApiError]        = useState("");

  // State for the hidden capture components
  const [captureQueue,  setCaptureQueue]  = useState([]); // rows being rendered
  const [logoDataUrl,   setLogoDataUrl]   = useState("");
  const captureRefs = useRef({}); // ref map: rowId → HiddenPayslipCapture ref

  const confirmRef = useRef();

  const currentMonth = selectedDate?.getMonth()    ?? new Date().getMonth();
  const currentYear  = selectedDate?.getFullYear() ?? new Date().getFullYear();

  const companyName = companyProfile?.companyName?.trim() || "Sprintexa";

  useEffect(() => {
    (async () => {
      const result = await fetchPayroll(new Date().getMonth(), new Date().getFullYear());
      if (result?.data?.length > 0) setHasGenerated(true);
    })();
  }, []);

  // ── Load company logo whenever the company profile's logoUrl changes
  // (e.g. right after an admin uploads a new one in Settings). ─────────────
  useEffect(() => {
    if (companyProfile?.logoUrl) {
      getLogo(companyProfile.logoUrl).then(setLogoDataUrl);
    }
  }, [companyProfile?.logoUrl]);

  const tableData = payrolls.map((p) => ({
    id:              p.id || p._id,
    empId:           p.empId            || "",
    name:            p.name             || "",
    avatar:          p.avatar           || "",
    designation:     p.designation      || "",
    department:      p.department       || "",
    working:         p.requiredWorkingDays,
    present:         p.presentDays,
    leave:           p.approvedLeaveDays,
    baseSalary:      p.monthlySalary,
    bonus:           p.bonusAmount,
    deductions:      p.deductionAmount,
    netPay:          p.netSalary,

    // ── Derivation, so the payslip can explain every number ──────────────
    totalCalendarDays: p.totalCalendarDays,
    baseWorkingDays:   p.baseWorkingDays,
    baseWorkingHours:  p.baseWorkingHours,
    paidHolidays:      p.paidHolidays,
    paidAbsenceDays:   p.paidAbsenceDays,
    paidAbsenceHours:  p.paidAbsenceHours,
    requiredHours:     p.requiredHours,
    rateBasisHours:    p.rateBasisHours,
    workingHoursDay:   p.workingHoursDay,

    actualHours:      p.actualHours,
    onSiteHours:      p.onSiteHours,
    offSiteHours:     p.offSiteHours,
    loggedExtraHours: p.loggedExtraHours,
    shortfallHours:   p.shortfallHours,
    hourlyRate:       p.hourlyRate,
    extraHours:       p.extraHours,
    extraAmount:      p.extraAmount,
    otMultiplier:     p.otMultiplier,
    offDayWorkedDays: p.offDayWorkedDays,
    absentDays:       p.absentDays,
    lateDays:         p.lateDays,
    hasAttendanceData: p.hasAttendanceData,

    status:          p.status,
    salaryBreakdown: p.salaryBreakdown  || {},
    employmentType:  p.employmentType   || "",
  }));

  const unverified = tableData.filter((r) => !r.hasAttendanceData);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setHasGenerated(false);
    setSelectedRows([]);
    setApiError("");
    if (!date) return;
    const result = await fetchPayroll(date.getMonth(), date.getFullYear());
    if (result?.data?.length > 0) setHasGenerated(true);
  };

 const runGenerate = async () => {
    setApiError("");
    const result = await generatePayroll(currentMonth, currentYear);
    if (result.success) {
      setHasGenerated(true);
      setSuccessMsg(`Payroll generated for ${MONTH_NAMES[currentMonth]} ${currentYear}.`);
      setShowSuccess(true);
    } else {
      setApiError(result.message);
    }
  };

  const handleGenerate = () => {
    setApiError("");
    // Month-wide gate: nothing has been imported for this month at all — the
    // "everyone is unverified" case. This is warn-and-confirm, NOT a block, so
    // the intentional "pay in full and flag" path still works; it just becomes
    // a conscious choice instead of an accidental full-pay month.
    if (attendanceImported === false) {
      confirmRef.current?.open({
        title: "No attendance imported for this month",
        description:
          `No attendance records exist for ${MONTH_NAMES[currentMonth]} ${currentYear}. ` +
          `If you generate now, every employee is paid in full with no deductions and flagged as unverified. ` +
          `Import the attendance sheet first for accurate figures. Generate anyway?`,
        confirmText: "Generate Anyway",
        cancelText:  "Import First",
        onConfirm:   () => runGenerate(),
      });
      return;
    }
    runGenerate();
  };

  const handleSelectRow = (id) =>
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  const handleSelectAll = () =>
    setSelectedRows((prev) => prev.length === tableData.length ? [] : tableData.map((r) => r.id));

  // ── Send: mount hidden templates → wait for paint → capture → send ─────────
  const sendPayslips = async (rows) => {
    setSending(true);
    setApiError("");
    try {
      const logo = logoDataUrl || (companyProfile?.logoUrl ? await getLogo(companyProfile.logoUrl) : "");
      setLogoDataUrl(logo);

      // 1. Mount hidden PayslipTemplate for each employee
      setSendProgress(`Rendering ${rows.length} payslip${rows.length > 1 ? "s" : ""}...`);
      captureRefs.current = {};
      setCaptureQueue(rows);

      // 2. Wait for React to paint all templates (one tick is enough after setState)
      await new Promise((r) => setTimeout(r, 500));

      // 3. Capture each rendered template via html2canvas
      setSendProgress(`Capturing PDFs...`);
      const payslips = [];
      for (const row of rows) {
        const ref = captureRefs.current[row.id];
        if (!ref) { console.warn("No ref for", row.name); continue; }
        try {
          const pdfBase64 = await ref.captureToBase64();
          if (pdfBase64 && pdfBase64.length > 100) {
            payslips.push({ payrollId: row.id, empId: row.empId, empName: row.name, netSalary: row.netPay, pdfBase64 });
          }
        } catch (err) {
          console.error(`Capture failed for ${row.name}:`, err);
        }
      }

      // 4. Unmount hidden templates
      setCaptureQueue([]);

      if (!payslips.length) { setApiError("Failed to capture any PDFs."); return; }

      // 5. Send all in one API call — backend responds immediately, emails in background
      setSendProgress(`Sending ${payslips.length} email${payslips.length > 1 ? "s" : ""}...`);
      const res = await sendPayslipWithPdfApi({
        payslips,
        month:     currentMonth,
        year:      currentYear,
        monthName: MONTH_NAMES[currentMonth],
      });

      if (res?.status === 200 || res?.status === 201) {
        setSuccessMsg(res.data?.message || `Payslips sent to ${payslips.length} employee(s).`);
        setShowSuccess(true);
      } else {
        setApiError(res?.data?.message || "Failed to send.");
      }
    } catch (err) {
      console.error("sendPayslips error:", err);
      setApiError("Something went wrong.");
    } finally {
      setSending(false);
      setSendProgress("");
      setCaptureQueue([]);
    }
  };

  const handleMenuAction = (action, row) => {
    if (action === "view_payslip") { setSelectedPayroll(row); setViewOpen(true); }
    if (action === "edit_payroll") { setSelectedPayroll(row); setEditOpen(true); }
    if (action === "send") {
      confirmRef.current?.open({
        title: "Send Payslip?", description: `Send payslip to ${row.name}?`,
        confirmText: "Yes, Send", cancelText: "Cancel",
        onConfirm: () => sendPayslips([row]),
      });
    }
  };

  const handleSendSelected = () => {
    if (!selectedRows.length) { setApiError("Select at least one employee."); return; }
    const rows = tableData.filter((r) => selectedRows.includes(r.id));
    confirmRef.current?.open({
      title: "Send Payslips?", description: `Send payslips to ${rows.length} selected employee(s)?`,
      confirmText: "Yes, Send", cancelText: "Cancel",
      onConfirm: () => sendPayslips(rows),
    });
  };

  const handleSendAll = () => {
    confirmRef.current?.open({
      title: "Send All Payslips?",
      description: `Send to ALL ${tableData.length} employees for ${MONTH_NAMES[currentMonth]} ${currentYear}?`,
      confirmText: "Yes, Send All", cancelText: "Cancel",
      onConfirm: () => sendPayslips(tableData),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
        <Grid container spacing={2} mb={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <HeaderText title="Payroll Management" subtitle="Generate and manage employee payroll" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" justifyContent="flex-end" gap={1.5} flexWrap="wrap">
              {hasGenerated && tableData.length > 0 && (
                <>
                  {selectedRows.length > 0 && (
                    <CustomButton btnLabel={sending ? "Sending..." : `Send to Selected (${selectedRows.length})`}
                      variant="outlined" handlePressBtn={handleSendSelected} isDisabled={actionLoading || sending} />
                  )}
                  <CustomButton btnLabel={sending ? "Sending..." : "Send All Payslips"}
                    variant="outlined" handlePressBtn={handleSendAll} isDisabled={actionLoading || sending} />
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" alignItems="flex-end" gap={2} mb={3} flexWrap="wrap"
          sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 2.5 }}>
          <Box>
            <Typography fontSize="13px" fontWeight={500} color="text.secondary" mb={0.5}>Select Month</Typography>
            <DatePicker 
            value={selectedDate} 
            onChange={handleDateChange} 
            views={["year","month"]} 
            openTo="month"
            slotProps={{ 
              textField: { size: "small", sx: { width: 200 } },
              popper: {
                sx: {
                  "& [role='radio'][aria-checked='true']": {
                    background: "linear-gradient(90deg, #AA2493 0%, #022179 100%) !important",
                    color: "#ffffff !important",
                  },
                },
              },
            }} 
            sx={GlobalStyle.datePickerStyle} 
          />
          </Box>
          <CustomButton
            btnLabel={actionLoading
              ? <Box display="flex" alignItems="center" gap={1}><CircularProgress size={14} sx={{ color: "#fff" }} />Generating...</Box>
              : hasGenerated ? "Re-generate Payroll" : "Generate Payroll"}
            variant="gradient" handlePressBtn={handleGenerate} isDisabled={actionLoading || loading} />
          {hasGenerated && tableData.length > 0 && (
            <Typography fontSize="12px" color="#04C373" fontWeight={500}>✓ {MONTH_NAMES[currentMonth]} {currentYear}</Typography>
          )}
        </Box>

        {sending && (
          <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#F0F9FF", borderRadius: "10px", border: "1px solid #BAE6FD", display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={16} sx={{ color: "#0369A1" }} />
            <Typography fontSize={13} color="#0369A1">{sendProgress || "Processing..."}</Typography>
          </Box>
        )}

        {/* ── Month-level gate: nothing imported for this month at all.
            Shows before generation as a "you probably forgot to import"
            nudge. Distinct from the per-row banner below, which covers the
            partial case where SOME employees are missing. ──────────────── */}
        {!loading && attendanceImported === false && (
          <Box mb={2} px={2.5} py={1.75} sx={{
            backgroundColor: "#FFF7E6", borderRadius: "12px", border: "1px solid #FFE0A3",
          }}>
            <Typography fontSize="13px" color="#B45309" fontWeight={500}>
              No attendance sheet has been imported for {MONTH_NAMES[currentMonth]} {currentYear}.
              Generating payroll now will pay everyone in full with no deductions. Import attendance first for accurate figures.
            </Typography>
          </Box>
        )}

        {/* ── Unverified rows — no attendance imported for these employees.
            They are paid in full rather than deducted a whole month, so HR
            must know the figure is unchecked. ──────────────────────────── */}
        {hasGenerated && !loading && attendanceImported !== false && unverified.length > 0 && (
          <Box mb={2} px={2.5} py={1.75} sx={{
            backgroundColor: "#FFF7E6", borderRadius: "12px", border: "1px solid #FFE0A3",
          }}>
            <Typography fontSize="13px" color="#B45309" fontWeight={500}>
              {unverified.length} employee{unverified.length !== 1 ? "s have" : " has"} no attendance
              records for {MONTH_NAMES[currentMonth]} {currentYear} — paid in full with no deduction.
              Check their Attendance Machine ID, or import the sheet for this month.
            </Typography>
            <Typography fontSize="11px" color="#92400E" mt={0.5}>
              {unverified.map((r) => r.name).filter(Boolean).join(", ")}
            </Typography>
          </Box>
        )}

        {(error || apiError) && (
          <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
            <Typography fontSize={13} color="error">{error || apiError}</Typography>
          </Box>
        )}
        {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress size={32} sx={{ color: "#AA2493" }} /></Box>}

        {!hasGenerated && !loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} bgcolor="#fff" borderRadius="25px">
            <Typography fontSize="15px" color="text.secondary" mb={1}>No payroll generated yet for {MONTH_NAMES[currentMonth]} {currentYear}.</Typography>
            <Typography fontSize="13px" color="text.secondary">Click <strong>Generate Payroll</strong> to begin.</Typography>
          </Box>
        )}

        {hasGenerated && !loading && (
          <Box bgcolor="#fff" borderRadius="25px" p={1}>
            <PaginatedTable tableHeader={tableHeader} tableData={tableData} displayRows={displayRows}
              isLoading={false} menuOptions={menuOptions} onMenuAction={handleMenuAction}
              selectedRows={selectedRows} onSelectRow={handleSelectRow} onSelectAll={handleSelectAll} />
          </Box>
        )}

        {/* ── Hidden PayslipTemplates for email capture ─────────────────── */}
        {captureQueue.map((row) => (
          <HiddenPayslipCapture
            key={row.id}
            ref={(r) => { if (r) captureRefs.current[row.id] = r; }}
            payroll={row}
            month={currentMonth}
            year={currentYear}
            logoDataUrl={logoDataUrl}
            companyName={companyName}
          />
        ))}

        <ViewPayslipDialog open={viewOpen} onClose={() => { setViewOpen(false); setSelectedPayroll(null); }}
          payroll={selectedPayroll || {}} month={currentMonth} year={currentYear} />
        <EditPayrollDialog
          open={editOpen}
          onClose={() => { setEditOpen(false); setSelectedPayroll(null); }}
          payroll={selectedPayroll || {}}
          month={currentMonth}
          year={currentYear}
          onSave={async (formData) => {
            const result = await updatePayroll(selectedPayroll.id, {
              bonus:      Number(formData.bonus) || 0,
              deductions: Number(formData.deductions) || 0,
              reason:     formData.reason || "",
            });
            if (result.success) {
              setSuccessMsg("Payroll updated successfully.");
              setShowSuccess(true);
            } else {
              setApiError(result.message);
            }
            return result;
          }}
        />
        <ConfirmationDialog ref={confirmRef} />
        <SuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} autoClose autoCloseDelay={2000} />
      </>
    </LocalizationProvider>
  );
};

export default PayrollManagement;