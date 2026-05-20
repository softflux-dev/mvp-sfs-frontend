// app/admin/roles/permissionSummary.jsx
import { Box, Typography, Chip } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import { ALL_PAGE_GROUPS } from "./pagesData";

// Color per portal group
const GROUP_COLOR = {
  "Admin":           "#AA2493",
  "HR":              "#022179",
  "Project Manager": "#F59E0B",
  "Employee":        "#10B981",
};

const PermissionSummary = ({ open, onClose, selectedRole }) => {
  if (!selectedRole) return null;

  const pages = selectedRole.pages || [];

  // Group the role's pages by portal
  const grouped = ALL_PAGE_GROUPS.map((group) => ({
    label:  group.label,
    color:  group.color,
    pages:  group.pages.filter((gp) =>
      pages.some((rp) => rp.path === gp.path || rp.id === gp.id)
    ),
  })).filter((g) => g.pages.length > 0);

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="480px" fullWidth>
      <DialogHeader
        title={`${selectedRole.roleName} — Permissions`}
        onClose={onClose}
      />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}>

          {pages.length === 0 ? (
            <Typography fontSize="13px" color="text.secondary" textAlign="center" py={2}>
              No pages assigned to this role.
            </Typography>
          ) : (
            grouped.map((group) => (
              <Box key={group.label}>
                <Typography
                  fontSize="13px"
                  fontWeight={700}
                  mb={1}
                  sx={{ color: group.color }}
                >
                  {group.label}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {group.pages.map((page) => (
                    <Chip
                      key={page.id}
                      label={page.title}
                      size="small"
                      sx={{
                        backgroundColor: "#fff",
                        border:          `1px solid ${group.color}33`,
                        color:           group.color,
                        fontWeight:      500,
                        fontSize:        "12px",
                        borderRadius:    "8px",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))
          )}

          {/* Meta info */}
          <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2 }}>
            <Typography fontSize="12px" color="text.secondary">
              Total pages: <strong>{pages.length}</strong>
              {selectedRole.employeeCount != null && (
                <> &nbsp;·&nbsp; Employees: <strong>{selectedRole.employeeCount}</strong></>
              )}
              {selectedRole.isSystem && (
                <> &nbsp;·&nbsp; <Chip label="System Role" size="small" sx={{ height: 18, fontSize: 10 }} /></>
              )}
            </Typography>
          </Box>

        </Box>
      </DialogBody>
    </DialogContainer>
  );
};

export default PermissionSummary;