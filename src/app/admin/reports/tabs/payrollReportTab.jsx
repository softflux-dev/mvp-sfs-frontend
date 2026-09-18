// src/app/admin/reports/tabs/payrollReportTab.jsx —
import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import PaginatedTable from "../../../../components/dynamicTable";
import { usePayroll }  from "../../../../hooks/payroll";
import { useCompanyProfile } from "../../../../hooks/companySettings";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";
import { useFormatCurrency, formatCurrencyForPdf } from "../../../../utils/formatCurrency";


const tableHeader = [
  { id: "name",                 label: "Employee"               },
  { id: "baseSalary",           label: "Base Salary"            },
  { id: "extraHours",           label: "Extra Hours Pay"        },
  { id: "bonus",                label: "Bonus"                  },
  { id: "shortfallDeduction",   label: "Shortfall Deduction"    },
  { id: "unpaidLeaveDeduction", label: "Unpaid Leave Deduction" },
  { id: "totalDeduction",       label: "Total Deduction"        },
  { id: "netPay",               label: "Net Pay"                },
];

const displayRows = [
  "payroll_member",
  "payroll_base_salary",
  "payroll_overtime",                 // Extra Hours Pay — amount + "Xh × Ymultiplier"
  "payroll_bonus",
  "payroll_shortfall_deduction",      // Shortfall Deduction (row.deductions)
  "payroll_unpaid_leave_deduction",   // Unpaid Leave Deduction — amount + "N day(s)"
  "payroll_total_deduction",          // bold sum of the two above
  "payroll_net_pay",
];

const MAX_MONTHS_BACK = 24;

const PayrollReportTab = forwardRef((props, ref) => {
  const { payrolls, loading, fetchPayroll } = usePayroll();

  const [currentDate, setCurrentDate] = useState(null);
  const [resolving,   setResolving]   = useState(true);
  const [hasAnyData,  setHasAnyData]  = useState(true);

  const { profile: companyProfile } = useCompanyProfile(); 
  const { format } = useFormatCurrency();   

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
      deductions: p.deductionAmount ?? 0, // shortfall deduction — same field the shortfall column reads
      netPay:     p.netSalary     ?? 0,

      // Extra Hours Pay — same fields payroll_overtime cell reads
      extraHours:   p.extraHours   ?? 0,
      extraAmount:  p.extraAmount  ?? 0,
      otMultiplier: p.otMultiplier ?? 1,

      // Unpaid Leave — same fields payroll_unpaid_leave_deduction cell reads
      unpaidLeaveDays:      p.unpaidLeaveDays      || 0,
      unpaidLeaveDeduction: p.unpaidLeaveDeduction || 0,
    }));
  }, [payrolls]);

  const total = tableData.reduce((sum, r) => sum + (r.netPay || 0), 0);

  useImperativeHandle(ref, () => ({
    exportData: async () => {
      if (!hasAnyData || !currentDate) return;

      const branding = {
        logoUrl:     companyProfile?.logoUrl     || "",
        companyName: companyProfile?.companyName || "",
      };

      const doc = await createReportDoc("Payroll Report", `${monthName} ${year}`, branding);

      const totalBase              = tableData.reduce((s, r) => s + r.baseSalary, 0);
      const totalExtraHours        = tableData.reduce((s, r) => s + r.extraAmount, 0);
      const totalBonus             = tableData.reduce((s, r) => s + r.bonus, 0);
      const totalShortfall         = tableData.reduce((s, r) => s + r.deductions, 0);
      const totalUnpaidLeave       = tableData.reduce((s, r) => s + r.unpaidLeaveDeduction, 0);
      const totalDeductionCombined = totalShortfall + totalUnpaidLeave;

     
        let y = addSummaryCards(doc, [
          { label: "Employees",          value: tableData.length },
          { label: "Total Base",         value: formatCurrencyForPdf(totalBase, { decimals: 0 }) },
          { label: "Total Extra Hours Pay", value: formatCurrencyForPdf(totalExtraHours, { decimals: 0 }), color: [4, 195, 115] },
          { label: "Total Bonus",        value: formatCurrencyForPdf(totalBonus, { decimals: 0 }), color: [4, 195, 115] },
          { label: "Total Deductions",   value: formatCurrencyForPdf(totalDeductionCombined, { decimals: 0 }), color: [255, 0, 0] },
        ]);

      y = addReportTable(doc, {
        head: ["Employee", "Base Salary", "Extra Hours Pay", "Bonus", "Shortfall Deduction", "Unpaid Leave Deduction", "Total Deduction", "Net Pay"],
        
          body: tableData.map((p) => [
            p.name,
            formatCurrencyForPdf(p.baseSalary, { decimals: 0 }),
            formatCurrencyForPdf(p.extraAmount, { decimals: 0 }),
            formatCurrencyForPdf(p.bonus,      { decimals: 0 }),
            formatCurrencyForPdf(p.deductions, { decimals: 0 }),
            formatCurrencyForPdf(p.unpaidLeaveDeduction, { decimals: 0 }),
            formatCurrencyForPdf(p.deductions + p.unpaidLeaveDeduction, { decimals: 0 }),
            formatCurrencyForPdf(p.netPay,     { decimals: 0 }),
          ]),
        startY: y,
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right" } },
        companyName: branding.companyName,
      });

      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.setTextColor(30, 30, 30);
     doc.text(`Total Net Pay: ${formatCurrencyForPdf(total, { decimals: 0 })}`, 196, y + 10, { align: "right" });

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
              {format(total, { decimals: 0 })}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default PayrollReportTab;