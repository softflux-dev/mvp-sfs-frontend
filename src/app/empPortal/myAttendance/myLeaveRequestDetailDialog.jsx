// src/app/empPortal/myAttendance/myLeaveRequestDetailDialog.jsx — NEW FILE
// Employee's own read-only view of a leave request. Shows the same detail
// fields HR/Admin see (type, dates, days, reason, balance, HR notes) but
// with no decision controls — employees can't approve/reject/override.

import { Box, Typography, Grid, Chip, Divider } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomInputLabel from "../../../components/customInputLabel";
import TextInput         from "../../../components/textInput";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "#FF972F1A", color: "#FF972F" },
  approved: { label: "Approved", bg: "#04C3731A", color: "#04C373" },
  rejected: { label: "Rejected", bg: "#FF00001A", color: "#FF0000" },
};

const PAYMENT_PREF_CONFIG = {
  paid:   { label: "Paid",   bg: "#04C3731A", color: "#04C373" },
  unpaid: { label: "Unpaid", bg: "#FFF7E6",   color: "#B45309" },
};

// Real, independently-tracked balance buckets (matches useMyLeaveBalance's
// balance.{sick,casual,emergency,maternity} shape). "annual" is a rolled-up
// summary, shown separately below these, not as a 5th equal-weight row.
const REAL_TRACKED_TYPES = { sick: "Sick Leave", casual: "Casual Leave", emergency: "Emergency Leave", maternity: "Maternity Leave" };

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

const MyLeaveRequestDetailDialog = ({ open, onClose, leave = {}, balance = null, balanceLoading = false }) => {
  const statusCfg = STATUS_CONFIG[leave.status] || { label: leave.status || "—", bg: "#F5F5F5", color: "#757575" };
  const leaveTypeKey = leave.leaveTypeRaw || "";
  const isShort = leaveTypeKey === "short";

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="520px" fullWidth>
      <DialogHeader title="Leave Request Detail" onClose={onClose} />

      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Status */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F5F5F5", borderRadius: "14px", px: 2.5, py: 2 }}>
            <Box>
              <Typography fontSize="16px" fontWeight={700} color="text.primary">{leave.leaveType || "—"}</Typography>
              <Typography fontSize="12px" color="text.secondary">Submitted {leave.submittedOn || "—"}</Typography>
            </Box>
            <Chip label={statusCfg.label} size="small" sx={{ height: "26px", fontSize: "12px", fontWeight: 600, px: 1, borderRadius: "8px", backgroundColor: statusCfg.bg, color: statusCfg.color }} />
          </Box>

          {/* Details */}
          <Box sx={{ border: "1px solid #F0F0F0", borderRadius: "14px", backgroundColor: "#fff", px: 2.5, py: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Requested As</Typography>
                <Chip
                  label={(PAYMENT_PREF_CONFIG[leave.paymentPreference] || PAYMENT_PREF_CONFIG.paid).label}
                  size="small"
                  sx={{
                    height: "22px", fontSize: "12px", fontWeight: 700, px: 0.5, borderRadius: "8px",
                    backgroundColor: (PAYMENT_PREF_CONFIG[leave.paymentPreference] || PAYMENT_PREF_CONFIG.paid).bg,
                    color: (PAYMENT_PREF_CONFIG[leave.paymentPreference] || PAYMENT_PREF_CONFIG.paid).color,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>Total Days Requested</Typography><Typography fontSize="14px" fontWeight={700}>{leave.totalDays ?? "—"}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>From Date</Typography><Typography fontSize="14px" fontWeight={700}>{leave.fromDate || "—"}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography fontSize="11px" color="text.secondary" mb={0.4}>To Date</Typography><Typography fontSize="14px" fontWeight={700}>{leave.toDate || "—"}</Typography></Grid>
              {leave.status && leave.status !== "pending" && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <Typography fontSize="11px" color="text.secondary" mb={0.4}>Approved Days</Typography>
                    <Typography fontSize="14px" fontWeight={700} color={leave.status === "rejected" ? "#DC2626" : "#04C373"}>
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

          {/* Leave Balance */}
          <Box sx={{ border: "1px solid #F0F0F0", borderRadius: "14px", p: 2.5 }}>
            <Typography fontSize="13px" fontWeight={700} color="text.primary" mb={0.5}>Leave Balance ({new Date().getFullYear()})</Typography>
            <Typography fontSize="11px" color="text.secondary" mb={1.5}>Your remaining paid balance across leave types.</Typography>

            {balanceLoading && (
              <Typography fontSize="12px" color="text.secondary">Loading balance...</Typography>
            )}

            {!balanceLoading && balance && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {balance.balance?.annual && (
                  <BalanceRow
                    label="Annual (Sick+Casual+Emergency+Maternity)"
                    total={balance.balance.annual.total}
                    used={balance.balance.annual.used}
                    remaining={balance.balance.annual.remaining}
                  />
                )}
                {Object.entries(REAL_TRACKED_TYPES).map(([key, label]) => (
                  balance.balance?.[key] ? (
                    <BalanceRow
                      key={key}
                      label={label}
                      total={balance.balance[key].total}
                      used={balance.balance[key].used}
                      remaining={balance.balance[key].remaining}
                      highlight={key === leaveTypeKey}
                    />
                  ) : null
                ))}
                {isShort && balance.shortLeave && (
                  <BalanceRow
                    label="Short Leave (this month)"
                    total={balance.shortLeave.perMonth}
                    used={balance.shortLeave.used}
                    remaining={balance.shortLeave.remaining}
                    highlight
                  />
                )}
              </Box>
            )}

            {!balanceLoading && !balance && (
              <Typography fontSize="12px" color="text.secondary">Balance unavailable.</Typography>
            )}
          </Box>

          <Divider />

          {/* HR Notes — read only, whatever HR/Admin wrote */}
          <Box>
            <CustomInputLabel label="HR Notes" />
            <TextInput
              placeholder="No notes added."
              value={leave.hrNotes || ""}
              inputBgColor="#F5F5F5" fullWidth multiline rows={3}
              InputProps={{ readOnly: true }}
            />
          </Box>

        </Box>
      </DialogBody>
    </DialogContainer>
  );
};

export default MyLeaveRequestDetailDialog;