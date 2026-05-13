import { Box, Typography, IconButton, Divider } from "@mui/material";
import { Link } from "lucide-react";

import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import AttachmentCard      from "../../../components/cards/attachmentCard";

// Mock submitted work data
const MOCK_SUBMITTED_WORK = {
  title:       "Design CRM dashboard wireframes",
  description: "When tapping the login button on iOS Safari, nothing happens. No network request is fired. When tapping the login button on iOS Safari, nothing happens. No network request is fired. When tapping the login button on iOS Safari, nothing happens. No network request is fired.",
  link:        "https://github.com/company/client-portal/pull/42",
  attachments: [
    { id: 1, fileName: "wireframe-v2.fig", fileSize: "20 MB" },
    { id: 2, fileName: "wireframe-v2.fig", fileSize: "20 MB" },
  ],
};

const ViewWorkDialog = ({ open, onClose, work = MOCK_SUBMITTED_WORK }) => {
  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="560px" fullWidth>
      <DialogHeader title="View Work" onClose={onClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>

          {/* Title + Description */}
          <Box pb={2.5}>
            <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={1}>
              {work.title}
            </Typography>
            <Typography fontSize="13px" color="text.secondary" lineHeight={1.7}>
              {work.description}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "#E0E0E0", mb: 2.5 }} />

          {/* Link */}
          {work.link && (
            <>
              <Box pb={2.5}>
                <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={1}>
                  Link
                </Typography>
                <Box sx={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  px: 2, py: 1.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}>
                  <Typography
                    fontSize="13px" color="text.secondary" noWrap
                    sx={{ flex: 1, cursor: "pointer", "&:hover": { color: "#AA2493" } }}
                    onClick={() => window.open(work.link, "_blank")}
                  >
                    {work.link}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => window.open(work.link, "_blank")}
                    sx={{ color: "#67768B", flexShrink: 0 }}
                  >
                    <Link size={16} />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#E0E0E0", mb: 2.5 }} />
            </>
          )}

          {/* Attachments */}
          {work.attachments?.length > 0 && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              {work.attachments.map((att) => (
                <AttachmentCard
                  key={att.id}
                  fileName={att.fileName}
                  fileSize={att.fileSize}
                   bgColor="#fff"  
                  onDownload={() => console.log("Download:", att.fileName)}
                />
              ))}
            </Box>
          )}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={onClose}
        showCancelBtn
        cancelText="Cancel"
        // no confirm button — view only
      />
    </DialogContainer>
  );
};

export default ViewWorkDialog;