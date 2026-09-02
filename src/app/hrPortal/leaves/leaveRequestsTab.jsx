// src/app/hrPortal/leaves/leaveRequestsTab.jsx — Phase 5 (Leave Management Enhancement) — NEW FILE
// Extracted from hrPortal/leaves/index.jsx's Tab 1 content. Self-contained —
// no behavior change, just moved (including its own Export PDF button).

import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";
import CustomButton              from "../../../components/customButton";
import Filter                    from "../../../components/filterBar/filter";
import PaginatedTable            from "../../../components/dynamicTable";
import ConfirmationDialog        from "../../../components/popups/confirmation";
import SuccessPopup              from "../../../components/popups/confirmationDialog";
import LeaveRequestDetailDialog  from "./leaveRequestDetailDialog";
import { useHRLeaves }           from "../../../hooks/leave";
import { useCompanyProfile }     from "../../../hooks/companySettings";
import { createReportDoc, addReportTable, savePdf } from "../../../utils/reportPdfExport";

import ExportIcon from "../../../assets/icons/download-icon-white.svg";
import viewIcon   from "../../../assets/icons/view.svg";

const tableHeader = [
  { id: "name",          label: "Employee"        },
  { id: "leaveType",     label: "Type"            },
  { id: "appliedDays",   label: "Applied Days"    },
  { id: "approvedDays",  label: "Approved Days"   },
  { id: "dates",         label: "Applied Dates"   },
  { id: "approvedDates", label: "Approved Dates"  },
  { id: "reason",        label: "Reason"          },
  { id: "submittedDate", label: "Submitted"       },
  { id: "status",        label: "Status"          },
  { id: "actions",       label: "Actions"         },
];

const displayRows = [
  "employee_details", "lm_type", "lm_days", "approvedDays", "lm_dates", "approvedDates", "lm_reason", "lm_submitted", "lm_status", "lm_actions",
];

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave", maternity: "Maternity Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave", unpaid: "Unpaid Leave",
};

const formatLocalDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const LeaveRequestsTab = () => {
  const {
    leaves, loading, actionLoading, reviewLeave, handleFilterChange,
    pagination, handlePageChange, handleRowsPerPageChange, fetchLeaves,
  } = useHRLeaves();

  const { profile: companyProfile } = useCompanyProfile();

  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });
  const [apiError,      setApiError]      = useState("");
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [exporting,     setExporting]     = useState(false);

  const confirmRef = useRef();

  const tableData = leaves.map((l) => {
  // Populated directly on the Leave doc once HR (or Admin, on rejection)
  // has reviewed it — see controllers/hr/leave.js reviewLeave and
  // controllers/admin/leave.js reviewEscalation.
  const approvedDays = l.status === "approved"
    ? l.approvedDays ?? 0
    : l.status === "rejected"
      ? 0
      : "—";

  const approvedDates = l.status === "approved" && l.approvedFromDate && l.approvedToDate
    ? `${new Date(l.approvedFromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(l.approvedToDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : l.status === "rejected"
      ? "—"
      : "—";

  return {
    id: l._id,
    employeeMongoId: l.employee?._id || "",
    name: l.employee?.fullName || "—",
    avatar: l.employee?.avatar || "",
    designation: l.employee?.role?.roleName || l.employee?.designation || "",
    role: l.employee?.role?.roleName || "—",
    roleId: l.employee?.role?._id || "",
    empId: l.employee?.empId || "",
    leaveType: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
    leaveTypeRaw: l.leaveType,
    fromDate: l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    toDate:   l.toDate   ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })   : "—",
    _rawFromDate: l.fromDate ? new Date(l.fromDate) : null,
    _rawToDate:   l.toDate   ? new Date(l.toDate)   : null,
    days: l.totalDays ?? 1,
    appliedDays: l.totalDays ?? 1,
    approvedDays,
    approvedDates,
    reason: l.reason?.length > 35 ? l.reason.slice(0, 35) + "..." : l.reason || "—",
    reasonFull: l.reason || "",
    submittedDate: l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : "Pending",
    hrNotes: l.hrNotes || "",
    rejectionReason: l.rejectionReason || "",
    paymentPreference: l.paymentPreference || "paid",
    escalationRequired: !!l.escalation?.required,
    escalationHrLocked: !!l.escalation?.hrLocked,
    escalationAdminStatus: l.escalation?.adminStatus || "none",
    _adminCapFromDate: l.escalation?.adminApprovedFromDate ? new Date(l.escalation.adminApprovedFromDate) : null,
    _adminCapToDate:   l.escalation?.adminApprovedToDate   ? new Date(l.escalation.adminApprovedToDate)   : null,
    audit: l.audit || [],
  };
});

  const handleApprove = (row, payload) => {
    const isCustom = payload?.decision === "approve_custom";
    confirmRef.current?.open({
      title: isCustom ? "Approve Custom Range?" : "Approve Leave?",
      description: `Confirm this decision for ${row.name}'s leave request?`,
      confirmText: "Yes, Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, payload);
        if (result.success) {
          setActionSuccess({ open: true, message: result.message || "Leave reviewed successfully." });
          setViewOpen(false);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleReject = (row, payload) => {
    confirmRef.current?.open({
      title: "Reject Leave?",
      description: payload?.hrNotes ? `Reject leave for ${row.name}?\nReason: "${payload.hrNotes}"` : `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText: "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, { decision: "reject_all", hrNotes: payload?.hrNotes || "" });
        if (result.success) {
          setActionSuccess({ open: true, message: "Leave rejected." });
          setViewOpen(false);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const branding = { logoUrl: companyProfile?.logoUrl || "", companyName: companyProfile?.companyName || "" };
      const doc = await createReportDoc("Leave Management Report", "", branding);
      addReportTable(doc, {
        head: ["Emp ID", "Employee", "Type", "From", "To", "Days", "Reason", "Submitted", "Status"],
        body: tableData.map((l) => [l.empId || "—", l.name, l.leaveType, l.fromDate, l.toDate, String(l.days), l.reasonFull || l.reason, l.submittedDate, l.status]),
        startY: 44, columnStyles: { 4: { cellWidth: 14 }, 7: { cellWidth: 20 } }, companyName: branding.companyName,
      });
      savePdf(doc, `leave-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }} />
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel={exporting ? "Exporting..." : "Export PDF"}
              variant="gradient"
              startIcon={<img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />}
              handlePressBtn={handleExportPDF}
              isDisabled={exporting}
            />
          </Box>
        </Grid>
      </Grid>

      <Filter
        mode="leave_management"
        onFilterChange={(f) => handleFilterChange({
          search: f.search || "", status: f.status || "", leaveType: f.leaveType || "", dateFilter: f.dateFilter || "",
          dateFrom: f.dateFrom ? formatLocalDate(f.dateFrom) : "", dateTo: f.dateTo ? formatLocalDate(f.dateTo) : "",
        })}
      />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          viewIcon={viewIcon}
          onViewClick={(row) => { setSelectedLeave(row); setViewOpen(true); }}
          onApproveClick={handleApprove}
          onRejectClick={handleReject}
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          totalCount={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup open={actionSuccess.open} onClose={() => setActionSuccess({ open: false, message: "" })} message={actionSuccess.message} autoClose autoCloseDelay={2000} />

      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onApprove={handleApprove}
        onReject={handleReject}
        onEscalationResolved={fetchLeaves}
        loading={actionLoading}
      />
      <SuccessPopup open={!!apiError} onClose={() => setApiError("")} message={apiError} />
    </Box>
  );
};

export default LeaveRequestsTab;