import { Box, Grid, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../../components";
import CustomButton from "../../../../components/customButton";

const ViewTaskDialog = ({ open, onClose, task = {} }) => {
  if (!task) return null;

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="520px" fullWidth>
      <DialogHeader title="View Details" onClose={onClose} />

      <DialogBody>
       <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3 }}>

        {/* Row 1: Task / Module */}
        <Grid container spacing={2} mb={3}>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Task</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.task || task.title || "-"}
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Module</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.module || "-"}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 2: Deadline / Assignee */}
        <Grid container spacing={2} mb={3}>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Deadline</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.deadline || "-"}
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Assignee</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.assigneeName || task.assignee || "-"}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3: Priority / Status */}
        <Grid container spacing={2}>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Priority</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.priority || "-"}
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.5}>Status</Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {task.status || "-"}
            </Typography>
          </Grid>
        </Grid>

        </Box>
      </DialogBody>

      {/* ── Cancel button ─────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" px={3} pb={3}>
        <CustomButton
          btnLabel="Cancel"
          variant="grayOutlined"
          handlePressBtn={onClose}
        />
      </Box>
    </DialogContainer>
  );
};

export default ViewTaskDialog;