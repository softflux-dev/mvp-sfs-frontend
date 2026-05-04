// hrPortal/leaves/leaveRequestDetailDialog.jsx
import { useState } from "react";
import { Box, Typography, Avatar, Grid } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import TextInput           from "../../../components/textInput";
import DialogActionButtons from "../../../components/dialog/dialogAction";

const LeaveRequestDetailDialog = ({ open, onClose, leave = {}, onApprove, onReject }) => {
  const isPending = leave.status === "Pending";
  const [hrNotes, setHrNotes] = useState("");

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
      <DialogHeader title="Leave Request Detail" onClose={onClose} />

      <DialogBody>
        <Box sx={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "16px",
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}>

        {/* ── Employee info ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "#F5F5F5",
            borderRadius: "14px",
            px: 2.5, py: 2,
            mb: 2.5,
          }}
        >
          <Avatar
            src={leave.avatar}
            sx={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #AA2493, #022179)",
              fontSize: "20px", fontWeight: 700,
            }}
          >
            {leave.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontSize="16px" fontWeight={700} color="text.primary">
              {leave.name || "Sarah Johnson"}
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              {leave.designation || "UI Designer"}
            </Typography>
          </Box>
        </Box>

        {/* ── Leave details card ────────────────────────────────────────── */}
        <Box
          sx={{
            border: "1px solid #F0F0F0",
            borderRadius: "14px",
            backgroundColor: "#fff",
            px: 2.5, py: 2.5,
            mb: 2.5,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                Leave Type
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {leave.leaveType || "Sick Leave"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                Total Days
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {leave.days ?? 3}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                From
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {leave.fromDate || "2026-03-22"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                To
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {leave.toDate || "2026-03-22"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography fontSize="11px" color="text.secondary" mb={0.4}>
                Branch
              </Typography>
              <Typography fontSize="14px" fontWeight={700} color="text.primary">
                {leave.submittedDate || "2026-03-16"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* ── Reason ───────────────────────────────────────────────────── */}
        <Box mb={2}>
          <CustomInputLabel label="Reason" />
          <TextInput
            value={leave.reason || "Doctor appointment scheduled"}
            inputBgColor="#fff"
            fullWidth
            readonly
          />
        </Box>

        {/* ── HR Notes — only for pending ──────────────────────────────── */}
        {isPending && (
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <CustomInputLabel label="HR Notes" />
              <Typography fontSize="11px" color="text.secondary">
                (optional)
              </Typography>
            </Box>
            <TextInput
              placeholder="Add notes..."
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              inputBgColor="#fff"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        )}

        </Box>

      </DialogBody>

      {/* ── Action buttons — only for pending ────────────────────────── */}
      {isPending && (
        <DialogActionButtons
          onCancel={() => { onReject?.(leave); onClose(); }}
          onConfirm={() => { onApprove?.(leave); onClose(); }}
          showCancelBtn
          cancelText="Reject"
          confirmText="Approve"
          variant="gradient"
        />
      )}

    </DialogContainer>
  );
};

export default LeaveRequestDetailDialog;