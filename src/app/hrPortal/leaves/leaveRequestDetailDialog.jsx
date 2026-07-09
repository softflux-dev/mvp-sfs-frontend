// src/app/hrPortal/leaves/leaveRequestDetailDialog.jsx — 
import { useState, useEffect }                       from "react";
import { Box, Typography, Avatar, Grid, Chip,
         CircularProgress, Divider }                 from "@mui/material";
import { AlertTriangle, CheckCircle }                from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import TextInput           from "../../../components/textInput";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import { hrGetEmployeeLeaveBalanceApi }              from "../../../api/modules/leave";

const STATUS_CONFIG = {
  Pending:  { bg: "#FF972F1A", color: "#FF972F" },
  Approved: { bg: "#04C3731A", color: "#04C373" },
  Rejected: { bg: "#FF00001A", color: "#FF0000" },
};

const TRACKED_TYPES = {
  annual:    "Annual Leave",
  sick:      "Sick Leave",
  casual:    "Casual Leave",
  emergency: "Emergency Leave",
};

/* ── quota bar ────────────────────────────────────────────────────────────── */
const BalanceRow = ({ label, total, used, remaining, highlight }) => {
  const pct      = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const depleted = remaining <= 0;

  return (
    <Box sx={{
      p: 1.5, borderRadius: "10px",
      border: highlight ? "1.5px solid #AA2493" : "1px solid #F0F0F0",
      backgroundColor: highlight ? "#FAF0FF" : "transparent",
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
        <Typography fontSize="12px" fontWeight={highlight ? 700 : 500} color="text.primary">
          {label}
          {highlight && (
            <Typography component="span" fontSize="10px" sx={{
              ml: 0.75, px: 0.75, py: 0.2, borderRadius: "4px",
              backgroundColor: "#AA24931A", color: "#AA2493", fontWeight: 600,
            }}>
              this request
            </Typography>
          )}
        </Typography>
        <Typography fontSize="12px" fontWeight={700} color={depleted ? "#DC2626" : "#04C373"}>
          {remaining} / {total} left
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, backgroundColor: "#F0F0F0", overflow: "hidden" }}>
        <Box sx={{
          height: "100%", width: `${pct}%`, borderRadius: 3,
          backgroundColor: depleted ? "#DC2626" : "#AA2493",
          transition: "width 0.3s ease",
        }} />
      </Box>
      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography fontSize="10px" color="text.secondary">Used: {used}</Typography>
        <Typography fontSize="10px" color="text.secondary">Total: {total}</Typography>
      </Box>
    </Box>
  );
};

/* ── dialog ───────────────────────────────────────────────────────────────── */
const LeaveRequestDetailDialog = ({
  open,
  onClose,
  leave    = {},
  onApprove,
  onReject,
  loading  = false,
}) => {
  const isPending        = leave.status === "Pending";
  const leaveTypeKey     = leave.leaveTypeRaw || "";
  const isTrackedType    = !!TRACKED_TYPES[leaveTypeKey];
  const employeeMongoId  = leave.employeeMongoId || null;

  const [hrNotes,       setHrNotes]       = useState("");
  const [notesError,    setNotesError]    = useState("");  // shown only on reject attempt
  const [balance,       setBalance]       = useState(null);
  const [balanceLoading,setBalanceLoading]= useState(false);
  const [balanceError,  setBalanceError]  = useState("");

  useEffect(() => {
    if (!open) {
      setHrNotes("");
      setNotesError("");
      setBalance(null);
      setBalanceError("");
      return;
    }

    setHrNotes(leave.hrNotes || "");

    if (isPending && isTrackedType && employeeMongoId) {
      setBalanceLoading(true);
      hrGetEmployeeLeaveBalanceApi(employeeMongoId)
        .then((res) => {
          if (res?.status === 200 || res?.status === 201) {
            setBalance(res.data.data.balance);
          } else {
            setBalanceError("Could not load leave balance.");
          }
        })
        .catch(() => setBalanceError("Could not load leave balance."))
        .finally(() => setBalanceLoading(false));
    }
  }, [open, employeeMongoId]);

  // Quota state
  const requestedBalance  = balance?.[leaveTypeKey] || null;
  const willBeUnpaid      = isTrackedType && requestedBalance && requestedBalance.remaining <= 0;
  const willBePartialUnpaid =
    isTrackedType && requestedBalance &&
    requestedBalance.remaining > 0 &&
    (leave.days || 0) > requestedBalance.remaining;

  const statusCfg = STATUS_CONFIG[leave.status] || { bg: "#F5F5F5", color: "#757575" };

  const handleApprove = () => {
    setNotesError("");
    onApprove?.(leave, hrNotes);
  };

  const handleReject = () => {
    if (!hrNotes.trim()) {
      setNotesError("Please provide a reason for rejection.");
      return;
    }
    setNotesError("");
    onReject?.(leave, hrNotes);
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="520px" fullWidth>
      <DialogHeader title="Leave Request Detail" onClose={onClose} />

      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* ── Employee ───────────────────────────────────────────────── */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 2,
            backgroundColor: "#F5F5F5", borderRadius: "14px", px: 2.5, py: 2,
          }}>
            <Avatar src={leave.avatar} sx={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #AA2493, #022179)",
              fontSize: "20px", fontWeight: 700,
            }}>
              {leave.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontSize="16px" fontWeight={700} color="text.primary">
                {leave.name || "—"}
              </Typography>
              <Typography fontSize="12px" color="text.secondary">{leave.role || "—"}</Typography>
              {leave.empId && (
                <Typography fontSize="11px" color="text.secondary">{leave.empId}</Typography>
              )}
            </Box>
            <Box ml="auto">
              <Chip label={leave.status || "Pending"} size="small" sx={{
                height: "26px", fontSize: "12px", fontWeight: 600,
                px: 1, borderRadius: "8px",
                backgroundColor: statusCfg.bg, color: statusCfg.color,
              }} />
            </Box>
          </Box>

          {/* ── Details ────────────────────────────────────────────────── */}
          <Box sx={{
            border: "1px solid #F0F0F0", borderRadius: "14px",
            backgroundColor: "#fff", px: 2.5, py: 2,
          }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Leave Type</Typography>
                <Typography fontSize="14px" fontWeight={700}>{leave.leaveType || "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Total Days</Typography>
                <Typography fontSize="14px" fontWeight={700}>{leave.days ?? "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>From Date</Typography>
                <Typography fontSize="14px" fontWeight={700}>{leave.fromDate || "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>To Date</Typography>
                <Typography fontSize="14px" fontWeight={700}>{leave.toDate || "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Submitted On</Typography>
                <Typography fontSize="14px" fontWeight={700}>{leave.submittedDate || "—"}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* ── Reason ─────────────────────────────────────────────────── */}
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "14px", p: 2 }}>
            <Typography fontSize="11px" color="text.secondary" mb={0.5}>Reason</Typography>
            <Typography fontSize="13px" color="text.primary" lineHeight={1.6}>
              {leave.reasonFull || leave.reason || "—"}
            </Typography>
          </Box>

          {/* ── Leave Balance ───────────────────────────────────────────── */}
          {isPending && isTrackedType && (
            <Box sx={{ border: "1px solid #F0F0F0", borderRadius: "14px", p: 2.5 }}>
              <Typography fontSize="13px" fontWeight={700} color="text.primary" mb={1.5}>
                Leave Balance ({new Date().getFullYear()})
              </Typography>

              {balanceLoading && (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={20} sx={{ color: "#AA2493" }} />
                </Box>
              )}

              {!balanceLoading && balanceError && (
                <Typography fontSize="12px" color="text.secondary">{balanceError}</Typography>
              )}

              {!balanceLoading && balance && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {Object.entries(TRACKED_TYPES).map(([key, label]) =>
                    balance[key] ? (
                      <BalanceRow
                        key={key}
                        label={label}
                        total={balance[key].total}
                        used={balance[key].used}
                        remaining={balance[key].remaining}
                        highlight={key === leaveTypeKey}
                      />
                    ) : null
                  )}
                </Box>
              )}

              {/* Quota warnings / confirmation */}
              {!balanceLoading && willBeUnpaid && (
                <Box mt={1.5} sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.25,
                  backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3",
                  borderRadius: "10px", px: 2, py: 1.5,
                }}>
                  <AlertTriangle size={15} color="#B45309" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography fontSize="12px" fontWeight={700} color="#B45309">
                      No {TRACKED_TYPES[leaveTypeKey]} quota remaining
                    </Typography>
                    <Typography fontSize="11px" color="#92400E" mt={0.4} lineHeight={1.5}>
                      If approved, this leave will be marked as <strong>unpaid</strong> and
                      counted as absent in attendance.
                    </Typography>
                  </Box>
                </Box>
              )}

              {!balanceLoading && willBePartialUnpaid && (
                <Box mt={1.5} sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.25,
                  backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3",
                  borderRadius: "10px", px: 2, py: 1.5,
                }}>
                  <AlertTriangle size={15} color="#B45309" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography fontSize="12px" fontWeight={700} color="#B45309">
                      Only {requestedBalance.remaining} of {leave.days} day(s) covered
                    </Typography>
                    <Typography fontSize="11px" color="#92400E" mt={0.4} lineHeight={1.5}>
                      <strong>{leave.days - requestedBalance.remaining}</strong> day(s) will be
                      treated as <strong>unpaid</strong>.
                    </Typography>
                  </Box>
                </Box>
              )}

              {!balanceLoading && balance && !willBeUnpaid && !willBePartialUnpaid && (
                <Box mt={1.5} sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0",
                  borderRadius: "10px", px: 2, py: 1.25,
                }}>
                  <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0 }} />
                  <Typography fontSize="12px" color="#15803D" fontWeight={500}>
                    Sufficient quota — this leave will be fully paid.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Divider />

          {/* ── HR Notes / Rejection Reason ────────────────────────────── */}
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <CustomInputLabel label={isPending ? "HR Notes / Rejection Reason" : "HR Notes"} />
              {isPending && (
                <Typography fontSize="11px" color="text.secondary">
                  (optional for approval · required for rejection)
                </Typography>
              )}
            </Box>
            <TextInput
              placeholder={
                isPending
                  ? "Add a note, or explain the reason if rejecting..."
                  : (leave.hrNotes || "No notes added.")
              }
              value={hrNotes}
              onChange={(e) => {
                if (!isPending) return;
                setHrNotes(e.target.value);
                if (notesError) setNotesError("");
              }}
              inputBgColor="#F5F5F5"
              fullWidth multiline rows={3}
              InputProps={{ readOnly: !isPending }}
              error={!!notesError}
              helperText={notesError}
            />
          </Box>

          {/* Show unpaid badge on already-approved unpaid leaves */}
          {!isPending && leave.status === "Approved" && leave.isUnpaid && (
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1,
              backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3",
              borderRadius: "10px", px: 2, py: 1.25,
            }}>
              <AlertTriangle size={14} color="#B45309" style={{ flexShrink: 0 }} />
              <Typography fontSize="12px" color="#B45309" fontWeight={500}>
                Approved as unpaid — no quota was available at the time of approval.
              </Typography>
            </Box>
          )}

        </Box>
      </DialogBody>

      {isPending && (
        <DialogActionButtons
          onCancel={handleReject}
          onConfirm={handleApprove}
          showCancelBtn
          cancelText="Reject"
          confirmText={willBeUnpaid ? "Approve as Unpaid" : "Approve"}
          variant="gradient"
          confirmLoading={loading}
        />
      )}
    </DialogContainer>
  );
};

export default LeaveRequestDetailDialog;