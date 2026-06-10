// src/app/empPortal/myAttendance/myLeaveRequests.jsx — FULL REPLACEMENT
import { useRef, useState } from "react";
import { Box, Typography }  from "@mui/material";

import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";

const LEAVE_TYPE_LABELS = {
  sick:      "Sick Leave",
  casual:    "Casual Leave",
  annual:    "Annual Leave",
  maternity: "Maternity Leave",
  half_day:  "Half Day",
  emergency: "Emergency Leave",
};

const tableHeader = [
  { id: "leaveType",   label: "Leave Type"   },
  { id: "fromDate",    label: "From Date"    },
  { id: "toDate",      label: "To Date"      },
  { id: "totalDays",   label: "Total Days"   },
  { id: "reason",      label: "Reason"       },
  { id: "status",      label: "Status"       },
  { id: "submittedOn", label: "Submitted On" },
  { id: "action",      label: "Action"       },
];

const displayRows = [
  "leaveType",
  "fromDate",
  "toDate",
  "totalDays",
  "reason",
  "leave_status",
  "submittedOn",
  "leave_cancel",
];

const MyLeaveRequests = ({ leaves = [], loading = false, actionLoading = false, cancelLeave }) => {
  const confirmRef = useRef();
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  const handleCancel = (row) => {
    confirmRef.current?.open({
      title:       "Cancel Leave Request?",
      description: "This will permanently remove your leave request.",
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

  const tableData = leaves.map((l) => ({
    id:          l._id,
    leaveType:   LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType || "—",
    fromDate:    l.fromDate
      ? new Date(l.fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    toDate:      l.toDate
      ? new Date(l.toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    totalDays:   l.totalDays ?? 1,
    reason:      l.reason
      ? l.reason.length > 40 ? l.reason.slice(0, 40) + "..." : l.reason
      : "—",
    status:      l.status || "pending",
    submittedOn: l.createdAt
      ? new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
  }));

  return (
    <Box>
      {errorMsg && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{errorMsg}</Typography>
        </Box>
      )}

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          onCancelClick={handleCancel}
          actionLoading={actionLoading}
        />
      </Box>

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