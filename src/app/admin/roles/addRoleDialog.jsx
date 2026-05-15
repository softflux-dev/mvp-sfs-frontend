import { useState, useEffect } from "react";
import { Box, CircularProgress, MenuItem, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput           from "../../../components/textInput";
import CustomInputLabel    from "../../../components/customInputLabel";
import CustomSelect        from "../../../components/customSelect";
import SelectPagesDialog   from "./selectPagesDialog";
import { useDepartment }   from "../../../hooks/department";   

const EMPTY_FORM = { roleName: "", description: "", department: "" };

const AddRoleDialog = ({
  open,
  onClose,
  onSave,
  editingRole = null,
  loading     = false,
  apiError    = "",
}) => {
  const { departments, fetchDepartments } = useDepartment();

  const [form,            setForm]            = useState({ ...EMPTY_FORM });
  const [selectPagesOpen, setSelectPagesOpen] = useState(false);

  // fetch departments when dialog opens
  useEffect(() => {
    if (open) fetchDepartments({ limit: 100 });
  }, [open]);

  // sync form with editingRole
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

  const isFormValid = form.roleName.trim() !== "";

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setSelectPagesOpen(false);
    onClose();
  };

  // step 1: open page selector
  const handleNext = () => setSelectPagesOpen(true);

  // step 2: page selector calls this with selected pages
  const handlePagesSelected = (pages) => {
    setSelectPagesOpen(false);
    onSave?.({ formData: form, pages });   // ← pass both to parent
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

            {/* API error */}
            {apiError && (
              <Box px={1.5} py={1}
                sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
              >
                <Typography fontSize={13} color="error">{apiError}</Typography>
              </Box>
            )}

            {/* Role Name */}
            <Box>
              <CustomInputLabel label="Role Name *" />
              <TextInput
                placeholder="Enter Role Name"
                value={form.roleName}
                onChange={set("roleName")}
                inputBgColor="#fff"
                fullWidth
                disabled={editingRole?.isSystem}  // system roles: name locked
              />
            </Box>

            {/* Department */}
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
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Description */}
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
                disabled={editingRole?.isSystem}  // system roles: desc locked
              />
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleNext}
          showCancelBtn
          cancelText="Cancel"
          confirmText={
            loading
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : "Next"
          }
          isConfirmBtnDisable={!isFormValid || loading}
        />
      </DialogContainer>

      {/* Page selector — step 2 */}
      <SelectPagesDialog
        open={selectPagesOpen}
        onClose={() => setSelectPagesOpen(false)}
        formData={form}
        editingRole={editingRole}
        onSaveSuccess={handlePagesSelected}
        loading={loading}
      />
    </>
  );
};

export default AddRoleDialog;