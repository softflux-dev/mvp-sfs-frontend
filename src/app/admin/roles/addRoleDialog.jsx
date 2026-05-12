// app/admin/roles/addRoleDialog.jsx
import { useState, useEffect } from "react";
import { Box, MenuItem } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput           from "../../../components/textInput";
import CustomInputLabel    from "../../../components/customInputLabel";
import CustomSelect        from "../../../components/customSelect";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import SelectPagesDialog   from "./selectPagesDialog";

// ── Replace with real API data or import from a shared constant ───────────────
const DEPARTMENTS = [
  { value: "engineering",     label: "Engineering"     },
  { value: "human_resources", label: "Human Resources" },
  { value: "finance",         label: "Finance"         },
  { value: "product",         label: "Product"         },
  { value: "marketing",       label: "Marketing"       },
];

const EMPTY_FORM = { roleName: "", description: "", department: "" };

// ── Main dialog ───────────────────────────────────────────────────────────────
const AddRoleDialog = ({ open, onClose, onSave, editingRole = null }) => {
  const [form,            setForm]            = useState({ ...EMPTY_FORM });
  const [selectPagesOpen, setSelectPagesOpen] = useState(false);
  const [successOpen,     setSuccessOpen]     = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingRole) {
      setForm({
        roleName:    editingRole.roleName    || "",
        description: editingRole.description || "",
        department:  editingRole.department  || "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [editingRole, open]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    onClose();
  };

  const isFormValid = form.roleName.trim() !== "" && form.description.trim() !== "";

  const handleNext = () => setSelectPagesOpen(true);

  const handleSaveSuccess = (pages) => {
    onSave?.({ ...form, pages });
    setForm({ ...EMPTY_FORM });
    setSelectPagesOpen(false);
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

            {/* ── Department ─────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Department" />
              <CustomSelect
                value={form.department}
                onChange={set("department")}
                fullWidth
                inputBgColor="#fff"
                placeholder="Select Department"
              >
                <MenuItem value="">Select Department</MenuItem>
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </MenuItem>
                ))}
              </CustomSelect>
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

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleNext}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Next"
          isConfirmBtnDisable={!isFormValid}
        />
      </DialogContainer>

      {/* ── Page selection dialog ──────────────────────────────────────────── */}
      <SelectPagesDialog
        open={selectPagesOpen}
        onClose={() => setSelectPagesOpen(false)}
        formData={form}
        editingRole={editingRole}
        onSaveSuccess={handleSaveSuccess}
      />

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