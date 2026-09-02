// src/app/empPortal/myAttendance/myLeaveRequests.jsx — Phase 1 (Leave Management Enhancement)
// Added: "Leave Balance" button + popup (spec §2.1). Table unchanged.
// NEW: View icon on every row (Pending/Approved/Rejected) opening a
// read-only detail dialog; Cancel button remains pending-only, now sharing
// the same Action cell via the "leave_view_actions" dynamicTable case.

import { useRef, useState, useMemo } from "react";
import { Box, Typography }           from "@mui/material";

import Filter              from "../../../components/filterBar/filter";
import PaginatedTable      from "../../../components/dynamicTable";
import ConfirmationDialog  from "../../../components/popups/confirmation";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import CustomButton        from "../../../components/customButton";
import LeaveBalancePopup   from "./leaveBalancePopup";
import MyLeaveRequestDetailDialog from "./myLeaveRequestDetailDialog";
import calendarIcon        from "../../../assets/icons/tasks.svg";
import viewIcon             from "../../../assets/icons/view.svg";

const LEAVE_TYPE_LABELS = {
  sick:      "Sick Leave",
  casual:    "Casual Leave",
  annual:    "Annual Leave",
  maternity: "Maternity Leave",
  emergency: "Emergency Leave",
  short:     "Short Leave",
  full_day:  "Full Day Leave",
  unpaid:    "Unpaid Leave",   // legacy rows only
};

const tableHeader = [
  { id: "leaveType",     label: "Leave Type"     },
  { id: "appliedDays",   label: "Applied Days"   },
  { id: "approvedDays",  label: "Approved Days"  },
  { id: "fromDate",      label: "Applied Dates"  },
  { id: "approvedDates", label: "Approved Dates" },
  { id: "reason",        label: "Reason"         },
  { id: "status",        label: "Status"         },
  { id: "submittedOn",   label: "Submitted On"   },
  { id: "action",        label: "Action"         },
];

const displayRows = [
  "leaveType",
  "appliedDays",
  "approvedDays",
  "appliedDates",
  "approvedDates",
  "reason",
  "leave_status",
  "submittedOn",
  "leave_view_actions",
];

const MyLeaveRequests = ({
  leaves = [],
  loading = false,
  actionLoading = false,
  cancelLeave,
  onRequestLeave,
  balance = null,
  balanceLoading = false,
}) => {
  const confirmRef = useRef();
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [viewOpen,    setViewOpen]    = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const now = new Date();
  const [filters, setFilters] = useState({ monthYear: now });

  const handleCancel = (row) => {
    confirmRef.current?.open({
      title:       "Cancel Leave Request?",
      description: "This will cancel your pending leave request.",
      confirmText: "Yes, Cancel",
      cancelText:  "Keep It",
      onConfirm: async () => {
        const result = await cancelLeave?.(row.id);
        if (result?.success) {
          setSuccessMsg(result.message);
          setShowSuccess(true);
          setErrorMsg("");
        } else {
          setErrorMsg(result?.message || "Failed to cancel.");
        }
      },
    });
  };

  const filteredLeaves = useMemo(() => {
    if (!filters.monthYear) return leaves;
    const selMonth = filters.monthYear.getMonth();
    const selYear  = filters.monthYear.getFullYear();
    const monthStart = new Date(selYear, selMonth, 1);
    const monthEnd   = new Date(selYear, selMonth + 1, 0, 23, 59, 59);
    return leaves.filter((l) => {
      if (!l.fromDate) return false;
      const from = new Date(l.fromDate);
      const to   = l.toDate ? new Date(l.toDate) : from;
      return from <= monthEnd && to >= monthStart;
    });
  }, [leaves, filters.monthYear]);

 const tableData = filteredLeaves.map((l) => {
  const appliedFromLabel = l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const appliedToLabel   = l.toDate   ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })   : "—";

  const approvedDays = l.status === "approved"
    ? l.approvedDays ?? 0
    : l.status === "rejected"
      ? 0
      : "—";

  const approvedDates = l.status === "approved" && l.approvedFromDate && l.approvedToDate
    ? `${new Date(l.approvedFromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(l.approvedToDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "—";

  return {
    id:          l._id,
    leaveType:   LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
    leaveTypeRaw: l.leaveType,
    fromDate:    appliedFromLabel,
    toDate:      appliedToLabel,
    appliedDates: `${appliedFromLabel} – ${appliedToLabel}`,
    appliedDays: l.totalDays ?? 1,
    approvedDays,
    approvedDates,
    totalDays:   l.totalDays ?? 1,
    reason:      l.reason ? (l.reason.length > 40 ? l.reason.slice(0, 40) + "..." : l.reason) : "—",
    reasonFull:  l.reason || "",
    status:      l.status || "pending",
    submittedOn: l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    hrNotes:     l.hrNotes || "",
    paymentPreference: l.paymentPreference || "paid",
  };
});

  return (
    <Box>
      {errorMsg && (
        <Box mb={2} px={2} py={1.5} sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{errorMsg}</Typography>
        </Box>
      )}

      {/* Filter + action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={2}>
        <Box flex={1}>
          <Filter mode="emp_leave_requests" defaultValues={{ monthYear: now }} onFilterChange={setFilters} />
        </Box>

        <Box display="flex" gap={1.5} flexShrink={0}>
          <CustomButton
            btnLabel="Leave Balance"
            variant="grayOutlined"
            handlePressBtn={() => setBalanceOpen(true)}
            sx={{ minWidth: "140px", height: "40px", fontSize: "14px" }}
          />
          <CustomButton
            btnLabel="Request Leave"
            variant="gradient"
            handlePressBtn={onRequestLeave}
            startIcon={<img src={calendarIcon} alt="" style={{ width: 16, height: 16, filter: "brightness(0) invert(1)" }} />}
            sx={{ minWidth: "150px", height: "40px", fontSize: "14px" }}
          />
        </Box>
      </Box>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          onCancelClick={handleCancel}
          viewIcon={viewIcon}
          onViewClick={(row) => { setSelectedLeave(row); setViewOpen(true); }}
          actionLoading={actionLoading}
        />
      </Box>

      <LeaveBalancePopup
        open={balanceOpen}
        onClose={() => setBalanceOpen(false)}
        balance={balance}
        loading={balanceLoading}
      />

      <MyLeaveRequestDetailDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave || {}}
        balance={balance}
        balanceLoading={balanceLoading}
      />

      <ConfirmationDialog ref={confirmRef} />

      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default MyLeaveRequests;