// src/app/admin/employees/deactivationImpactDialog.jsx — Employee Deactivation/Reactivation feature
//
// CHANGED: candidate selection is now two-tier per item.
//   Tier 1 (default) — the item's own PROJECT TEAM, filtered to the same
//   role as the deactivated employee. This is checked first because
//   reassigning within the existing team keeps project context intact and
//   needs no onboarding.
//   Tier 2 (fallback) — only surfaced if no matching team member exists, or
//   if Admin explicitly asks for it: pick a Department, then a Role, then an
//   Employee from that filtered pool (drawn from ALL active employees, not
//   just this project's team).
// Whoever gets picked from Tier 2 is automatically enrolled in the project's
// team on the backend (reassignAndDeactivate) — they're doing project work
// now, so they should show up in that project's roster going forward.

import { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, MenuItem, Checkbox } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { DialogContainer, DialogHeader, DialogBody, CustomSelect, TextInput } from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import { useEmployeeDeactivation } from "../../../hooks/employeeDeactivation";
import { useDepartment } from "../../../hooks/department";
import { useRole }       from "../../../hooks/role";
import { getProjectTeamApi } from "../../../api/modules/project";

const ITEM_TYPE_LABEL = { project: "Project (as Manager)", task: "Task" };

const DeactivationImpactDialog = ({ open, onClose, employeeId, employeeName, onDeactivated }) => {
  const {
    impact, impactLoading, impactError, fetchImpact,
    candidatesByItem, candidatesLoading, fetchCandidates,
    actionLoading, error, confirmDeactivation, resetImpact,
  } = useEmployeeDeactivation();
  const { departments, fetchDepartments } = useDepartment();
  const { roles, fetchRoles } = useRole();

  const [selections, setSelections]   = useState({}); // itemKey -> newOwnerId
  const [teamByItem, setTeamByItem]   = useState({});  // itemKey -> full project team[]
  const [teamLoading, setTeamLoading] = useState({});  // itemKey -> bool
  const [wideSearchOn, setWideSearchOn] = useState({}); // itemKey -> bool (Tier 2 revealed)
  const [wideDept, setWideDept]       = useState({});  // itemKey -> departmentId
  const [wideRole, setWideRole]       = useState({});  // itemKey -> roleId
  const [reason, setReason]           = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open || !employeeId) {
      resetImpact(); setSelections({}); setTeamByItem({}); setTeamLoading({});
      setWideSearchOn({}); setWideDept({}); setWideRole({}); setReason("");
      return;
    }
    fetchDepartments({ limit: 100 });
    fetchRoles({ limit: 100 });
    fetchImpact(employeeId);
  }, [open, employeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once impact loads, fetch each item's PROJECT TEAM (Tier 1 pool).
  useEffect(() => {
    if (!impact?.items?.length) return;
    impact.items.forEach((item) => {
      const itemKey = `${item.itemType}:${item.id}`;
      const projectId = item.itemType === "project" ? item.id : item.projectId;
      if (!projectId) return; // task with no project — nothing to pull a team from
      setTeamLoading((prev) => ({ ...prev, [itemKey]: true }));
      getProjectTeamApi(projectId).then((res) => {
        const team = (res?.status === 200 || res?.status === 201) ? (res.data.data.team || []) : [];
        setTeamByItem((prev) => ({ ...prev, [itemKey]: team }));
      }).finally(() => {
        setTeamLoading((prev) => ({ ...prev, [itemKey]: false }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impact]);

  const teamMatchesFor = (itemKey) => {
    const team = teamByItem[itemKey] || [];
    const roleName = impact?.employee?.roleName;
    // Exclude the employee being deactivated themselves (they may still show
    // up in their own project's team list at this point).
    return team.filter((m) => m._id !== employeeId && m.role === roleName);
  };

  const enableWideSearch = (itemKey) => {
    setWideSearchOn((prev) => ({ ...prev, [itemKey]: true }));
    if (wideRole[itemKey] === undefined) {
      setWideRole((prev) => ({ ...prev, [itemKey]: impact?.employee?.roleId || "" }));
    }
  };

  const handleWideDeptChange = (itemKey) => (e) => {
    const deptId = e.target.value;
    setWideDept((prev) => ({ ...prev, [itemKey]: deptId }));
    setSelections((prev) => ({ ...prev, [itemKey]: "" }));
    fetchCandidates(itemKey, { roleId: wideRole[itemKey], departmentId: deptId, excludeId: employeeId });
  };

  const handleWideRoleChange = (itemKey) => (e) => {
    const roleId = e.target.value;
    setWideRole((prev) => ({ ...prev, [itemKey]: roleId }));
    setSelections((prev) => ({ ...prev, [itemKey]: "" }));
    fetchCandidates(itemKey, { roleId, departmentId: wideDept[itemKey], excludeId: employeeId, includeOtherRoles: !roleId });
  };

  const handleSelectTeamMember = (itemKey) => (e) => {
    setSelections((prev) => ({ ...prev, [itemKey]: e.target.value }));
  };

  const handleSelectWideCandidate = (itemKey) => (e) => {
    setSelections((prev) => ({ ...prev, [itemKey]: e.target.value }));
  };

  const items = impact?.items || [];
  const totalCount = items.length;
  const doneCount  = items.filter((it) => selections[`${it.itemType}:${it.id}`]).length;
  const allDone    = totalCount === 0 || doneCount === totalCount;

  const handleConfirm = async () => {
    const reassignments = items.map((it) => ({
      itemType: it.itemType, itemId: it.id, newOwnerId: selections[`${it.itemType}:${it.id}`],
    }));
    const result = await confirmDeactivation(employeeId, reassignments, reason);
    if (result.success) {
      setSuccessMsg(result.message || "Employee deactivated successfully.");
      setShowSuccess(true);
      onDeactivated?.();
      setTimeout(() => onClose?.(), 1200);
    }
  };

  return (
    <>
      <DialogContainer open={open} onClose={onClose} maxWidth="640px" fullWidth>
        <DialogHeader title={`Deactivate ${employeeName || "Employee"}`} onClose={onClose} />
        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <Box sx={{ backgroundColor: "#FFF7E6", border: "1px solid #FFE0A3", borderRadius: "12px", px: 2, py: 1.5, display: "flex", gap: 1.25 }}>
              <AlertTriangle size={16} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography fontSize="12px" color="#92400E" lineHeight={1.6}>
                All projects and tasks assigned to this account must be reassigned before deactivation can complete.
                Team members of the same project are shown first; search other departments/roles only if none fit.
              </Typography>
            </Box>

            {impactLoading && <Box display="flex" justifyContent="center" py={4}><CircularProgress size={26} sx={{ color: "#AA2493" }} /></Box>}
            {!impactLoading && impactError && <Typography fontSize="13px" color="error">{impactError}</Typography>}

            {!impactLoading && impact && (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography fontSize="13px" fontWeight={700} color="text.primary">
                    {impact.summary.projects} project(s), {impact.summary.tasks} task(s) need reassignment
                  </Typography>
                  <Chip
                    label={`${doneCount} of ${totalCount} reassigned`}
                    size="small"
                    sx={{ height: "24px", fontSize: "11px", fontWeight: 700, backgroundColor: allDone ? "#04C3731A" : "#AA24931A", color: allDone ? "#04C373" : "#AA2493" }}
                  />
                </Box>

                {totalCount === 0 && (
                  <Typography fontSize="13px" color="text.secondary" textAlign="center" py={3}>
                    Nothing is currently assigned to this employee — safe to deactivate immediately.
                  </Typography>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 380, overflowY: "auto", pr: 0.5 }}>
                  {items.map((item) => {
                    const itemKey = `${item.itemType}:${item.id}`;
                    const selected = selections[itemKey] || "";
                    const loadingTeam = teamLoading[itemKey];
                    const teamMatches = teamMatchesFor(itemKey);
                    const showWide = !!wideSearchOn[itemKey] || (!loadingTeam && teamMatches.length === 0);
                    const wideCandidates = candidatesByItem[itemKey] || [];
                    const wideLoading = candidatesLoading[itemKey];

                    return (
                      <Box key={itemKey} sx={{ border: "1px solid #F0F0F0", borderRadius: "12px", p: 1.75 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Box>
                            <Typography fontSize="13px" fontWeight={700} color="text.primary">{item.title}</Typography>
                            <Typography fontSize="11px" color="text.secondary">
                              {ITEM_TYPE_LABEL[item.itemType]}{item.projectName ? ` · ${item.projectName}` : ""}
                            </Typography>
                          </Box>
                          {selected && <Chip label="✓ Reassigned" size="small" sx={{ height: "20px", fontSize: "10px", fontWeight: 700, backgroundColor: "#04C3731A", color: "#04C373" }} />}
                        </Box>

                        {/* ── Tier 1: project team, role-matched ─────────────── */}
                        {loadingTeam && <Box display="flex" alignItems="center" gap={1} py={1}><CircularProgress size={14} sx={{ color: "#AA2493" }} /><Typography fontSize="11px" color="text.secondary">Loading project team...</Typography></Box>}

                        {!loadingTeam && teamMatches.length > 0 && (
                          <Box mb={1}>
                            <CustomInputLabel label="Reassign to (project team)" />
                            <CustomSelect
                              value={teamMatches.some((m) => m._id === selected) ? selected : ""}
                              onChange={handleSelectTeamMember(itemKey)}
                              fullWidth height="40px" inputBgColor="#F5F5F5" displayEmpty
                            >
                              <MenuItem value="">Select team member...</MenuItem>
                              {teamMatches.map((m) => (
                                <MenuItem key={m._id} value={m._id}>{m.name} · {m.role}</MenuItem>
                              ))}
                            </CustomSelect>
                          </Box>
                        )}

                        {!loadingTeam && teamMatches.length === 0 && (
                          <Typography fontSize="11px" color="#B45309" mb={1}>
                            No one on this project's team shares {employeeName ? `${employeeName}'s` : "this employee's"} role — search other departments below.
                          </Typography>
                        )}

                        {/* ── Toggle to reveal Tier 2 even when Tier 1 has matches ── */}
                        {!loadingTeam && teamMatches.length > 0 && !wideSearchOn[itemKey] && (
                          <Box display="flex" alignItems="center" gap={0.75} mb={1}>
                            <Checkbox
                              size="small" checked={false}
                              onChange={() => enableWideSearch(itemKey)}
                              sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" } }}
                            />
                            <Typography fontSize="11px" color="text.secondary">
                              None of these fit — search a different department/role instead
                            </Typography>
                          </Box>
                        )}

                        {/* ── Tier 2: department → role → employee, all active ── */}
                        {showWide && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#FAFAFA", borderRadius: "10px", p: 1.25, mt: teamMatches.length > 0 ? 1 : 0 }}>
                            <Typography fontSize="10px" fontWeight={700} color="text.secondary" textTransform="uppercase">
                              Search other employees
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              <Box sx={{ flex: 1, minWidth: 140 }}>
                                <CustomSelect
                                  value={wideDept[itemKey] || ""}
                                  onChange={handleWideDeptChange(itemKey)}
                                  fullWidth height="38px" inputBgColor="#fff" displayEmpty
                                >
                                  <MenuItem value="">All departments</MenuItem>
                                  {departments.map((d) => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
                                </CustomSelect>
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 140 }}>
                                <CustomSelect
                                  value={wideRole[itemKey] ?? (impact?.employee?.roleId || "")}
                                  onChange={handleWideRoleChange(itemKey)}
                                  fullWidth height="38px" inputBgColor="#fff" displayEmpty
                                >
                                  <MenuItem value="">All roles</MenuItem>
                                  {roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.roleName}</MenuItem>)}
                                </CustomSelect>
                              </Box>
                            </Box>

                            <CustomSelect
                              value={wideCandidates.some((c) => c._id === selected) ? selected : ""}
                              onChange={handleSelectWideCandidate(itemKey)}
                              fullWidth height="40px" inputBgColor="#fff" displayEmpty
                              disabled={wideLoading}
                            >
                              <MenuItem value="">{wideLoading ? "Loading..." : "Reassign to..."}</MenuItem>
                              {wideCandidates.map((c) => (
                                <MenuItem key={c._id} value={c._id}>{c.fullName} · {c.departmentName} · {c.roleName}</MenuItem>
                              ))}
                            </CustomSelect>
                            {!wideLoading && wideCandidates.length === 0 && (wideDept[itemKey] || wideRole[itemKey] !== undefined) && (
                              <Typography fontSize="11px" color="#DC2626">No active employees match this filter.</Typography>
                            )}
                            <Typography fontSize="10px" color="text.secondary">
                              Picking someone here adds them to this project's team.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                <Box>
                  <CustomInputLabel label="Reason (optional)" />
                  <TextInput
                    placeholder="Add a note for the audit log..."
                    value={reason} onChange={(e) => setReason(e.target.value)}
                    inputBgColor="#F5F5F5" fullWidth multiline rows={2}
                  />
                </Box>

                {error && <Typography fontSize="12px" color="error">{error}</Typography>}
              </>
            )}
          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={onClose}
          onConfirm={handleConfirm}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Confirm Deactivation"
          variant="gradient"
          confirmLoading={actionLoading}
          isConfirmBtnDisable={!allDone || impactLoading || actionLoading}
        />
      </DialogContainer>

      <SuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} autoClose autoCloseDelay={2000} />
    </>
  );
};

export default DeactivationImpactDialog;