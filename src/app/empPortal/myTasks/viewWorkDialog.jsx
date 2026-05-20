import { Box, Typography, IconButton, Divider, CircularProgress } from "@mui/material";
import { Link } from "lucide-react";

import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import AttachmentCard      from "../../../components/cards/attachmentCard";
import { downloadSubmissionUrl } from "../../../api/modules/task";

const ViewWorkDialog = ({ open, onClose, submissions = [], loading = false, taskId }) => {
  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="560px" fullWidth>
      <DialogHeader title="All Submitted Work" onClose={onClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} sx={{ color: "#AA2493" }} />
            </Box>
          )}

          {/* Empty */}
          {!loading && submissions.length === 0 && (
            <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
              No submissions yet.
            </Typography>
          )}

          {/* Submission list */}
        {!loading && submissions.map((sub, idx) => {
          const submitterName = sub.submittedBy?.fullName || "Unknown";
          const submittedDate = sub.createdAt
            ? new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "";

          return (
            <Box key={sub._id || idx}>
              {idx > 0 && <Divider sx={{ borderColor: "#E0E0E0", my: 2.5 }} />}

              {/* Submitter + date */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography fontSize="13px" fontWeight={600} color="text.primary">
                  {submitterName}
                </Typography>
                <Typography fontSize="11px" color="text.secondary">{submittedDate}</Typography>
              </Box>

              {/* Title */}
              {sub.title && (
                <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={0.8}>
                  {sub.title}
                </Typography>
              )}

              {/* Description */}
              {sub.description && (
                <Typography fontSize="13px" color="text.secondary" lineHeight={1.7} mb={1.5}>
                  {sub.description}
                </Typography>
              )}

              {/* Link */}
              {sub.link && (
                <Box mb={1.5}>
                  <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={0.8}>
                    Link
                  </Typography>
                  <Box sx={{
                    backgroundColor: "#fff", borderRadius: "12px",
                    px: 2, py: 1.2, display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 1,
                  }}>
                    <Typography
                      fontSize="13px" color="text.secondary" noWrap
                      sx={{ flex: 1, cursor: "pointer", "&:hover": { color: "#AA2493" } }}
                      onClick={() => window.open(sub.link, "_blank")}
                    >
                      {sub.link}
                    </Typography>
                    <IconButton size="small" onClick={() => window.open(sub.link, "_blank")}
                      sx={{ color: "#67768B", flexShrink: 0 }}>
                      <Link size={16} />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* File */}
              {sub.fileName && (
                <AttachmentCard
                  fileName={sub.fileName}
                  fileSize={sub.fileSize}
                  bgColor="#fff"
                  onDownload={() => window.open(downloadSubmissionUrl(taskId, sub._id), "_blank")}
                />
              )}

              {/* Note */}
              {sub.note && (
                <Typography fontSize="12px" color="text.secondary" mt={1} fontStyle="italic">
                  Note: {sub.note}
                </Typography>
              )}
            </Box>
          );
        })}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={onClose}
        showCancelBtn
        cancelText="Close"
      />
    </DialogContainer>
  );
};

export default ViewWorkDialog;