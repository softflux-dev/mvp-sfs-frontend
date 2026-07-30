// src/app/hrPortal/leaves/leaveBalanceTab.jsx — Phase 5 (Leave Management Enhancement)
// FIX: column order and labels were confusing — "Remaining Paid Leave" only
// ever reflects the ANNUAL bucket (Annual is the flagship paid-leave type;
// Sick/Casual/Emergency/Maternity/Short are tracked as their own separate
// balances, by design). Sitting far from "Annual Allocation" and right next
// to Sick/Casual made it look like a combined total across every type, which
// it never was. Fixed by:
//   1. Grouping the three Annual metrics together (Allocation → Used → Remaining)
//   2. Qualifying their labels with "(Annual)" so the scope is explicit
//   3. Listing the per-type balances (Sick/Casual/Emergency/Maternity/Short)
//      as their own block right after
//   4. Putting the cross-type summary columns (Unpaid Taken/Pending/Approved/
//      Rejected — which DO span every leave type) last, clearly separated
//
// No backend or dynamicTable.jsx change needed — same "lb_*" cell cases,
// just reordered + relabeled in tableHeader/displayRows (which must stay in
// lockstep since PaginatedTable pairs them positionally, not by key).

import { useEffect } from "react";
import { Box } from "@mui/material";
import Filter          from "../../../components/filterBar/filter";
import PaginatedTable  from "../../../components/dynamicTable";
import { useHRLeaveBalances } from "../../../hooks/leave";
import { useDepartment } from "../../../hooks/department";
import { useRole }       from "../../../hooks/role";

const tableHeader = [
  { id: "employee",       label: "Employee"                  },
  { id: "department",     label: "Department"                },
  { id: "role",           label: "Role"                      },
  // ── Annual — grouped together, explicitly labeled ──────────────────────
  { id: "annualAlloc",    label: "Annual Allocation"          },
  { id: "paidUsed",       label: "Paid Leave Used (Annual)"   },
  { id: "remainingPaid",  label: "Remaining Paid Leave (Annual)" },
  // ── Per-type balances — their own block ─────────────────────────────────
  { id: "sick",           label: "Sick Leave Balance"         },
  { id: "casual",         label: "Casual Leave Balance"       },
  { id: "emergency",      label: "Emergency Leave"            },
  { id: "maternity",      label: "Maternity Leave"            },
  { id: "short",          label: "Short Leaves"               },
  // ── Cross-type summaries — span ALL leave types, listed last ───────────
  { id: "unpaidTaken",    label: "Unpaid Leave Taken (All Types)" },
  { id: "pending",        label: "Pending Leave"              },
  { id: "approved",       label: "Approved Leave"             },
  { id: "rejected",       label: "Rejected Leave"             },
];

const displayRows = [
  "lb_employee",
  "lb_department",
  "lb_role",
  "lb_annual_allocation",
  "lb_paid_used",
  "lb_remaining_paid",
  "lb_sick",
  "lb_casual",
  "lb_emergency",
  "lb_maternity",
  "lb_short",
  "lb_unpaid_taken",
  "lb_pending",
  "lb_approved",
  "lb_rejected",
];

const LeaveBalanceTab = () => {
  const { departments, fetchDepartments } = useDepartment();
  const { roles, fetchRoles } = useRole();

  const {
    rows, loading, year, pagination,
    handleFilterChange, handlePageChange, handleRowsPerPageChange,
  } = useHRLeaveBalances();

  useEffect(() => {
    fetchDepartments({ limit: 100 });
    fetchRoles({ limit: 100 });
  }, []);

  const tableData = rows.map((r) => ({ ...r, id: r.employeeId }));

  return (
    <Box>
      <Box mb={1}>
        <Filter
          mode="leave_balance"
          departments={departments}
          roles={roles}
          onFilterChange={(f) => handleFilterChange({
            search: f.search || "", department: f.department || "", role: f.role || "",
          })}
        />
      </Box>

      <Box mt={1} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          totalCount={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Box>
  );
};

export default LeaveBalanceTab;