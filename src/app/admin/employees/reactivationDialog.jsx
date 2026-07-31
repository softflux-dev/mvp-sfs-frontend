// src/app/admin/employees/reactivationDialog.jsx — (Employee Deactivation/Reactivation feature)
import { useState, useEffect } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody, CustomSelect } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import { useEmployeeDeactivation } from "../../../hooks/employeeDeactivation";
import { useDepartment } from "../../../hooks/department";
import { useRole }       from "../../../hooks/role";

const ReactivationDialog = ({ open, onClose, employee, onReactivated }) => {
  const { actionLoading, error, reactivate } = useEmployeeDeactivation();
  const { departments, fetchDepartments } = useDepartment();
  const { roles, fetchRoles } = useRole();

  const [department, setDepartment] = useState("");
  const [role, setRole]             = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchDepartments({ limit: 100 });
    fetchRoles({ limit: 100 });
    setDepartment(employee?.departmentId || "");
    setRole(employee?.roleId || "");
  }, [open, employee]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = async () => {
    const result = await reactivate(employee.id, { role: role || null, department: department || null });
    if (result.success) {
      setSuccessMsg(result.message || "Employee reactivated successfully.");
      setShowSuccess(true);
      onReactivated?.();
      setTimeout(() => onClose?.(), 1200);
    }
  };

  return (
    <>
      <DialogContainer open={open} onClose={onClose} maxWidth="440px" fullWidth>
        <DialogHeader title={`Reactivate ${employee?.name || "Employee"}`} onClose={onClose} />
        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography fontSize="13px" color="text.secondary">
              The account will be restored with the same role and permissions unless you change them below.
              A brand-new password will be generated and emailed — the previous password will no longer work.
            </Typography>

            <Box>
              <CustomInputLabel label="Department" />
              <CustomSelect value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth height="45px" inputBgColor="#F5F5F5">
                <MenuItem value="">Keep current</MenuItem>
                {departments.map((d) => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
              </CustomSelect>
            </Box>

            <Box>
              <CustomInputLabel label="Role" />
              <CustomSelect value={role} onChange={(e) => setRole(e.target.value)} fullWidth height="45px" inputBgColor="#F5F5F5">
                <MenuItem value="">Keep current</MenuItem>
                {roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.roleName}</MenuItem>)}
              </CustomSelect>
            </Box>

            {error && <Typography fontSize="12px" color="error">{error}</Typography>}
          </Box>
        </DialogBody>
        <DialogActionButtons
          onCancel={onClose}
          onConfirm={handleConfirm}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Confirm Reactivation"
          variant="gradient"
          confirmLoading={actionLoading}
        />
      </DialogContainer>

      <SuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} autoClose autoCloseDelay={2000} />
    </>
  );
};

export default ReactivationDialog;