// src/app/hrPortal/leaves/leaveRequestDetailDialog.jsx — Phases 2/3/5 (Leave Management Enhancement)
//
// FIX: this dialog is reachable by BOTH HR and Admin (Admin can open the same
// /leave-management page since the backend allows ADMIN on hr/leaves routes).
// It previously only ever rendered HR's view — a lock banner with "Send
// Reminder" buttons — with no way for Admin to actually resolve the
// escalation. Now role-aware via useUserStore:
//   • Admin + locked+pending  → Admin Decision panel (Unlock for HR /
//     Reject & Close), calling adminReviewEscalationApi (built in Phase 3,
//     previously wired to a backend route with no UI consumer).
//   • HR/PM + locked+pending  → unchanged reminder buttons.
// Also fixed: the reminder buttons used to stay visible even after Admin had
// already rejected the escalation (isHrLocked stays true permanently on a
// rejection) — now gated on `!adminRejectedEscalation` too.

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Avatar, Grid, Chip, CircularProgress, Divider, MenuItem } from "@mui/material";
import { AlertTriangle, Lock, Bell, History, ShieldCheck } from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody, CustomSelect } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import TextInput           from "../../../components/textInput";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import { DatePicker }             from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider }   from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns }         from "@mui/x-date-pickers/AdapterDateFns";
import GlobalStyle from "../../../style/style";
import useUserStore from "../../../zustand/useUserStore";
import {
  hrGetEmployeeLeaveBalanceApi, hrGetLeavePreviewApi, hrSendReminderApi,
  adminReviewEscalationApi,
} from "../../../api/modules/leave";

const STATUS_CONFIG = {
  Pending:  { bg: "#FF972F1A", color: "#FF972F" },
  Approved: { bg: "#04C3731A", color: "#04C373" },
  Rejected: { bg: "#FF00001A", color: "#FF0000" },
};

const TRACKED_TYPES = { annual: "Annual Leave", sick: "Sick Leave", casual: "Casual Leave", emergency: "Emergency Leave", maternity: "Maternity Leave" };

// ── Real, independently-consumable types only — used for the balance panel
// loop below. Annual is no longer its own bucket (it's the sum of these four
// — see backend fix), so it's shown once as a separate summary row instead
// of a redundant 5th equal-weight row next to Sick/Casual/Emergency/Maternity.
const REAL_TRACKED_TYPES = { sick: "Sick Leave", casual: "Casual Leave", emergency: "Emergency Leave", maternity: "Maternity Leave" };

const PAYMENT_PREF_CONFIG = {
  paid:   { label: "Paid",   bg: "#04C3731A", color: "#04C373" },
  unpaid: { label: "Unpaid", bg: "#FFF7E6",   color: "#B45309" },
};

const DECISION_OPTIONS = [
  { value: "approve_all",    label: "Approve All"          },
  { value: "approve_custom", label: "Approve Custom Range" },
  { value: "reject_all",     label: "Reject All"           },
];

const OVERRIDE_OPTIONS = [
  { value: "system_default", label: "System Default (auto-split)" },
  { value: "force_paid",     label: "Force All Paid"               },
  { value: "force_unpaid",   label: "Force All Unpaid"             },
];

const BalanceRow = ({ label, total, used, remaining, highlight }) => {
  const pct      = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const depleted = remaining <= 0;
  return (
    <Box sx={{ p: 1.5, borderRadius: "10px", border: highlight ? "1.5px solid #AA2493" : "1px solid #F0F0F0", backgroundColor: highlight ? "#FAF0FF" : "transparent" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
        <Typography fontSize="12px" fontWeight={highlight ? 700 : 500} color="text.primary">{label}</Typography>
        <Typography fontSize="12px" fontWeight={700} color={depleted ? "#DC2626" : "#04C373"}>{remaining} / {total} left</Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, backgroundColor: "#F0F0F0", overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 3, backgroundColor: depleted ? "#DC2626" : "#AA2493", transition: "width 0.3s ease" }} />
      </Box>
    </Box>
  );
};

const LeaveRequestDetailDialog = ({ open, onClose, leave = {}, onApprove, onReject, onEscalationResolved, loading = false }) => {
  const { user } = useUserStore();
  const isAdminViewer = user?.role === "ADMIN";

  const isPending        = leave.status === "Pending";
  const leaveTypeKey     = leave.leaveTypeRaw || "";
  const isTrackedType    = !!TRACKED_TYPES[leaveTypeKey];
  const employeeMongoId  = leave.employeeMongoId || null;

  const [decision, setDecision]       = useState("approve_all");
  const [customFrom, setCustomFrom]   = useState(null);
  const [customTo, setCustomTo]       = useState(null);
  const [override, setOverride]       = useState("system_default");
  const [hrNotes, setHrNotes]         = useState("");
  const [notesError, setNotesError]   = useState("");

  const [balance, setBalance]               = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError]     = useState("");

  const [preview, setPreview]               = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState("");

  const [reminderSending, setReminderSending] = useState(false);
  const [reminderMsg, setReminderMsg]         = useState("");
  const [showAudit, setShowAudit]             = useState(false);

  // ── Admin escalation decision state (NEW) ─────────────────────────────────
  const [adminDecision, setAdminDecision]         = useState("approve_all"); // "approve_all" | "approve_custom" | "reject"
  const [adminCustomFrom, setAdminCustomFrom]     = useState(null);
  const [adminCustomTo, setAdminCustomTo]         = useState(null);
  const [adminNotes, setAdminNotes]               = useState("");
  const [adminNotesError, setAdminNotesError]     = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminActionMsg, setAdminActionMsg]         = useState("");

  const isEscalated = !!leave.escalationRequired;
  const isHrLocked  = isEscalated && leave.escalationHrLocked;
  const adminRejectedEscalation = isEscalated && leave.escalationAdminStatus === "rejected";
  // Still awaiting Admin's initial decision — distinct from "locked forever
  // because Admin already rejected it," which is its own closed state above.
  const awaitingAdminDecision = isHrLocked && !adminRejectedEscalation;

  useEffect(() => {
    if (!open) {
      setDecision("approve_all"); setCustomFrom(null); setCustomTo(null); setOverride("system_default");
      setHrNotes(""); setNotesError(""); setBalance(null); setBalanceError("");
      setPreview(null); setPreviewError(""); setReminderMsg("");
      setAdminDecision("approve_all"); setAdminCustomFrom(null); setAdminCustomTo(null);
      setAdminNotes(""); setAdminNotesError(""); setAdminActionMsg("");
      return;
    }
    setHrNotes(leave.hrNotes || "");

    if (isPending && isTrackedType && employeeMongoId) {
      setBalanceLoading(true);
      hrGetEmployeeLeaveBalanceApi(employeeMongoId)
        .then((res) => {
          if (res?.status === 200 || res?.status === 201) setBalance(res.data.data.balance);
          else setBalanceError("Could not load leave balance.");
        })
        .catch(() => setBalanceError("Could not load leave balance."))
        .finally(() => setBalanceLoading(false));
    }
  }, [open, employeeMongoId]);

  // ── Live preview — recompute whenever decision/range/override changes ────
  const fetchPreview = useCallback(async () => {
    if (!open || !isPending || isHrLocked || adminRejectedEscalation) return;
    if (decision === "approve_custom" && (!customFrom || !customTo)) { setPreview(null); return; }

    setPreviewLoading(true);
    setPreviewError("");
    try {
      const res = await hrGetLeavePreviewApi(leave.id, {
        decision, customFrom, customTo, leaveTypeOverride: override,
      });
      if (res?.status === 200 || res?.status === 201) setPreview(res.data.data.preview);
      else { setPreview(null); setPreviewError(res?.data?.message || "Could not compute preview."); }
    } catch (err) {
      setPreview(null);
      setPreviewError(err?.response?.data?.message || "Could not compute preview.");
    } finally {
      setPreviewLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isPending, isHrLocked, adminRejectedEscalation, decision, customFrom, customTo, override, leave.id]);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  const requestedBalance = balance?.[leaveTypeKey] || null;
  const overQuota = isTrackedType && requestedBalance && (leave.days || 0) > requestedBalance.remaining;
  const statusCfg = STATUS_CONFIG[leave.status] || { bg: "#F5F5F5", color: "#757575" };

  const handleApprove = () => {
    setNotesError("");
    onApprove?.(leave, { decision, customFrom, customTo, leaveTypeOverride: override, hrNotes });
  };

  const handleReject = () => {
    setDecision("reject_all");
    if (!hrNotes.trim()) { setNotesError("Please provide a reason for rejection."); return; }
    setNotesError("");
    onReject?.(leave, { decision: "reject_all", hrNotes });
  };

  const handleRemind = async (channel) => {
    setReminderSending(true);
    setReminderMsg("");
    try {
      const res = await hrSendReminderApi(leave.id, { channel });
      setReminderMsg(res?.status === 200 || res?.status === 201 ? res.data.message : (res?.data?.message || "Could not send reminder."));
    } catch (err) {
      setReminderMsg(err?.response?.data?.message || "Could not send reminder.");
    } finally {
      setReminderSending(false);
    }
  };

  // ── Admin resolves the escalation: full range, custom range, or reject ───
  const handleAdminEscalationAction = async () => {
    if (adminDecision === "reject" && !adminNotes.trim()) {
      setAdminNotesError("A rejection reason is required.");
      return;
    }
    if (adminDecision === "approve_custom" && (!adminCustomFrom || !adminCustomTo)) {
      setAdminNotesError("Pick both a from and to date for the custom range.");
      return;
    }
    setAdminNotesError("");
    setAdminActionLoading(true);
    setAdminActionMsg("");
    try {
      const res = await adminReviewEscalationApi(leave.id, {
        decision: adminDecision,
        adminFromDate: adminDecision === "approve_custom" ? adminCustomFrom : undefined,
        adminToDate:   adminDecision === "approve_custom" ? adminCustomTo   : undefined,
        adminNotes: adminNotes.trim(),
      });
      if (res?.status === 200 || res?.status === 201) {
        setAdminActionMsg(res.data.message || "Done.");
        onEscalationResolved?.();
        // Brief pause so the confirmation is visible before the dialog closes.
        setTimeout(() => onClose?.(), 900);
      } else {
        setAdminActionMsg(res?.data?.message || "Something went wrong.");
      }
    } catch (err) {
      setAdminActionMsg(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={onClose} maxWidth="560px" fullWidth>
        <DialogHeader title="Leave Request Detail" onClose={onClose} />

        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Employee */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "#F5F5F5", borderRadius: "14px", px: 2.5, py: 2 }}>
              <Avatar src={leave.avatar} sx={{ width: 52, height: 52, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "20px", fontWeight: 700 }}>
                {leave.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography fontSize="16px" fontWeight={700} color="text.primary">{leave.name || "—"}</Typography>
                <Typography fontSize="12px" color="text.secondary">{leave.role || "—"}</Typography>
                {leave.empId && <Typography fontSize="11px" color="text.secondary">{leave.empId}</Typography>}
              </Box>
              <Box ml="auto">
                <Chip label={leave.status || "Pending"} size="small" sx={{ height: "26px", fontSize: "12px", fontWeight: 600, px: 1, borderRadius: "8px", backgroundColor: statusCfg.bg, color: statusCfg.color }} />
              </Box>
            </Box>

            {/* Escalation banner */}
            {isEscalated && (
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1.25, borderRadius: "10px", px: 2, py: 1.5,
                minWidth: 0, width: "100%", boxSizing: "border-box",
                backgroundColor: isHrLocked ? "#FFF0F0" : adminRejectedEscalation ? "#FFF0F0" : "#F0FDF4",
                border: `1px solid ${isHrLocked || adminRejectedEscalation ? "#FFCCCC" : "#BBF7D0"}`,
              }}>
                <Lock size={15} color={isHrLocked || adminRejectedEscalation ? "#DC2626" : "#16A34A"} style={{ marginTop: 2, flexShrink: 0 }} />
                <Box flex={1} minWidth={0} width="100%">
                  <Typography fontSize="12px" fontWeight={700} color={isHrLocked || adminRejectedEscalation ? "#DC2626" : "#16A34A"}>
                    {adminRejectedEscalation ? "Rejected by Admin — closed"
                      : isHrLocked ? "Locked — exceeds approval threshold"
                      : "Unlocked by Admin — you can finalize this request"}
                  </Typography>
                  <Typography fontSize="11px" color="text.secondary" mt={0.4}>
                    {adminRejectedEscalation
                      ? "Admin rejected this request. It cannot be reopened or overridden."
                      : isHrLocked
                        ? (isAdminViewer
                            ? "This request exceeds the configured approval threshold. Review it below."
                            : "This request's day count exceeds the configured threshold and requires Admin approval before you can act.")
                        : (leave._adminCapFromDate && leave._adminCapToDate
                            ? `Admin approved a custom range for review: ${leave._adminCapFromDate.toLocaleDateString()} – ${leave._adminCapToDate.toLocaleDateString()}. Anything outside this range is treated as rejected.`
                            : "Admin approved this request for review. Choose how to finalize it below.")}
                  </Typography>

                  {/* ── Admin's own decision controls — this is the fix ────── */}
                  {awaitingAdminDecision && isAdminViewer && (
                    <Box mt={1.5} sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {[
                          { value: "approve_all",    label: "Approve All"          },
                          { value: "approve_custom", label: "Approve Custom Range" },
                          { value: "reject",         label: "Reject & Close"       },
                        ].map((o) => (
                          <Box
                            key={o.value}
                            onClick={() => { setAdminDecision(o.value); setAdminNotesError(""); }}
                            sx={{
                              flex: "1 1 auto", textAlign: "center", cursor: "pointer", px: 1.5, py: 1, borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                              border: adminDecision === o.value ? "1.5px solid #AA2493" : "1px solid #E5E7EB",
                              backgroundColor: adminDecision === o.value ? "#FAF0FF" : "#fff",
                              color: adminDecision === o.value ? "#AA2493" : "text.secondary",
                            }}
                          >
                            {o.label}
                          </Box>
                        ))}
                      </Box>

                      {adminDecision === "approve_custom" && (
                        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, width: "100%", "& > *": { flex: 1, minWidth: 0 } }}>
                          <Box sx={{ minWidth: 0 }}>
                          <CustomInputLabel label="Approve From" />
                          <DatePicker value={adminCustomFrom} minDate={leave._rawFromDate} maxDate={leave._rawToDate} onChange={setAdminCustomFrom}
                            slotProps={{
                              textField: { size: "small", fullWidth: true },
                              popper: { sx: GlobalStyle.datePickerPopperSx },
                            }}
                            sx={{ ...GlobalStyle.datePickerStyle, width: "100%", minWidth: 0, "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "10px" } }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <CustomInputLabel label="Approve To" />
                          <DatePicker value={adminCustomTo} minDate={adminCustomFrom || leave._rawFromDate} maxDate={leave._rawToDate} onChange={setAdminCustomTo}
                            slotProps={{
                              textField: { size: "small", fullWidth: true },
                              popper: { sx: GlobalStyle.datePickerPopperSx },
                            }}
                            sx={{ ...GlobalStyle.datePickerStyle, width: "100%", minWidth: 0, "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "10px" } }} />
                        </Box>
                        </Box>
                      )}

                      {adminDecision === "approve_custom" && (
                        <Typography fontSize="10px" color="text.secondary">
                          HR will only be able to finalize within this range — the remaining {leave.days} − N day(s) outside it are treated as rejected.
                        </Typography>
                      )}

                      <Box>
                        <TextInput
                          placeholder={adminDecision === "reject" ? "Reason for rejection (required)..." : "Optional note..."}
                          value={adminNotes}
                          onChange={(e) => { setAdminNotes(e.target.value); if (adminNotesError) setAdminNotesError(""); }}
                          inputBgColor="#fff" fullWidth multiline rows={2}
                          error={!!adminNotesError} helperText={adminNotesError}
                        />
                      </Box>

                      <Box
                        onClick={adminActionLoading ? undefined : handleAdminEscalationAction}
                        sx={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.5,
                          cursor: adminActionLoading ? "default" : "pointer", px: 2, py: 0.9, borderRadius: "8px",
                          background: adminDecision === "reject" ? "#DC2626" : "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                          color: "#fff", fontSize: "12px", fontWeight: 600, opacity: adminActionLoading ? 0.7 : 1,
                        }}
                      >
                        <ShieldCheck size={13} />
                        {adminActionLoading
                          ? "Processing..."
                          : adminDecision === "reject" ? "Confirm Reject & Close"
                          : adminDecision === "approve_custom" ? "Confirm Custom Range"
                          : "Confirm Approve All"}
                      </Box>

                      {adminActionMsg && <Typography fontSize="11px" color="text.secondary">{adminActionMsg}</Typography>}
                    </Box>
                  )}

                  {/* ── HR's reminder buttons — unchanged, but now correctly
                      hidden once Admin has already rejected the escalation. ── */}
                  {awaitingAdminDecision && !isAdminViewer && (
                    <Box mt={1}>
                      <Box display="flex" gap={1}>
                        <Box onClick={reminderSending ? undefined : () => handleRemind("email")} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: reminderSending ? "default" : "pointer", px: 1.5, py: 0.6, borderRadius: "8px", backgroundColor: "#DC2626", color: "#fff", fontSize: "11px", fontWeight: 600, opacity: reminderSending ? 0.7 : 1 }}>
                          <Bell size={12} /> {reminderSending ? "Sending..." : "Send Reminder Email"}
                        </Box>
                        <Box onClick={reminderSending ? undefined : () => handleRemind("system")} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: reminderSending ? "default" : "pointer", px: 1.5, py: 0.6, borderRadius: "8px", border: "1px solid #DC2626", color: "#DC2626", fontSize: "11px", fontWeight: 600, opacity: reminderSending ? 0.7 : 1 }}>
                          <Bell size={12} /> {reminderSending ? "Sending..." : "Send System Notification"}
                        </Box>
                      </Box>
                      {reminderMsg && <Typography fontSize="11px" color="text.secondary" mt={0.5}>{reminderMsg}</Typography>}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Details */}
            <Box sx={{ border: "1px solid #F0F0F0", borderRadius: "14px", backgroundColor: "#fff", px: 2.5, py: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>Leave Type</Typography><Typography fontSize="14px" fontWeight={700}>{leave.leaveType || "—"}</Typography></Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography fontSize="11px" color="text.secondary" mb={0.4}>Requested As</Typography>
                  <Chip
                    label={PAYMENT_PREF_CONFIG[leave.paymentPreference]?.label || "Paid"}
                    size="small"
                    sx={{
                      height: "22px", fontSize: "12px", fontWeight: 700, px: 0.5, borderRadius: "8px",
                      backgroundColor: (PAYMENT_PREF_CONFIG[leave.paymentPreference] || PAYMENT_PREF_CONFIG.paid).bg,
                      color: (PAYMENT_PREF_CONFIG[leave.paymentPreference] || PAYMENT_PREF_CONFIG.paid).color,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>Total Days Requested</Typography><Typography fontSize="14px" fontWeight={700}>{leave.days ?? "—"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>From Date</Typography><Typography fontSize="14px" fontWeight={700}>{leave.fromDate || "—"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>To Date</Typography><Typography fontSize="14px" fontWeight={700}>{leave.toDate || "—"}</Typography></Grid>
                <Grid size={{ xs: 12 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>Submitted On</Typography><Typography fontSize="14px" fontWeight={700}>{leave.submittedDate || "—"}</Typography></Grid>
                {leave.status && leave.status !== "Pending" && (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <Typography fontSize="11px" color="text.secondary" mb={0.4}>Approved Days</Typography>
                      <Typography fontSize="14px" fontWeight={700} color={leave.status === "Rejected" ? "#DC2626" : "#04C373"}>
                        {leave.approvedDays ?? "—"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography fontSize="11px" color="text.secondary" mb={0.4}>Approved Dates</Typography>
                      <Typography fontSize="14px" fontWeight={700}>{leave.approvedDates || "—"}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Reason */}
            <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "14px", p: 2 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.5}>Reason</Typography>
              <Typography fontSize="13px" color="text.primary" lineHeight={1.6}>{leave.reasonFull || leave.reason || "—"}</Typography>
            </Box>

            {/* Leave Balance reference */}
            {isPending && isTrackedType && !isHrLocked && !adminRejectedEscalation && (
              <Box sx={{ border: "1px solid #F0F0F0", borderRadius: "14px", p: 2.5 }}>
                <Typography fontSize="13px" fontWeight={700} color="text.primary" mb={0.5}>Leave Balance ({new Date().getFullYear()})</Typography>
                <Typography fontSize="11px" color="text.secondary" mb={1.5}>Paid balance only — used to auto-split the approval below.</Typography>
                {balanceLoading && <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} sx={{ color: "#AA2493" }} /></Box>}
                {!balanceLoading && balanceError && <Typography fontSize="12px" color="text.secondary">{balanceError}</Typography>}
                {!balanceLoading && balance && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {/* Annual — one summary row, not its own bucket (it's the
                        sum of Sick+Casual+Emergency+Maternity below). Only
                        highlighted for legacy "annual"-typed requests, which
                        can no longer be newly submitted. */}
                    {balance.annual && (
                      <BalanceRow label="Annual (Sick+Casual+Emergency+Maternity)" total={balance.annual.total} used={balance.annual.used} remaining={balance.annual.remaining} highlight={leaveTypeKey === "annual"} />
                    )}
                    {Object.entries(REAL_TRACKED_TYPES).map(([key, label]) => balance[key] ? (
                      <BalanceRow key={key} label={label} total={balance[key].total} used={balance[key].used} remaining={balance[key].remaining} highlight={key === leaveTypeKey} />
                    ) : null)}
                  </Box>
                )}
                {!balanceLoading && overQuota && (
                  <Box mt={1.5} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3", borderRadius: "10px", px: 2, py: 1.5 }}>
                    <AlertTriangle size={15} color="#B45309" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography fontSize="11px" color="#92400E" lineHeight={1.5}>
                      {requestedBalance.remaining} day(s) of paid balance remaining, {leave.days} requested. The auto-split below will mark the excess as Unpaid unless you override it.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Decision controls — only when actionable ─────────────────── */}
            {isPending && !isHrLocked && !adminRejectedEscalation && (
              <>
                <Divider />
                <Box>
                  <CustomInputLabel label="Decision" />
                  <CustomSelect value={decision} onChange={(e) => setDecision(e.target.value)} fullWidth height="45px" inputBgColor="#F5F5F5">
                    {DECISION_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </CustomSelect>
                </Box>

                {decision === "approve_custom" && (
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%", "& > *": { flex: 1, minWidth: 0 } }}>
                    <Box sx={{ minWidth: 0 }}>
                      <CustomInputLabel label="Approved From" />
                      <DatePicker value={customFrom} minDate={leave._adminCapFromDate || leave._rawFromDate} maxDate={leave._adminCapToDate || leave._rawToDate} onChange={setCustomFrom}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                          popper: { sx: GlobalStyle.datePickerPopperSx },
                        }}
                        sx={{ ...GlobalStyle.datePickerStyle, width: "100%", minWidth: 0, "& .MuiOutlinedInput-root": { backgroundColor: "#F5F5F5", borderRadius: "12px" } }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <CustomInputLabel label="Approved To" />
                      <DatePicker value={customTo} minDate={customFrom || leave._adminCapFromDate || leave._rawFromDate} maxDate={leave._adminCapToDate || leave._rawToDate} onChange={setCustomTo}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                          popper: { sx: GlobalStyle.datePickerPopperSx },
                        }}
                        sx={{ ...GlobalStyle.datePickerStyle, width: "100%", minWidth: 0, "& .MuiOutlinedInput-root": { backgroundColor: "#F5F5F5", borderRadius: "12px" } }} />
                    </Box>
                  </Box>
                )}

                {decision === "approve_custom" && leave._adminCapFromDate && (
                  <Typography fontSize="10px" color="text.secondary" mt={-1}>
                    Bounded by Admin's approved range ({leave._adminCapFromDate.toLocaleDateString()} – {leave._adminCapToDate.toLocaleDateString()}).
                  </Typography>
                )}

                {decision !== "reject_all" && (
                  <Box>
                    <CustomInputLabel label="Leave Type Override" />
                    <CustomSelect value={override} onChange={(e) => setOverride(e.target.value)} fullWidth height="45px" inputBgColor="#F5F5F5">
                      {OVERRIDE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </CustomSelect>
                    <Typography fontSize="10px" color="text.secondary" mt={0.5}>
                      {leave.name || "Employee"} requested this as{" "}
                      <strong>{PAYMENT_PREF_CONFIG[leave.paymentPreference]?.label || "Paid"}</strong>. Choose Force Paid/Unpaid above to change it, or System Default to auto-split against their remaining balance instead.
                    </Typography>
                  </Box>
                )}

                {/* ── Live preview panel — shown for EVERY decision, including
                    reject_all, so HR always sees the balance breakdown
                    (spec §4.2 scenario 5: balance shown as unchanged on a
                    full rejection, not hidden). ─────────────────────────── */}
                <Box sx={{ backgroundColor: "#FAF0FF", border: "1px solid #F0D9F5", borderRadius: "14px", p: 2 }}>
                  <Typography fontSize="12px" fontWeight={700} color="#AA2493" mb={1}>Preview</Typography>
                  {previewLoading && <Box display="flex" justifyContent="center" py={1.5}><CircularProgress size={18} sx={{ color: "#AA2493" }} /></Box>}
                  {!previewLoading && previewError && <Typography fontSize="12px" color="error">{previewError}</Typography>}
                  {!previewLoading && preview && (
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography fontSize="10px" color="text.secondary">Approved</Typography><Typography fontSize="15px" fontWeight={700}>{preview.approvedDays}</Typography></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography fontSize="10px" color="text.secondary">Paid</Typography><Typography fontSize="15px" fontWeight={700} color="#04C373">{preview.paidDays}</Typography></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography fontSize="10px" color="text.secondary">Unpaid</Typography><Typography fontSize="15px" fontWeight={700} color="#B45309">{preview.unpaidDays}</Typography></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography fontSize="10px" color="text.secondary">Rejected</Typography><Typography fontSize="15px" fontWeight={700} color="#DC2626">{preview.rejectedDays}</Typography></Grid>
                      {preview.balanceAfter !== null && (
                        <Grid size={{ xs: 12 }}>
                          <Typography fontSize="11px" color="text.secondary" mt={0.5}>
                            {decision === "reject_all"
                              ? <>Balance: <strong>{preview.balanceAfter}</strong> day(s) remaining (unchanged)</>
                              : <>Balance after: <strong>{preview.balanceAfter}</strong> day(s) remaining (was {preview.balanceBefore})</>}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </>
            )}

            {/* ── Audit trail (Phase 5) ──────────────────────────────────────── */}
            {Array.isArray(leave.audit) && leave.audit.length > 0 && (
              <Box>
                <Box onClick={() => setShowAudit((v) => !v)} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
                  <History size={14} color="#67768B" />
                  <Typography fontSize="12px" color="text.secondary" fontWeight={600}>
                    {showAudit ? "Hide" : "Show"} history ({leave.audit.length})
                  </Typography>
                </Box>
                {showAudit && (
                  <Box mt={1} sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 180, overflowY: "auto", pr: 0.5 }}>
                    {leave.audit.slice().reverse().map((a, i) => (
                      <Box key={i} sx={{ borderLeft: "2px solid #F0D9F5", pl: 1.5, py: 0.25 }}>
                        <Typography fontSize="11px" fontWeight={600} color="text.primary">{a.action.replace(/_/g, " ")}</Typography>
                        <Typography fontSize="10px" color="text.secondary">{a.byName || "System"} · {new Date(a.at).toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Divider />

            {/* HR Notes */}
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <CustomInputLabel label={isPending ? "HR Notes / Rejection Reason" : "HR Notes"} />
                {isPending && <Typography fontSize="11px" color="text.secondary">(optional unless rejecting)</Typography>}
              </Box>
              <TextInput
                placeholder={isPending ? "Add a note, or explain the reason if rejecting..." : (leave.hrNotes || "No notes added.")}
                value={hrNotes}
                onChange={(e) => { if (!isPending) return; setHrNotes(e.target.value); if (notesError) setNotesError(""); }}
                inputBgColor="#F5F5F5" fullWidth multiline rows={3}
                InputProps={{ readOnly: !isPending }} error={!!notesError} helperText={notesError}
              />
            </Box>

          </Box>
        </DialogBody>

        {isPending && !isHrLocked && !adminRejectedEscalation && (
          <DialogActionButtons
            onCancel={handleReject}
            onConfirm={handleApprove}
            showCancelBtn
            cancelText="Reject All"
            confirmText={decision === "reject_all" ? "Confirm Reject" : "Confirm"}
            variant="gradient"
            confirmLoading={loading}
          />
        )}
      </DialogContainer>
    </LocalizationProvider>
  );
};

export default LeaveRequestDetailDialog;