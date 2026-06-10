// src/app/hrPortal/leaves/leaveRequestDetailDialog.jsx 
import { useState, useEffect } from "react";
import { Box, Typography, Avatar, Grid, Chip } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import TextInput           from "../../../components/textInput";
import DialogActionButtons from "../../../components/dialog/dialogAction";

const STATUS_CONFIG = {
  Pending:  { bg: "#FF972F1A", color: "#FF972F" },
  Approved: { bg: "#04C3731A", color: "#04C373" },
  Rejected: { bg: "#FF00001A", color: "#FF0000" },
};

const LeaveRequestDetailDialog = ({
  open,
  onClose,
  leave = {},
  onApprove,
  onReject,
  loading = false,
}) => {
  const isPending = leave.status === "Pending";
  const [hrNotes, setHrNotes] = useState("");

  // Reset notes when dialog opens with a new leave
  useEffect(() => {
    if (open) setHrNotes(leave.hrNotes || "");
  }, [open, leave.id]);

  const statusCfg = STATUS_CONFIG[leave.status] || { bg: "#F5F5F5", color: "#757575" };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
      <DialogHeader title="Leave Request Detail" onClose={onClose} />

      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* ── Employee info ────────────────────────────────────────────── */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 2,
            backgroundColor: "#F5F5F5", borderRadius: "14px", px: 2.5, py: 2,
          }}>
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
                {leave.name || "—"}
              </Typography>
              <Typography fontSize="12px" color="text.secondary">
                {leave.role || "—"}
              </Typography>
              {leave.empId && (
                <Typography fontSize="11px" color="text.secondary">
                  {leave.empId}
                </Typography>
              )}
            </Box>
            {/* Status chip — top right */}
            <Box ml="auto">
              <Chip
                label={leave.status || "Pending"}
                size="small"
                sx={{
                  height: "26px", fontSize: "12px", fontWeight: 600,
                  px: 1, borderRadius: "8px",
                  backgroundColor: statusCfg.bg, color: statusCfg.color,
                }}
              />
            </Box>
          </Box>

          {/* ── Leave details ────────────────────────────────────────────── */}
          <Box sx={{
            border: "1px solid #F0F0F0", borderRadius: "14px",
            backgroundColor: "#fff", px: 2.5, py: 2,
          }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Leave Type</Typography>
                <Typography fontSize="14px" fontWeight={700} color="text.primary">
                  {leave.leaveType || "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Total Days</Typography>
                <Typography fontSize="14px" fontWeight={700} color="text.primary">
                  {leave.days ?? "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>From Date</Typography>
                <Typography fontSize="14px" fontWeight={700} color="text.primary">
                  {leave.fromDate || "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>To Date</Typography>
                <Typography fontSize="14px" fontWeight={700} color="text.primary">
                  {leave.toDate || "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography fontSize="11px" color="text.secondary" mb={0.4}>Submitted On</Typography>
                <Typography fontSize="14px" fontWeight={700} color="text.primary">
                  {leave.submittedDate || "—"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* ── Reason ───────────────────────────────────────────────────── */}
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "14px", p: 2 }}>
            <Typography fontSize="11px" color="text.secondary" mb={0.5}>Reason</Typography>
            <Typography fontSize="13px" color="text.primary" lineHeight={1.6}>
              {leave.reasonFull || leave.reason || "—"}
            </Typography>
          </Box>

          {/* ── HR Notes ─────────────────────────────────────────────────── */}
          {/* Always show notes field — editable if pending, readonly if reviewed */}
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <CustomInputLabel label="HR Notes" />
              {isPending && (
                <Typography fontSize="11px" color="text.secondary">(optional)</Typography>
              )}
            </Box>
            <TextInput
              placeholder={isPending ? "Add notes for the employee..." : "No notes added."}
              value={hrNotes}
              onChange={(e) => isPending && setHrNotes(e.target.value)}
              inputBgColor="#F5F5F5"
              fullWidth
              multiline
              rows={3}
              InputProps={{ readOnly: !isPending }}
            />
          </Box>

        </Box>
      </DialogBody>

      {/* ── Actions — only for pending ────────────────────────────────── */}
      {isPending && (
        <DialogActionButtons
          onCancel={() => { onReject?.(leave, hrNotes); onClose(); }}
          onConfirm={() => { onApprove?.(leave, hrNotes); onClose(); }}
          showCancelBtn
          cancelText="Reject"
          confirmText="Approve"
          variant="gradient"
          confirmLoading={loading}
        />
      )}
    </DialogContainer>
  );
};

export default LeaveRequestDetailDialog;