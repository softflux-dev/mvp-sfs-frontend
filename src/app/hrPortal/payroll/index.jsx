// src/app/hrPortal/payroll/index.jsx — FULL REPLACEMENT
import { useState, useRef, useEffect } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { DatePicker }           from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }       from "@mui/x-date-pickers/AdapterDateFns";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import ViewPayslipDialog, { generatePayslipPdfBase64 } from "./viewPayslipDialog";
import EditPayrollDialog  from "./editPayrollDialog";
import { usePayroll }     from "../../../hooks/payroll";
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
  { id: "baseSalary", label: "Base Salary" },
  { id: "bonus",      label: "Bonus"       },
  { id: "deductions", label: "Deductions"  },
  { id: "netPay",     label: "Net Pay"     },
  { id: "actions",    label: ""            },
];

const displayRows = [
  "payroll_checkbox",
  "payroll_emp_id",
  "payroll_employee",
  "payroll_department",
  "payroll_working",
  "payroll_present",
  "payroll_leave",
  "payroll_salary",
  "payroll_bonus_col",
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
  const {
    payrolls, loading, actionLoading, error,
    fetchPayroll, generatePayroll,
  } = usePayroll();

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

  const confirmRef = useRef();

  const currentMonth = selectedDate ? selectedDate.getMonth()    : new Date().getMonth();
  const currentYear  = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();

  useEffect(() => {
    (async () => {
      const result = await fetchPayroll(new Date().getMonth(), new Date().getFullYear());
      if (result?.data?.length > 0) setHasGenerated(true);
    })();
  }, []);

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
    requiredHours:   p.requiredHours,
    actualHours:     p.actualHours,
    shortfallHours:  p.shortfallHours,
    hourlyRate:      p.hourlyRate,
    status:          p.status,
    salaryBreakdown: p.salaryBreakdown  || {},
    employmentType:  p.employmentType   || "",
  }));

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setHasGenerated(false);
    setSelectedRows([]);
    setApiError("");
    if (!date) return;
    const result = await fetchPayroll(date.getMonth(), date.getFullYear());
    if (result?.data?.length > 0) setHasGenerated(true);
  };

  const handleGenerate = async () => {
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

  const handleSelectRow = (id) =>
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);

  const handleSelectAll = () =>
    setSelectedRows((prev) => prev.length === tableData.length ? [] : tableData.map((r) => r.id));

  // ── Core send logic — generates ALL PDFs in parallel, sends in ONE request ──
  const sendPayslips = async (rows) => {
    setSending(true);
    setSendProgress(`Generating ${rows.length} PDF${rows.length > 1 ? "s" : ""}...`);
    setApiError("");

    try {
      // 1. Generate all PDFs in PARALLEL (not sequential)
      const pdfResults = await Promise.allSettled(
        rows.map((row) =>
          generatePayslipPdfBase64(row, currentMonth, currentYear)
            .then((pdfBase64) => ({ payrollId: row.id, empId: row.empId, empName: row.name, netSalary: row.netPay, pdfBase64 }))
        )
      );

      const payslips = pdfResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const failed = pdfResults.filter((r) => r.status === "rejected").length;

      if (!payslips.length) {
        setApiError("Failed to generate any PDFs.");
        return;
      }

      setSendProgress(`Sending ${payslips.length} email${payslips.length > 1 ? "s" : ""}...`);

      // 2. Send ALL in a single API call (backend loops through and emails each)
      const res = await sendPayslipWithPdfApi({
        payslips,
        month:     currentMonth,
        year:      currentYear,
        monthName: MONTH_NAMES[currentMonth],
      });

      if (res?.status === 200 || res?.status === 201) {
        const { sent = 0, total = payslips.length } = res.data?.data || {};
        setSuccessMsg(
          `Payslips sent to ${sent} of ${total} employee(s).` +
          (failed > 0 ? ` ${failed} PDF(s) failed to generate.` : "")
        );
        setShowSuccess(true);
      } else {
        setApiError(res?.data?.message || "Failed to send payslips.");
      }
    } catch (err) {
      console.error("Send payslips error:", err);
      setApiError("Failed to generate or send payslips.");
    } finally {
      setSending(false);
      setSendProgress("");
    }
  };

  const handleMenuAction = (action, row) => {
    if (action === "view_payslip") { setSelectedPayroll(row); setViewOpen(true); }
    if (action === "edit_payroll") { setSelectedPayroll(row); setEditOpen(true); }
    if (action === "send") {
      confirmRef.current?.open({
        title:       "Send Payslip?",
        description: `Send payslip email to ${row.name}?`,
        confirmText: "Yes, Send",
        cancelText:  "Cancel",
        onConfirm:   () => sendPayslips([row]),
      });
    }
  };

  const handleSendSelected = () => {
    if (!selectedRows.length) { setApiError("Please select at least one employee."); return; }
    const rows = tableData.filter((r) => selectedRows.includes(r.id));
    confirmRef.current?.open({
      title:       "Send Payslips?",
      description: `Send payslip emails to ${rows.length} selected employee(s)?`,
      confirmText: "Yes, Send",
      cancelText:  "Cancel",
      onConfirm:   () => sendPayslips(rows),
    });
  };

  const handleSendAll = () => {
    confirmRef.current?.open({
      title:       "Send All Payslips?",
      description: `Send payslip emails to ALL ${tableData.length} employees for ${MONTH_NAMES[currentMonth]} ${currentYear}?`,
      confirmText: "Yes, Send All",
      cancelText:  "Cancel",
      onConfirm:   () => sendPayslips(tableData),
    });
  };

  const totals = tableData.reduce(
    (acc, r) => ({
      baseSalary: acc.baseSalary + (r.baseSalary || 0),
      bonus:      acc.bonus      + (r.bonus      || 0),
      deductions: acc.deductions + (r.deductions || 0),
      netPay:     acc.netPay     + (r.netPay     || 0),
    }),
    { baseSalary: 0, bonus: 0, deductions: 0, netPay: 0 }
  );

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
                    <CustomButton
                      btnLabel={sending ? "Sending..." : `Send to Selected (${selectedRows.length})`}
                      variant="outlined"
                      handlePressBtn={handleSendSelected}
                      isDisabled={actionLoading || sending}
                    />
                  )}
                  <CustomButton
                    btnLabel={sending ? "Sending..." : "Send All Payslips"}
                    variant="outlined"
                    handlePressBtn={handleSendAll}
                    isDisabled={actionLoading || sending}
                  />
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
              views={["year", "month"]}
              openTo="month"
              slotProps={{ textField: { size: "small", sx: { width: 200 } } }}
              sx={GlobalStyle.datePickerStyle}
            />
          </Box>
          <Box>
            <CustomButton
              btnLabel={
                actionLoading
                  ? <Box display="flex" alignItems="center" gap={1}><CircularProgress size={14} sx={{ color: "#fff" }} />Generating...</Box>
                  : hasGenerated ? "Re-generate Payroll" : "Generate Payroll"
              }
              variant="gradient"
              handlePressBtn={handleGenerate}
              isDisabled={actionLoading || loading}
            />
          </Box>
          {hasGenerated && tableData.length > 0 && (
            <Typography fontSize="12px" color="#04C373" fontWeight={500}>
              ✓ {MONTH_NAMES[currentMonth]} {currentYear}
            </Typography>
          )}
        </Box>

        {/* Sending progress banner */}
        {sending && (
          <Box mb={2} px={2} py={1.5}
            sx={{ backgroundColor: "#F0F9FF", borderRadius: "10px", border: "1px solid #BAE6FD", display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <CircularProgress size={16} sx={{ color: "#0369A1" }} />
            <Typography fontSize={13} color="#0369A1">{sendProgress || "Processing..."}</Typography>
          </Box>
        )}

        {hasGenerated && tableData.length > 0 && (
          <Grid container spacing={2} mb={2}>
            {[
              { label: "Total Base Salary", value: totals.baseSalary, color: "text.primary" },
              { label: "Total Bonus",        value: totals.bonus,      color: "#04C373"      },
              { label: "Total Deductions",   value: totals.deductions, color: "#FF0000"      },
              { label: "Total Net Pay",      value: totals.netPay,     color: "#AA2493"      },
            ].map(({ label, value, color }) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 2 }}>
                  <Typography fontSize="12px" color="text.secondary" mb={0.5}>{label}</Typography>
                  <Typography fontSize="18px" fontWeight={700} color={color}>Rs {value.toLocaleString()}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {(error || apiError) && (
          <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
            <Typography fontSize={13} color="error">{error || apiError}</Typography>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={32} sx={{ color: "#AA2493" }} />
          </Box>
        )}

        {!hasGenerated && !loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} bgcolor="#fff" borderRadius="25px">
            <Typography fontSize="15px" color="text.secondary" mb={1}>
              No payroll generated yet for {MONTH_NAMES[currentMonth]} {currentYear}.
            </Typography>
            <Typography fontSize="13px" color="text.secondary">
              Click <strong>Generate Payroll</strong> to begin.
            </Typography>
          </Box>
        )}

        {hasGenerated && !loading && (
          <Box bgcolor="#fff" borderRadius="25px" p={1}>
            <PaginatedTable
              tableHeader={tableHeader}
              tableData={tableData}
              displayRows={displayRows}
              isLoading={false}
              menuOptions={menuOptions}
              onMenuAction={handleMenuAction}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
            />
          </Box>
        )}

        <ViewPayslipDialog
          open={viewOpen}
          onClose={() => { setViewOpen(false); setSelectedPayroll(null); }}
          payroll={selectedPayroll || {}}
          month={currentMonth}
          year={currentYear}
        />

        <EditPayrollDialog
          open={editOpen}
          onClose={() => { setEditOpen(false); setSelectedPayroll(null); }}
          payroll={selectedPayroll || {}}
          onSave={() => { setSuccessMsg("Payroll updated."); setShowSuccess(true); }}
        />

        <ConfirmationDialog ref={confirmRef} />

        <SuccessPopup
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          message={successMsg}
          autoClose
          autoCloseDelay={2000}
        />
      </>
    </LocalizationProvider>
  );
};

export default PayrollManagement;