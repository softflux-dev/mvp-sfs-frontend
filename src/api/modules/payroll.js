// src/api/modules/payroll.js 
import ENDPOINTS from "../endpoints";
import api       from "../index";

export const generatePayrollApi = (payload) =>
  api(ENDPOINTS.generatePayroll, payload, "post");

export const getPayrollApi = (params) =>
  api(ENDPOINTS.getPayroll, params, "get");

export const finalizePayrollApi = (id) =>
  api(`${ENDPOINTS.finalizePayroll}/${id}/finalize`, null, "patch");

export const sendPayslipEmailApi = (payload) =>
  api(ENDPOINTS.sendPayslipEmail, payload, "post");

export const sendPayslipWithPdfApi = (payload) =>
  api("hr/payroll/send-payslip-pdf", payload, "post");

export const updatePayrollApi = (id, payload) =>
  api(`${ENDPOINTS.updatePayroll}/${id}`, payload, "patch");