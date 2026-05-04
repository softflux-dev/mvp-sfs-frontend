import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import PaginatedTable from "../../../../components/dynamicTable";

const mockPayroll = [
  { id: 1, name: "Ali Hassan",  baseSalary: 120000, bonus: 6106,  deductions: 5000, netPay: 126090 },
  { id: 2, name: "Sara Ahmed",  baseSalary: 150000, bonus: 9133,  deductions: 5000, netPay: 155267 },
  { id: 3, name: "Omar Farooq", baseSalary: 100000, bonus: 2878,  deductions: 5000, netPay: 101523 },
  { id: 4, name: "Fatima Khan", baseSalary: 110000, bonus: 13633, deductions: 5000, netPay: 115379 },
  { id: 5, name: "Sara Ahmed",  baseSalary: 80000,  bonus: 4183,  deductions: 5000, netPay: 81789  },
  { id: 6, name: "Omar Farooq", baseSalary: 140000, bonus: 3956,  deductions: 5000, netPay: 140195 },
  { id: 7, name: "Fatima Khan", baseSalary: 130000, bonus: 7377,  deductions: 5000, netPay: 129345 },
];

const tableHeader = [
  { id: "name",       label: "Employee"   },
  { id: "baseSalary", label: "Base Salary"},
  { id: "bonus",      label: "Bonus"      },
  { id: "deductions", label: "Deductions" },
  { id: "netPay",     label: "Net Pay"    },
];

const displayRows = [
  "payroll_member",
  "payroll_base_salary",
  "payroll_bonus",
  "payroll_deductions",
  "payroll_net_pay",
];

const PayrollReportTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));

  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const total = mockPayroll.reduce((sum, r) => sum + r.netPay, 0);

  return (
    <Box>
      {/* ── Month Navigator ───────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconButton
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          size="small"
          sx={{ bgcolor: "#F5F5F5", borderRadius: "8px", width: 32, height: 32, "&:hover": { bgcolor: "#E0E0E0" } }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        <Box sx={{ px: 2, py: 0.75, bgcolor: "#F5F5F5", borderRadius: "8px", display: "flex", alignItems: "center", gap: 1 }}>
          <Calendar size={14} color="#67768B" />
          <Typography fontSize="13px" fontWeight={600} color="text.primary">
            {monthName} {year}
          </Typography>
        </Box>

        <IconButton
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          size="small"
          sx={{ background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)", borderRadius: "8px", width: 32, height: 32, "&:hover": { opacity: 0.9 } }}
        >
          <ChevronRight size={16} color="#fff" />
        </IconButton>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockPayroll}
          displayRows={displayRows}
          isLoading={false}
          hidepagination
        />

        {/* ── Total row ──────────────────────────────────────────────────── */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 2, borderTop: "1px solid #F5F5F5" }}
        >
          <Typography fontSize="14px" fontWeight={700} color="text.primary">
            Total
          </Typography>
          <Typography fontSize="14px" fontWeight={700} color="text.primary">
            Rs{total.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PayrollReportTab;