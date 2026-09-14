// src/app/hrPortal/payroll/index.jsx — Phase 4 fix (Leave Management Enhancement)
// FIX: tableData now passes through unpaidLeaveDays/unpaidLeaveDeduction so
// ViewPayslipDialog (which reads `row` directly) can show the itemized
// deduction. Deliberately NOT combined into `deductions` here — that field
// feeds editPayrollDialog's editable input, and saving a combined value back
// through updatePayroll would overwrite deductionAmount with a figure that
// already includes unpaidLeaveDeduction, silently double-counting it on the
// next payroll view. Combining is only safe on the read-only employee side.
//
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



// Send window: 25th of the payroll month through the 5th of the next month.
// Checked against the SELECTED month/year (currentMonth/currentYear), same
// as isGenerateWindowOpen — not just today's day-of-month in isolation.
// Otherwise Sept 1–5 would wrongly show as "open" for September too, when
// it's actually still August's window that's open.
const isSendWindowOpen = (month, year) => {
  const today = new Date();
  const windowStart = new Date(year, month, 25, 0, 0, 0);
  const windowEnd   = new Date(year, month + 1, 5, 23, 59, 59, 999);
  return today >= windowStart && today <= windowEnd;
};

// Generate window: payroll for month M/year Y can be generated/regenerated
// from the 5th of month M through the 5th of month M+1 — HR needs to be able
// to run/re-run the CURRENT month's payroll well before month-end, not just
// in the last week. (Send window stays 25th–5th — unrelated, unchanged.)
const isGenerateWindowOpen = (month, year) => {
  const today = new Date();
  const windowStart = new Date(year, month, 5, 0, 0, 0);
  const windowEnd   = new Date(year, month + 1, 18, 23, 59, 59, 999); // TEMP: was 5, extended for testing — revert to 5 later
  return today >= windowStart && today <= windowEnd;
};

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
  { id: "status",     label: "Status"      },
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
   "payroll_status", 
  "actions_menu",
];

const menuOptions = [
  { value: "view_payslip", label: "View Payslip" },
  { value: "edit_payroll", label: "Edit Payroll"  },
  { value: "finalize_payroll", label: "Finalize Payroll" },
  { value: "send",         label: "Send Payslip"  },
];

const PayrollManagement = () => {
const { payrolls, loading, actionLoading, error, attendanceImported, fetchPayroll, generatePayroll, updatePayroll, finalizePayroll } = usePayroll();
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

    // NEW — additive only. Do NOT fold these into `deductions` above: that
    // field is what editPayrollDialog pre-fills and saves back verbatim via
    // updatePayroll(deductionAmount). Combining here would mean saving the
    // combined figure back as deductionAmount, silently double-counting
    // unpaidLeaveDeduction (which the backend still applies separately) on
    // every future view. ViewPayslipDialog reads these as separate fields.
    unpaidLeaveDays:      p.unpaidLeaveDays      || 0,
    unpaidLeaveDeduction: p.unpaidLeaveDeduction || 0,

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

  const runFinalize = async (row) => {
    const result = await finalizePayroll(row.id);
    if (result.success) {
      setSuccessMsg(`Payroll finalized for ${row.name}. It is now visible on their salary page.`);
      setShowSuccess(true);
    } else {
      setApiError(result.message);
    }
  };

  const handleFinalizeRow = (row) => {
    if (row.status === "finalized") {
      setApiError(`${row.name}'s payroll is already finalized.`);
      return;
    }
    confirmRef.current?.open({
      title: "Finalize Payroll?",
      description:
        `Finalizing ${row.name}'s payroll for ${MONTH_NAMES[currentMonth]} ${currentYear} locks it — ` +
        `bonus/deductions can no longer be edited and it becomes visible on their My Salary page. This can't be undone. Continue?`,
      confirmText: "Yes, Finalize",
      cancelText:  "Cancel",
      onConfirm:   () => runFinalize(row),
    });
  };

  const draftRows = tableData.filter((r) => r.status !== "finalized");

  const handleFinalizeAll = () => {
    if (!draftRows.length) return;
    confirmRef.current?.open({
      title: "Finalize All Draft Payrolls?",
      description:
        `This will finalize ${draftRows.length} draft payroll record(s) for ${MONTH_NAMES[currentMonth]} ${currentYear}. ` +
        `Once finalized, they can no longer be edited or regenerated, and become visible to each employee on their My Salary page. This can't be undone. Continue?`,
      confirmText: "Yes, Finalize All",
      cancelText:  "Cancel",
      onConfirm: async () => {
        let successCount = 0;
        for (const row of draftRows) {
          const result = await finalizePayroll(row.id);
          if (result.success) successCount++;
        }
        setSuccessMsg(`Finalized ${successCount} of ${draftRows.length} payroll record(s).`);
        setShowSuccess(true);
      },
    });
  };

  const handleSelectRow = (id) =>
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  const handleSelectAll = () =>
    setSelectedRows((prev) => prev.length === tableData.length ? [] : tableData.map((r) => r.id));

  const sendPayslips = async (rows) => {
    setSending(true);
    setApiError("");
    try {
      const logo = logoDataUrl || (companyProfile?.logoUrl ? await getLogo(companyProfile.logoUrl) : "");
      setLogoDataUrl(logo);

      setSendProgress(`Rendering ${rows.length} payslip${rows.length > 1 ? "s" : ""}...`);
      captureRefs.current = {};
      setCaptureQueue(rows);

      await new Promise((r) => setTimeout(r, 500));

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

      setCaptureQueue([]);

      if (!payslips.length) { setApiError("Failed to capture any PDFs."); return; }

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
    if (action === "view_payslip")     { setSelectedPayroll(row); setViewOpen(true); }
    if (action === "edit_payroll")     { setSelectedPayroll(row); setEditOpen(true); }
    if (action === "finalize_payroll") { handleFinalizeRow(row); }
    if (action === "send") {
      confirmRef.current?.open({
        title: "Send Payslip?", description: `Send payslip to ${row.name}?`,
        confirmText: "Yes, Send", cancelText: "Cancel",
        onConfirm: () => sendPayslips([row]),
      });
    }
  };

  const handleSendSelected = () => {
    if (!isSendWindowOpen(currentMonth, currentYear)) return;
    if (!selectedRows.length) { setApiError("Select at least one employee."); return; }
    const rows = tableData.filter((r) => selectedRows.includes(r.id));
    confirmRef.current?.open({
      title: "Send Payslips?", description: `Send payslips to ${rows.length} selected employee(s)?`,
      confirmText: "Yes, Send", cancelText: "Cancel",
      onConfirm: () => sendPayslips(rows),
    });
  };

  const handleSendAll = () => {
     if (!isSendWindowOpen(currentMonth, currentYear)) return;
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
                    variant="outlined" handlePressBtn={handleSendSelected}
                    disabled={actionLoading || sending || !isSendWindowOpen(currentMonth, currentYear)} />
                  )}
                  <CustomButton btnLabel={sending ? "Sending..." : "Send All Payslips"}
                  variant="outlined" handlePressBtn={handleSendAll}
                  disabled={actionLoading || sending || !isSendWindowOpen(currentMonth, currentYear)} />
                </>
              )}
            </Box>

           
            {hasGenerated && tableData.length > 0 && !isSendWindowOpen(currentMonth, currentYear) && (
          <Typography fontSize="11px" color="text.secondary" mt={0.5} width="100%" textAlign="right">
            Payslips can be sent between the 25th of {MONTH_NAMES[currentMonth]} and the 5th of {MONTH_NAMES[(currentMonth + 1) % 12]}.
          </Typography>
        )}
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
            minDate={new Date(2000, 0, 1)}
            maxDate={new Date(new Date().getFullYear(), 11, 31)}
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
        variant="gradient"
        handlePressBtn={handleGenerate}
        disabled={actionLoading || loading || !isGenerateWindowOpen(currentMonth, currentYear)} />
        {hasGenerated && tableData.length > 0 && (
          <Typography fontSize="12px" color="#04C373" fontWeight={500}>✓ {MONTH_NAMES[currentMonth]} {currentYear}</Typography>
        )}
        {hasGenerated && tableData.length > 0 && (
          <CustomButton
            btnLabel={draftRows.length > 0 ? `Finalize All (${draftRows.length})` : "All Finalized"}
            variant="outlined"
            handlePressBtn={handleFinalizeAll}
            disabled={actionLoading || draftRows.length === 0}
          />
        )}
        {hasGenerated && tableData.length > 0 && draftRows.length === 0 && (
          <Typography fontSize="12px" color="#04C373" fontWeight={500}>
            ✓ All payroll records finalized
          </Typography>
        )}
            

        {!isGenerateWindowOpen(currentMonth, currentYear) && (
          <Typography fontSize="11px" color="text.secondary" mt={0.5}>
            {hasGenerated ? "Re-generation" : "Generation"} for {MONTH_NAMES[currentMonth]} is only allowed between the 5th of {MONTH_NAMES[currentMonth]} and the 5th of {MONTH_NAMES[(currentMonth + 1) % 12]}.
          </Typography>
        )}  
         </Box>
         {hasGenerated && !loading && draftRows.length > 0 && draftRows.length < tableData.length && (
          <Box mb={2} px={2.5} py={1.75} sx={{ backgroundColor: "#F0F9FF", borderRadius: "12px", border: "1px solid #BAE6FD" }}>
            <Typography fontSize="13px" color="#0369A1" fontWeight={500}>
              {draftRows.length} of {tableData.length} payroll record(s) are still in draft — employees won't see these until finalized.
            </Typography>
          </Box>
        )}

        {sending && (
          <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#F0F9FF", borderRadius: "10px", border: "1px solid #BAE6FD", display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={16} sx={{ color: "#0369A1" }} />
            <Typography fontSize={13} color="#0369A1">{sendProgress || "Processing..."}</Typography>
          </Box>
        )}

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