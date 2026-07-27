// src/hooks/payroll.js — NEW FILE
import { useState, useCallback } from "react";
import {
  generatePayrollApi,
  getPayrollApi,
  finalizePayrollApi,
  sendPayslipEmailApi,
  updatePayrollApi,
} from "../../api/modules/payroll";

export const usePayroll = () => {
  const [payrolls,      setPayrolls]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const [generatedMonths, setGeneratedMonths] = useState(new Set()); // "YYYY-M" keys
  const [attendanceImported, setAttendanceImported] = useState(null); // null = unknown

  // ── Fetch payroll for a specific month/year ────────────────────────────────
const fetchPayroll = useCallback(async (month, year) => {
    if (month === undefined || month === null || !year) return;
    setLoading(true);
    setError("");
    setAttendanceImported(null); // clear previous month's value while we load
    try {
      const response = await getPayrollApi({ month, year });
      if (response?.status === 200 || response?.status === 201) {
        const data = response.data.data.payrolls || [];
        setPayrolls(data);
        // Whole-month signal — true even before payroll is generated, since
        // the backend derives it from the Attendance collection directly.
        setAttendanceImported(!!response.data.data.attendanceImported);
        if (data.length > 0) {
          setGeneratedMonths((prev) => new Set([...prev, `${year}-${month}`]));
        }
        return { success: true, data };
      }
      const msg = response?.data?.message || "Failed to fetch payroll.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Generate payroll for a month/year ─────────────────────────────────────
  const generatePayroll = useCallback(async (month, year) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await generatePayrollApi({ month, year });
      if (response?.status === 200 || response?.status === 201) {
        const data = response.data.data.payrolls || [];
        setPayrolls(data);
        setGeneratedMonths((prev) => new Set([...prev, `${year}-${month}`]));
        return {
          success: true,
          message: response.data.message || "Payroll generated successfully.",
          data,
        };
      }
      const msg = response?.data?.message || "Failed to generate payroll.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Check if payroll already generated for a month ────────────────────────
  const isMonthGenerated = useCallback((month, year) => {
    return generatedMonths.has(`${year}-${month}`);
  }, [generatedMonths]);

  // ── Send payslip emails ────────────────────────────────────────────────────
  const sendPayslipEmails = useCallback(async (payrollIds, month, year) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await sendPayslipEmailApi({ payrollIds, month, year });
      if (response?.status === 200 || response?.status === 201) {
        return {
          success: true,
          message: response.data.message || "Payslips sent successfully.",
        };
      }
      const msg = response?.data?.message || "Failed to send payslips.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Update payroll (manual bonus/deduction override) ────────────────────
const updatePayroll = useCallback(async (id, payload) => {
  setActionLoading(true);
  setError("");
  try {
    const response = await updatePayrollApi(id, payload);
    if (response?.status === 200 || response?.status === 201) {
      const updated = response.data.data.payroll;
      setPayrolls((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { success: true, message: response.data.message || "Payroll updated successfully.", data: updated };
    }
    const msg = response?.data?.message || "Failed to update payroll.";
    setError(msg);
    return { success: false, message: msg };
  } catch {
    const msg = "Something went wrong.";
    setError(msg);
    return { success: false, message: msg };
  } finally {
    setActionLoading(false);
  }
}, []);

 return {
    payrolls,
    loading,
    actionLoading,
    error,
    generatedMonths,
    attendanceImported,
    fetchPayroll,
    generatePayroll,
    isMonthGenerated,
    sendPayslipEmails,
    updatePayroll,
  };
};