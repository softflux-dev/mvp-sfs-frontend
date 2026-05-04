import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";

import HeaderText         from "../../../components/headerText";
import CustomButton       from "../../../components/customButton";
import Filter             from "../../../components/filterBar/filter";
import PaginatedTable     from "../../../components/dynamicTable";
import ConfirmationDialog from "../../../components/popups/confirmation";
import SuccessPopup       from "../../../components/popups/confirmationDialog";
import LeaveRequestDetailDialog from "./leaveRequestDetailDialog";
import ExportIcon from "../../../assets/icons/download-icon-white.svg";
import viewIcon   from "../../../assets/icons/view.svg";

const mockLeaves = [
  { id: 1,  name: "Sarah Johnson", avatar: "", leaveType: "Full Day",        fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 1, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Pending"  },
  { id: 2,  name: "James Chen",    avatar: "", leaveType: "Short Leave",     fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 2, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Pending"  },
  { id: 3,  name: "Aisha Patel",   avatar: "", leaveType: "Sick Leave",      fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 3, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Pending"  },
  { id: 4,  name: "Sarah Johnson", avatar: "", leaveType: "Emergency Leave", fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 1, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Approved" },
  { id: 5,  name: "James Chen",    avatar: "", leaveType: "Short Leave",     fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 2, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Approved" },
  { id: 6,  name: "James Chen",    avatar: "", leaveType: "Short Leave",     fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 2, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Approved" },
  { id: 7,  name: "James Chen",    avatar: "", leaveType: "Short Leave",     fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 2, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Rejected" },
  { id: 8,  name: "James Chen",    avatar: "", leaveType: "Short Leave",     fromDate: "Jun 29, 2026", toDate: "Jun 30, 2026", days: 2, reason: "Family function to atten...", submittedDate: "Jun 30, 2026", status: "Rejected" },
];

const tableHeader = [
  { id: "name",          label: "Employee"       },
  { id: "leaveType",     label: "Type"           },
  { id: "dates",         label: "From & To Dates"},
  { id: "days",          label: "Days"           },
  { id: "reason",        label: "Reason"         },
  { id: "submittedDate", label: "Submitted"      },
  { id: "status",        label: "Status"         },
  { id: "actions",       label: "Actions"        },
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

const LeaveManagement = () => {
  const [leaves,       setLeaves]       = useState(mockLeaves);
  const [filters,      setFilters]      = useState({});
  const [actionSuccess, setActionSuccess] = useState({ open: false, message: "" });
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const confirmRef = useRef();

  const handleApprove = (row) => {
    confirmRef.current?.open({
      title:       "Approve Leave?",
      description: `Approve leave request for ${row.name}?`,
      confirmText: "Yes, Approve",
      cancelText:  "Cancel",
      onConfirm: () => {
        setLeaves((prev) =>
          prev.map((l) => l.id === row.id ? { ...l, status: "Approved" } : l)
        );
        setActionSuccess({ open: true, message: "Leave approved successfully" });
      },
    });
  };

  const handleReject = (row) => {
    confirmRef.current?.open({
      title:       "Reject Leave?",
      description: `Reject leave request for ${row.name}?`,
      confirmText: "Yes, Reject",
      cancelText:  "Cancel",
      onConfirm: () => {
        setLeaves((prev) =>
          prev.map((l) => l.id === row.id ? { ...l, status: "Rejected" } : l)
        );
        setActionSuccess({ open: true, message: "Leave rejected" });
      },
    });
  };

  const filteredData = leaves.filter((row) => {
    const search = filters.search?.toLowerCase() || "";
    const type   = filters.type   || "";
    const status = filters.status || "";
    const matchSearch = !search || row.name.toLowerCase().includes(search);
    const matchType   = !type   || row.leaveType.toLowerCase().replace(/ /g, "_") === type;
    const matchStatus = !status || row.status.toLowerCase() === status;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
              startIcon={
                <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
              }
              handlePressBtn={() => console.log("Export")}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Filter ─────────────────────────────────────────────────────── */}
      <Filter mode="leave_management" onFilterChange={setFilters} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={false}
          viewIcon={viewIcon}
          onViewClick={(row) => { setSelectedLeave(row); setViewOpen(true); }}
          onApproveClick={handleApprove}
          onRejectClick={handleReject}
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
        />
    </>
  );
};

export default LeaveManagement;