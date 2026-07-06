// src/app/admin/reports/tabs/payrollReportTab.jsx — FULL REPLACEMENT
import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import PaginatedTable from "../../../../components/dynamicTable";
import { usePayroll }  from "../../../../hooks/payroll";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";

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

const MAX_MONTHS_BACK = 24;

const PayrollReportTab = forwardRef((props, ref) => {
  const { payrolls, loading, fetchPayroll } = usePayroll();

  const [currentDate, setCurrentDate] = useState(null);
  const [resolving,   setResolving]   = useState(true);
  const [hasAnyData,  setHasAnyData]  = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setResolving(true);
      const now = new Date();
      let found = null;

      for (let i = 0; i <= MAX_MONTHS_BACK; i++) {
        const probe = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const result = await fetchPayroll(probe.getMonth(), probe.getFullYear());
        if (cancelled) return;
        if (result?.data?.length > 0) {
          found = { month: probe.getMonth(), year: probe.getFullYear() };
          break;
        }
      }

      if (!cancelled) {
        if (found) {
          setCurrentDate(found);
          setHasAnyData(true);
        } else {
          setCurrentDate({ month: now.getMonth(), year: now.getFullYear() });
          setHasAnyData(false);
        }
        setResolving(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!currentDate || resolving) return;
    fetchPayroll(currentDate.month, currentDate.year);
  }, [currentDate?.month, currentDate?.year]);

  const year      = currentDate?.year;
  const month     = currentDate?.month;
  const monthName = currentDate
    ? new Date(year, month, 1).toLocaleString("default", { month: "long" })
    : "";

  const handlePrev = () =>
    setCurrentDate((prev) => ({
      month: prev.month - 1 < 0 ? 11 : prev.month - 1,
      year:  prev.month - 1 < 0 ? prev.year - 1 : prev.year,
    }));

  const handleNext = () =>
    setCurrentDate((prev) => ({
      month: prev.month + 1 > 11 ? 0 : prev.month + 1,
      year:  prev.month + 1 > 11 ? prev.year + 1 : prev.year,
    }));

  const now = new Date();
  const isAtCurrentMonth = currentDate && year === now.getFullYear() && month === now.getMonth();

  const tableData = useMemo(() => {
    return payrolls.map((p) => ({
      id:         p.id || p._id,
      name:       p.name || "—",
      baseSalary: p.monthlySalary ?? 0,
      bonus:      p.bonusAmount   ?? 0,
      deductions: p.deductionAmount ?? 0,
      netPay:     p.netSalary     ?? 0,
    }));
  }, [payrolls]);

  const total = tableData.reduce((sum, r) => sum + (r.netPay || 0), 0);

  useImperativeHandle(ref, () => ({
    exportData: () => {
      if (!hasAnyData || !currentDate) return;

      const doc = createReportDoc("Payroll Report", `${monthName} ${year}`);

      const totalBase       = tableData.reduce((s, r) => s + r.baseSalary, 0);
      const totalBonus      = tableData.reduce((s, r) => s + r.bonus, 0);
      const totalDeductions = tableData.reduce((s, r) => s + r.deductions, 0);

      let y = addSummaryCards(doc, [
        { label: "Employees",         value: tableData.length },
        { label: "Total Base",        value: `Rs${totalBase.toLocaleString()}` },
        { label: "Total Bonus",       value: `Rs${totalBonus.toLocaleString()}`, color: [4, 195, 115] },
        { label: "Total Deductions",  value: `Rs${totalDeductions.toLocaleString()}`, color: [255, 0, 0] },
      ]);

      y = addReportTable(doc, {
        head: ["Employee", "Base Salary", "Bonus", "Deductions", "Net Pay"],
        body: tableData.map((p) => [
          p.name,
          `Rs${p.baseSalary.toLocaleString()}`,
          `Rs${p.bonus.toLocaleString()}`,
          `Rs${p.deductions.toLocaleString()}`,
          `Rs${p.netPay.toLocaleString()}`,
        ]),
        startY: y,
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
      });

      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`Total Net Pay: Rs${total.toLocaleString()}`, 196, y + 10, { align: "right" });

      savePdf(doc, `payroll-report-${monthName}-${year}.pdf`.toLowerCase());
    },
  }));

  if (resolving || !currentDate) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress size={28} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconButton
          onClick={handlePrev}
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
          onClick={handleNext}
          size="small"
          disabled={isAtCurrentMonth}
          sx={{
            background: isAtCurrentMonth ? "#E0E0E0" : "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            borderRadius: "8px", width: 32, height: 32,
            "&:hover": { opacity: isAtCurrentMonth ? 1 : 0.9 },
          }}
        >
          <ChevronRight size={16} color="#fff" />
        </IconButton>
      </Box>

      {!hasAnyData && !loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}
          bgcolor="#fff" borderRadius="25px">
          <Typography fontSize="15px" color="text.secondary" mb={0.5}>
            No payroll has been generated in the last {MAX_MONTHS_BACK} months.
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            Generate payroll from the Payroll Management page to see it here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
          <PaginatedTable
            tableHeader={tableHeader}
            tableData={tableData}
            displayRows={displayRows}
            isLoading={loading}
            hidepagination
          />

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
      )}
    </Box>
  );
});

export default PayrollReportTab;