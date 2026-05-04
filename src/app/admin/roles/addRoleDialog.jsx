// app/admin/roles/addRoleDialog.jsx
import { useState, useEffect } from "react";
import { Box, Typography, Checkbox, FormControlLabel } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput           from "../../../components/textInput";
import CustomInputLabel    from "../../../components/customInputLabel";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

// ── Permission categories ─────────────────────────────────────────────────────
const PERMISSION_SECTIONS = [
  { key: "projects",   label: "Projects",   perms: ["View", "Create", "Edit", "Delete"]              },
  { key: "tasks",      label: "Tasks",      perms: ["View", "Create", "Assign", "Delete"]             },
  { key: "employees",  label: "Employees",  perms: ["View", "Add", "Edit", "Delete"]                  },
  { key: "attendance", label: "Attendance", perms: ["View", "Approve Leaves", "Generate Reports"]     },
  { key: "payroll",    label: "Payroll",    perms: ["View", "Manage", "Generate Payslips"]            },
  { key: "reports",    label: "Reports",    perms: ["View", "Export"]                                 },
  { key: "settings",   label: "Settings",   perms: ["Access System Settings"]                         },
];

const buildEmptyPerms = () =>
  PERMISSION_SECTIONS.reduce((acc, s) => {
    acc[s.key] = s.perms.reduce((a, p) => { a[p] = false; return a; }, {});
    return acc;
  }, {});

const buildAllPerms = () =>
  PERMISSION_SECTIONS.reduce((acc, s) => {
    acc[s.key] = s.perms.reduce((a, p) => { a[p] = true; return a; }, {});
    return acc;
  }, {});

const EMPTY_FORM = { roleName: "", description: "" };

// ── Gradient checkbox icons ───────────────────────────────────────────────────
const UncheckedIcon = () => (
  <Box sx={{
    width: 18, height: 18,
    borderRadius: "4px",
    border: "1.5px solid #D1D5DB",
    backgroundColor: "#fff",
    flexShrink: 0,
  }} />
);

const CheckedIcon = () => (
  <Box sx={{
    width: 18, height: 18,
    borderRadius: "4px",
    background: "linear-gradient(135deg, #AA2493 0%, #022179 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Box>
);

// ── Permission section card ───────────────────────────────────────────────────
const PermissionSection = ({ section, values, onChange }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "12px", p: 2, mb: 1.5 }}>
    <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={1.5}>
      {section.label}
    </Typography>
    <Box display="flex" flexWrap="wrap" gap={2}>
      {section.perms.map((perm) => (
        <FormControlLabel
          key={perm}
          control={
            <Checkbox
              checked={values[perm] || false}
              onChange={(e) => onChange(section.key, perm, e.target.checked)}
              icon={<UncheckedIcon />}
              checkedIcon={<CheckedIcon />}
              sx={{ p: 0, mr: 0.75 }}
            />
          }
          label={
            <Typography fontSize="13px" fontWeight={400} color="text.primary">
              {perm}
            </Typography>
          }
          sx={{ m: 0, alignItems: "center" }}
        />
      ))}
    </Box>
  </Box>
);

// ── Main dialog ───────────────────────────────────────────────────────────────
const AddRoleDialog = ({ open, onClose, onSave, editingRole = null }) => {
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [permissions, setPermissions] = useState(buildEmptyPerms());
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingRole) {
      setForm({
        roleName:    editingRole.roleName    || "",
        description: editingRole.description || "",
      });
      setPermissions(editingRole.permissions || buildAllPerms());
    } else {
      setForm({ ...EMPTY_FORM });
      setPermissions(buildEmptyPerms());
    }
  }, [editingRole, open]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePermChange = (sectionKey, perm, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [perm]: checked },
    }));
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setPermissions(buildEmptyPerms());
    onClose();
  };

  const handleSave = () => {
    onSave?.({ ...form, permissions });
    setForm({ ...EMPTY_FORM });
    setPermissions(buildEmptyPerms());
    onClose();
    setSuccessOpen(true);
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
        <DialogHeader
          title={editingRole ? "Edit Role" : "Add New Role"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px",
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>

            {/* ── Role Name ──────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Role Name *" />
              <TextInput
                placeholder="Enter Role Name"
                value={form.roleName}
                onChange={set("roleName")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* ── Description ────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput
                placeholder="Enter Description"
                value={form.description}
                onChange={set("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* ── Permissions ────────────────────────────────────────────── */}
            <Box>
              <Typography fontSize="14px" fontWeight={600} color="text.primary" mb={1.5}>
                Permissions
              </Typography>
              {PERMISSION_SECTIONS.map((section) => (
                <PermissionSection
                  key={section.key}
                  section={section}
                  values={permissions[section.key]}
                  onChange={handlePermChange}
                />
              ))}
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Save Role"
          variant="gradient"
        />
      </DialogContainer>

      {/* ── Success popup ─────────────────────────────────────────────────── */}
      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={editingRole ? "Role updated successfully." : "Role added successfully."}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AddRoleDialog;