// app/admin/roles/permissionSummary.jsx
import { Box, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";

const PermissionSummary = ({ open, onClose, selectedRole }) => {
  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="600px">
      <DialogHeader
        title="Permission Summary"
        secondaryHeading={selectedRole?.roleName}
        onClose={onClose}
      />
      <DialogBody>
        <Box bgcolor="primary.lightGray" p={2} borderRadius="10px">
          {selectedRole?.pages?.length > 0 ? (
            selectedRole.pages.map((page, index) => (
              <Box
                key={index}
                bgcolor="secondary.contrastText"
                p={2}
                borderRadius="10px"
                mt={index === 0 ? 0 : 2}
              >
                <Typography color="text.color" fontSize="16px" fontWeight={600}>
                  {page.title}
                </Typography>
              </Box>
            ))
          ) : (
            <Box
              bgcolor="secondary.contrastText"
              p={2}
              borderRadius="10px"
              textAlign="center"
            >
              <Typography color="text.secondary" fontSize="14px">
                No pages assigned to this role.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogBody>
      <DialogActionButtons
        onCancel={onClose}
        cancelText="Close"
        showConfirmBtn={false}
      />
    </DialogContainer>
  );
};

export default PermissionSummary;