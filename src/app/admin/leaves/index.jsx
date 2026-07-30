// src/app/admin/leaves/escalatedLeaves.jsx — Phase 3 (Leave Management Enhancement) — NEW FILE
// Admin-only queue for leave requests that exceeded the approval threshold.
// Mount this under your admin router, e.g. path "/leaves/escalated".

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Grid, Typography, Avatar, Chip, CircularProgress } from "@mui/material";
import { DatePicker }             from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider }   from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }         from "@mui/x-date-pickers/AdapterDateFns";
import GlobalStyle          from "../../../style/style";
import HeaderText          from "../../../components/headerText";
import PaginatedTable      from "../../../components/dynamicTable";
import ConfirmationDialog  from "../../../components/popups/confirmation";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import {
  DialogContainer, DialogHeader, DialogBody, TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import { adminGetEscalatedLeavesApi, adminReviewEscalationApi } from "../../../api/modules/leave";

const tableHeader = [
  { id: "name",     label: "Employee"  },
  { id: "leaveType",label: "Type"      },
  { id: "days",     label: "Days"      },
  { id: "dates",    label: "Dates"     },
  { id: "reason",   label: "Reason"    },
  { id: "status",   label: "Status"    },

];

const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave", casual: "Casual Leave", annual: "Annual Leave", maternity: "Maternity Leave",
  short: "Short Leave", emergency: "Emergency Leave", full_day: "Full Day Leave", unpaid: "Unpaid Leave",
};

const STATUS_CHIP = {
  pending:  { bg: "#FF972F1A", color: "#FF972F", label: "Awaiting Your Approval" },
  approved: { bg: "#04C3731A", color: "#04C373", label: "Approved — HR Finalizing" },
  rejected: { bg: "#FF00001A", color: "#FF0000", label: "Rejected & Closed" },
};

const EscalatedLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [decision, setDecision]     = useState("approve_all");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo]     = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const confirmRef = useRef();

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetEscalatedLeavesApi({ status: statusFilter, limit: 50 });
      if (res?.status === 200 || res?.status === 201) {
        setLeaves(res.data.data.leaves || []);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const tableData = leaves.map((l) => ({
    id: l._id,
    name: l.employee?.fullName || "—",
    avatar: l.employee?.avatar || "",
    empId: l.employee?.empId || "",
    leaveType: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType,
    days: l.totalDays,
    dates: `${new Date(l.fromDate).toLocaleDateString()} – ${new Date(l.toDate).toLocaleDateString()}`,
    _rawFromDate: new Date(l.fromDate),
    _rawToDate: new Date(l.toDate),
    reason: l.reason || "—",
    adminStatus: l.escalation?.adminStatus || "pending",
    raw: l,
  }));

  const openDialog = (row) => {
    setSelected(row);
    setDecision("approve_all");
    setCustomFrom(null);
    setCustomTo(null);
    setAdminNotes("");
    setNotesError("");
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (decision === "reject" && !adminNotes.trim()) {
      setNotesError("A rejection reason is required.");
      return;
    }
    if (decision === "approve_custom" && (!customFrom || !customTo)) {
      setNotesError("Pick both a from and to date for the custom range.");
      return;
    }
    confirmRef.current?.open({
      title: decision === "reject" ? "Reject & Close Request?" : decision === "approve_custom" ? "Approve Custom Range?" : "Approve Full Range?",
      description: decision === "reject"
        ? `This permanently closes ${selected.name}'s leave request. HR cannot override this.`
        : decision === "approve_custom"
          ? `HR will only be able to finalize ${selected.name}'s request within the range you chose.`
          : `HR will be able to finalize ${selected.name}'s full requested range.`,
      confirmText: "Yes, Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await adminReviewEscalationApi(selected.id, {
            decision,
            adminFromDate: decision === "approve_custom" ? customFrom : undefined,
            adminToDate:   decision === "approve_custom" ? customTo   : undefined,
            adminNotes: adminNotes.trim(),
          });
          if (res?.status === 200 || res?.status === 201) {
            setSuccessMsg(res.data.message || "Done.");
            setShowSuccess(true);
            setDialogOpen(false);
            fetchLeaves();
          } else {
            setApiError(res?.data?.message || "Something went wrong.");
          }
        } catch (err) {
          setApiError(err?.response?.data?.message || "Something went wrong.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return (
    <>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12 }}>
          <HeaderText title="Escalated Leave Requests" subtitle="Requests exceeding the approval threshold — your decision unlocks or closes them" />
        </Grid>
      </Grid>

      <Box display="flex" gap={1.5} mb={2}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Box
            key={s}
            onClick={() => setStatusFilter(s)}
            sx={{
              px: 2, py: 0.75, borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              backgroundColor: statusFilter === s ? "#AA2493" : "#F5F5F5",
              color: statusFilter === s ? "#fff" : "text.secondary",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Box>
        ))}
      </Box>

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} sx={{ color: "#AA2493" }} /></Box>
        ) : (
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={tableData.map((r) => ({
              ...r,
              status: (
                <Chip
                  label={STATUS_CHIP[r.adminStatus]?.label || r.adminStatus}
                  size="small"
                  sx={{ height: "22px", fontSize: "11px", fontWeight: 600, backgroundColor: STATUS_CHIP[r.adminStatus]?.bg, color: STATUS_CHIP[r.adminStatus]?.color }}
                />
              ),
            }))}
            displayRows={["name", "leaveType", "days", "dates", "reason", "status", "actions"]}
            isLoading={false}
            onViewClick={(row) => openDialog(row)}
          />
        )}
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DialogContainer open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="440px" fullWidth>
          <DialogHeader title="Review Escalated Request" onClose={() => setDialogOpen(false)} />
          <DialogBody>
            {selected && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selected.avatar} sx={{ width: 44, height: 44 }}>{selected.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={700} fontSize="14px">{selected.name}</Typography>
                    <Typography fontSize="12px" color="text.secondary">{selected.leaveType} · {selected.days} day(s)</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  {[
                    { value: "approve_all",    label: "Approve All"          },
                    { value: "approve_custom", label: "Approve Custom Range" },
                    { value: "reject",         label: "Reject & Close"       },
                  ].map((o) => (
                    <Box
                      key={o.value}
                      onClick={() => { setDecision(o.value); setNotesError(""); }}
                      sx={{
                        flex: "1 1 auto", textAlign: "center", cursor: "pointer", px: 1.5, py: 1, borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                        border: decision === o.value ? "1.5px solid #AA2493" : "1px solid #E5E7EB",
                        backgroundColor: decision === o.value ? "#FAF0FF" : "#fff",
                        color: decision === o.value ? "#AA2493" : "text.secondary",
                      }}
                    >
                      {o.label}
                    </Box>
                  ))}
                </Box>

                {decision === "approve_custom" && (
                  <Box sx={{ display: "flex", gap: 1.5, "& > *": { flex: 1 } }}>
                    <Box>
                      <CustomInputLabel label="Approve From" />
                      <DatePicker value={customFrom} minDate={selected._rawFromDate} maxDate={selected._rawToDate} onChange={setCustomFrom}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                        sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#F5F5F5", borderRadius: "10px" } }} />
                    </Box>
                    <Box>
                      <CustomInputLabel label="Approve To" />
                      <DatePicker value={customTo} minDate={customFrom || selected._rawFromDate} maxDate={selected._rawToDate} onChange={setCustomTo}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                        sx={{ ...GlobalStyle.datePickerStyle, width: "100%", "& .MuiOutlinedInput-root": { backgroundColor: "#F5F5F5", borderRadius: "10px" } }} />
                    </Box>
                  </Box>
                )}

                {decision === "approve_custom" && (
                  <Typography fontSize="10px" color="text.secondary" mt={-1}>
                    HR will only be able to finalize within this range — days outside it are treated as rejected.
                  </Typography>
                )}

                <Box>
                  <CustomInputLabel label={decision === "reject" ? "Rejection Reason *" : "Notes (optional)"} />
                  <TextInput
                    placeholder={decision === "reject" ? "Explain why this is being rejected..." : "Optional note for the record..."}
                    value={adminNotes}
                    onChange={(e) => { setAdminNotes(e.target.value); if (notesError) setNotesError(""); }}
                    inputBgColor="#F5F5F5" fullWidth multiline rows={3}
                    error={!!notesError} helperText={notesError}
                  />
                </Box>
              </Box>
            )}
          </DialogBody>
          <DialogActionButtons
            onCancel={() => setDialogOpen(false)}
            onConfirm={handleConfirm}
            showCancelBtn
            cancelText="Cancel"
            confirmText="Confirm"
            variant="gradient"
            confirmLoading={actionLoading}
          />
        </DialogContainer>
      </LocalizationProvider>

      <ConfirmationDialog ref={confirmRef} />
      <SuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} autoClose autoCloseDelay={2000} />
      <SuccessPopup open={!!apiError} onClose={() => setApiError("")} message={apiError} />
    </>
  );
};

export default EscalatedLeaves;