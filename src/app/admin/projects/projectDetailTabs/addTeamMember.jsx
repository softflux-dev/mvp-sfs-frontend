import { useState, useEffect } from "react";
import {
  Box, MenuItem, Typography,
  Avatar, Checkbox, CircularProgress, Chip,
} from "@mui/material";

import {
  DialogContainer, DialogHeader, DialogBody,
  CustomSelect,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";

import { getDepartmentsApi } from "../../../../api/modules/department";
import { getEmployeesApi }   from "../../../../api/modules/employee";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: "14px", mt: 0.5,
      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
      maxHeight: 300,
    },
  },
};

const AddTeamMember = ({
  open,
  onClose,
  onSave,
  loading  = false,
  apiError = "",
}) => {
  const [departments,    setDepartments]    = useState([]);
  const [selectedDept,   setSelectedDept]   = useState("");
  const [deptEmployees,  setDeptEmployees]  = useState([]);
  const [deptEmpLoading, setDeptEmpLoading] = useState(false);

  // ── Master selection: { _id, fullName, avatar, designation, email } ───────
  // Accumulates across all departments
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [errors, setErrors] = useState({});

  // ── Fetch departments on open ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    getDepartmentsApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setDepartments(res.data.data.departments || []);
      }
    });
  }, [open]);

  // ── Fetch employees when dept changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedDept) { setDeptEmployees([]); return; }
    setDeptEmpLoading(true);
    getEmployeesApi({ department: selectedDept, limit: 100, status: "active" })
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setDeptEmployees(res.data.data.employees || []);
        } else {
          setDeptEmployees([]);
        }
      })
      .finally(() => setDeptEmpLoading(false));
  }, [selectedDept]);

  // ── Derived: ids of currently selected members ────────────────────────────
  const selectedIds = selectedMembers.map((m) => m._id);

  // ── Derived: which of the current dept's employees are selected ───────────
  const currentDeptSelectedIds = deptEmployees
    .filter((e) => selectedIds.includes(e._id))
    .map((e) => e._id);

  // ── Toggle a single employee in/out of master selection ───────────────────
  const handleToggleEmployee = (emp) => {
    setSelectedMembers((prev) => {
      const already = prev.find((m) => m._id === emp._id);
      if (already) return prev.filter((m) => m._id !== emp._id);
      return [...prev, {
        _id:         emp._id,
        fullName:    emp.fullName,
        avatar:      emp.avatar      || "",
        designation: emp.designation || "",
        email:       emp.email       || "",
      }];
    });
    if (errors.employees) setErrors((prev) => ({ ...prev, employees: "" }));
  };

  // ── Remove a chip from the selected summary ───────────────────────────────
  const handleRemoveMember = (id) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== id));
  };

  // ── Reset on close ────────────────────────────────────────────────────────
  const handleClose = () => {
    setSelectedDept("");
    setDeptEmployees([]);
    setSelectedMembers([]);
    setErrors({});
    onClose?.();
  };

  // ── Validate + submit ─────────────────────────────────────────────────────
  const handleSave = () => {
    const e = {};
    if (!selectedDept && selectedMembers.length === 0)
      e.department = "Please select a department";
    if (selectedMembers.length === 0)
      e.employees = "Please select at least one member";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave?.(selectedIds);
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="500px" fullWidth>
      <DialogHeader title="Add Team Members" onClose={handleClose} />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3,
          display: "flex", flexDirection: "column", gap: 2.5,
        }}>

          {/* API error */}
          {apiError && (
            <Box px={1.5} py={1}
              sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
            >
              <Typography fontSize={13} color="error">{apiError}</Typography>
            </Box>
          )}

          {/* ── Selected members summary chips ──────────────────────────── */}
          {selectedMembers.length > 0 && (
            <Box>
              <CustomInputLabel label={`Selected Members (${selectedMembers.length})`} />
              <Box
                sx={{
                  display: "flex", flexWrap: "wrap", gap: 1,
                  backgroundColor: "#fff", borderRadius: "10px",
                  border: "1px solid #E5E7EB", p: 1.5, minHeight: 48,
                }}
              >
                {selectedMembers.map((m) => (
                  <Chip
                    key={m._id}
                    avatar={
                      <Avatar src={m.avatar}
                        sx={{
                          background: "linear-gradient(135deg, #AA2493, #022179)",
                          fontSize: "9px", fontWeight: 700, color: "#fff",
                        }}
                      >{getInitials(m.fullName)}</Avatar>
                    }
                    label={m.fullName}
                    onDelete={() => handleRemoveMember(m._id)}
                    size="small"
                    sx={{
                      backgroundColor: "#F3E8FB",
                      color: "#AA2493",
                      fontWeight: 500,
                      fontSize: "12px",
                      "& .MuiChip-deleteIcon": { color: "#AA2493", "&:hover": { color: "#7a1a6b" } },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ── Department selector ─────────────────────────────────────── */}
          <Box>
            <CustomInputLabel label="Select Department *" />
            <CustomSelect
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                if (errors.department) setErrors((prev) => ({ ...prev, department: "" }));
              }}
              fullWidth height="45px" inputBgColor="#fff" displayEmpty
              renderValue={(v) =>
                departments.find((d) => d._id === v)?.name || (
                  <Typography fontSize={13} color="text.secondary">Select Department</Typography>
                )
              }
            >
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Typography fontSize="13px">{d.name}</Typography>
                    {/* show count badge if any employees from this dept are selected */}
                    {(() => {
                      const count = selectedMembers.filter((m) =>
                        deptEmployees.some((e) => e._id === m._id) && selectedDept === d._id
                          ? true
                          : false
                      ).length;
                      // We don't have per-dept employee lists cached, so just show a dot
                      // if dept was previously visited — handled below via chip summary
                      return null;
                    })()}
                  </Box>
                </MenuItem>
              ))}
            </CustomSelect>
            {errors.department && (
              <Typography fontSize="12px" color="error" mt={0.5}>{errors.department}</Typography>
            )}
          </Box>

          {/* ── Employee list for selected dept ─────────────────────────── */}
          {selectedDept && (
            <Box>
              <CustomInputLabel label="Team Members" />

              {deptEmpLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={22} sx={{ color: "#AA2493" }} />
                </Box>
              ) : deptEmployees.length === 0 ? (
                <Box px={1.5} py={1.5}
                  sx={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #E5E7EB" }}
                >
                  <Typography fontSize={13} color="text.secondary">
                    No active employees found in this department.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#fff", borderRadius: "10px",
                    border: "1px solid #E5E7EB", overflow: "hidden",
                  }}
                >
                  {deptEmployees.map((emp, index) => {
                    const isSelected = selectedIds.includes(emp._id);
                    return (
                      <Box
                        key={emp._id}
                        onClick={() => handleToggleEmployee(emp)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.5,
                          px: 1.5, py: 1,
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                          borderBottom: index < deptEmployees.length - 1
                            ? "1px solid #F3F4F6" : "none",
                          "&:hover": { backgroundColor: "#F5F5F5" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <Avatar src={emp.avatar}
                          sx={{
                            width: 34, height: 34, fontSize: "11px", fontWeight: 600,
                            background: "linear-gradient(135deg, #AA2493, #022179)",
                            color: "#fff", flexShrink: 0,
                          }}
                        >{getInitials(emp.fullName)}</Avatar>
                        <Box flex={1} minWidth={0}>
                          <Typography fontSize="13px" fontWeight={500} noWrap>
                            {emp.fullName}
                          </Typography>
                          <Typography fontSize="11px" color="text.secondary" noWrap>
                            {emp.designation || emp.email}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          disableRipple
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleToggleEmployee(emp)}
                          sx={{
                            p: 0, color: "#D1D5DB",
                            "&.Mui-checked": { color: "#AA2493" },
                            "& .MuiSvgIcon-root": { fontSize: 20 },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}

              {errors.employees && (
                <Typography fontSize="12px" color="error" mt={0.5}>{errors.employees}</Typography>
              )}

              {/* Hint to pick another dept */}
              {!deptEmpLoading && deptEmployees.length > 0 && (
                <Typography fontSize="11px" color="text.secondary" mt={1}>
                  Switch department above to add members from other departments.
                </Typography>
                )}
            </Box>
          )}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : `Add to Team${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ""}`
        }
        isConfirmBtnDisable={loading || selectedMembers.length === 0}
        variant="gradient"
      />
    </DialogContainer>
  );
};

export default AddTeamMember;