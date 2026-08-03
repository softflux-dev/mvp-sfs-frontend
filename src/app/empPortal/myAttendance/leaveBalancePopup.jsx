// src/app/empPortal/myAttendance/leaveBalancePopup.jsx — Phase 1 (NEW)
// Popup summary opened by the "Leave Balance" button (spec §2.1).

import { Box, Typography, CircularProgress, Divider } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";

// ── Real, independently-consumable types only. "Annual" is shown separately
// below as a single highlighted summary row (it's the sum of these four, not
// its own bucket) — see the FIX note in the component. ──────────────────────
const TYPE_LABELS = {
  sick:      "Sick Leave",
  casual:    "Casual Leave",
  emergency: "Emergency Leave",
  maternity: "Maternity Leave",
};

// ── Single balance row with a usage bar ─────────────────────────────────────
const BalanceRow = ({ label, total, used, remaining, pending, suffix = "days", highlight = false }) => {
  const pct      = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const depleted = remaining <= 0 && total > 0;

  return (
    <Box sx={{
      p: 1.5, borderRadius: "10px",
      border: highlight ? "1.5px solid #AA2493" : "1px solid #F0F0F0",
      backgroundColor: highlight ? "#FAF0FF" : "transparent",
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
        <Typography fontSize="12px" fontWeight={highlight ? 700 : 600} color="text.primary">{label}</Typography>
        <Typography fontSize="12px" fontWeight={700} color={depleted ? "#DC2626" : "#04C373"}>
          {remaining} / {total} {suffix} left
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, backgroundColor: "#F0F0F0", overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 3, backgroundColor: depleted ? "#DC2626" : "#AA2493", transition: "width 0.3s ease" }} />
      </Box>
      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography fontSize="10px" color="text.secondary">Used: {used}</Typography>
        {pending > 0 && <Typography fontSize="10px" color="#B45309">Pending: {pending}</Typography>}
        <Typography fontSize="10px" color="text.secondary">Total: {total}</Typography>
      </Box>
    </Box>
  );
};

const LeaveBalancePopup = ({ open, onClose, balance, loading }) => {
  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="460px" fullWidth>
      <DialogHeader title={`Leave Balance ${balance?.year ? `(${balance.year})` : ""}`} onClose={onClose} />
      <DialogBody>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} sx={{ color: "#AA2493" }} />
          </Box>
        )}

        {!loading && !balance && (
          <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
            Balance information is not available right now.
          </Typography>
        )}

        {!loading && balance && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {/* ── Annual — ONE highlighted summary row, not its own bucket.
                It's the sum of Sick+Casual+Emergency+Maternity below. ──────── */}
            {balance.balance?.annual && (
              <BalanceRow
                label="Remaining Paid Leave (Annual)"
                total={balance.balance.annual.total}
                used={balance.balance.annual.used}
                remaining={balance.balance.annual.remaining}
                pending={balance.balance.annual.pending}
                highlight
              />
            )}

            {balance.balance?.annual && <Divider sx={{ my: 0.25 }} />}

            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const b = balance.balance?.[key];
              if (!b) return null;
              return (
                <BalanceRow
                  key={key}
                  label={label}
                  total={b.total}
                  used={b.used}
                  remaining={b.remaining}
                  pending={b.pending}
                />
              );
            })}

            {balance.shortLeave && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <BalanceRow
                  label={`Short Leave (this month · ${balance.shortLeave.month})`}
                  total={balance.shortLeave.perMonth}
                  used={balance.shortLeave.used}
                  remaining={balance.shortLeave.remaining}
                  pending={balance.shortLeave.pending}
                />
              </>
            )}

            {balance.unpaidTaken > 0 && (
              <Box sx={{ mt: 0.5, px: 1.5, py: 1, borderRadius: "10px", backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3" }}>
                <Typography fontSize="11px" color="#B45309">
                  Unpaid leave taken this year: <strong>{balance.unpaidTaken} day(s)</strong>. Unpaid days do not reduce your paid balance.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogBody>
    </DialogContainer>
  );
};

export default LeaveBalancePopup;