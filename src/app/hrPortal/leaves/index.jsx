// src/app/hrPortal/leaves/index.jsx 
import { useState, useRef }  from "react";
import { Box, Grid }         from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HeaderText                from "../../../components/headerText";
import CustomButton              from "../../../components/customButton";
import Filter                    from "../../../components/filterBar/filter";
import PaginatedTable            from "../../../components/dynamicTable";
import ConfirmationDialog        from "../../../components/popups/confirmation";
import SuccessPopup              from "../../../components/popups/confirmationDialog";
import LeaveRequestDetailDialog  from "./leaveRequestDetailDialog";
import { useHRLeaves }           from "../../../hooks/leave";

import ExportIcon from "../../../assets/icons/download-icon-white.svg";
import viewIcon   from "../../../assets/icons/view.svg";

const tableHeader = [
  { id: "name",          label: "Employee"        },
  { id: "leaveType",     label: "Type"            },
  { id: "dates",         label: "From & To Dates" },
  { id: "days",          label: "Days"            },
  { id: "reason",        label: "Reason"          },
  { id: "submittedDate", label: "Submitted"       },
  { id: "status",        label: "Status"          },
  { id: "actions",       label: "Actions"         },
];

const displayRows = [
  "lm_employee",
  "lm_type",
  "lm_dates",
  "lm_days",
  "lm_reason",
  "lm_submitted",
  "lm_status",
  "lm_actions",
];

const LEAVE_TYPE_LABELS = {
  sick:       "Sick Leave",
  casual:     "Casual Leave",
  annual:     "Annual Leave",
  maternity:  "Maternity Leave",
  unpaid:     "Unpaid Leave",
  short:      "Short Leave",
  emergency:  "Emergency Leave",
  full_day:   "Full Day Leave",
};

const LeaveManagement = () => {
  const {
    leaves, loading, actionLoading,
    reviewLeave, handleFilterChange,
    pagination, handlePageChange,
  } = useHRLeaves();

  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });
  const [apiError,      setApiError]      = useState("");
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const confirmRef = useRef();

  // Map API data → table rows
  const tableData = leaves.map((l) => ({
    id:            l._id,
    name:          l.employee?.fullName  || "—",
    avatar:        l.employee?.avatar   || "",
    designation: l.employee?.role?.roleName || l.employee?.designation || "",
    role:        l.employee?.role?.roleName   || "—",
    roleId:      l.employee?.role?._id        || "",
    empId:         l.employee?.empId    || "",
    leaveType:     LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
    leaveTypeRaw:  l.leaveType,
    fromDate:      l.fromDate
      ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    toDate:        l.toDate
      ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    days:          l.totalDays ?? 1,
    reason:        l.reason?.length > 35 ? l.reason.slice(0, 35) + "..." : l.reason || "—",
    reasonFull:    l.reason || "",
    submittedDate: l.createdAt
      ? new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    // Capitalize status for display
    status:        l.status
      ? l.status.charAt(0).toUpperCase() + l.status.slice(1)
      : "Pending",
    hrNotes:       l.hrNotes || "",
  }));

  const handleApprove = (row, hrNotes = "") => {
    confirmRef.current?.open({
      title:       "Approve Leave?",
      description: `Approve leave request for ${row.name}?`,
      confirmText: "Yes, Approve",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, "approved", hrNotes);
        if (result.success) {
          setActionSuccess({ open: true, message: "Leave approved successfully." });
          setViewOpen(false);
        } else {
          setApiError(result.message);
        }
      },
    });
  };

  const handleReject = (row, hrNotes = "") => {
    confirmRef.current?.open({
      title:       "Reject Leave?",
      description: `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await reviewLeave(row.id, "rejected", hrNotes);
        if (result.success) {
          setActionSuccess({ open: true, message: "Leave rejected." });
          setViewOpen(false);
        } else {
          setApiError(result.message);
        }
      },
    });
  };


const handleExportPDF = () => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.setTextColor(170, 36, 147);
  doc.text("Leave Management Report", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    14, 26
  );

  autoTable(doc, {
    startY: 32,
    head: [["Emp ID","Employee", "Type", "From", "To", "Days", "Reason", "Submitted", "Status"]],
    body: tableData.map((l) => [
      l.empId || "—",
      l.name,
      l.leaveType,
      l.fromDate,
      l.toDate,
      l.days,
      l.reasonFull || l.reason,
      l.submittedDate,
      l.status,
    ]),
    headStyles:          { fillColor: [170, 36, 147], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles:          { fontSize: 8 },
    alternateRowStyles:  { fillColor: [250, 245, 255] },
    styles:              { cellPadding: 3, overflow: "linebreak" },
    columnStyles:        { 4: { cellWidth: 12 }, 7: { cellWidth: 20 } },
  });

  doc.save(`leave-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Leave Management"
            subtitle="Review and manage all employee leave requests"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Export PDF"
              variant="gradient"
              startIcon={<img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />}
               handlePressBtn={handleExportPDF}
            />
          </Box>
        </Grid>
      </Grid>

      <Filter
        mode="leave_management"
        onFilterChange={(f) => handleFilterChange({
          search: f.search || "",
          status: f.status || "",
          leaveType: f.leaveType || "",
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
        />
      </Box>

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={actionSuccess.open}
        onClose={() => setActionSuccess({ open: false, message: "" })}
        message={actionSuccess.message}
        autoClose
        autoCloseDelay={2000}
      />

      <LeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </>
  );
};

export default LeaveManagement;