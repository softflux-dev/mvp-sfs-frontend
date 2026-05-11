// salary/index.jsx
import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";

import HeaderText     from "../../../components/headerText";
import CustomButton   from "../../../components/customButton";
import Filter         from "../../../components/filterBar/filter";
import PaginatedTable from "../../../components/dynamicTable";
import SuccessPopup   from "../../../components/popups/confirmationDialog";

import ExportIcon from "../../../assets/icons/download-icon-white.svg";

// ── Mock data — swap with API/redux ───────────────────────────────────────
const SALARY_INFO = {
  monthly: 120000,
  empType: "Full-time",
};

const mockPayslips = [
  { id: 1, month: "Feb 2026", baseSalary: 120000, bonus: 6106, deductions: 5000, netPay: 121106 },
  { id: 2, month: "Jan 2026", baseSalary: 120000, bonus: 9133, deductions: 5000, netPay: 124133 },
  { id: 3, month: "Dec 2025", baseSalary: 120000, bonus: 2878, deductions: 5000, netPay: 117878 },
  { id: 4, month: "Nov 2025", baseSalary: 120000, bonus: 4500, deductions: 5000, netPay: 119500 },
  { id: 5, month: "Oct 2025", baseSalary: 120000, bonus: 7200, deductions: 5000, netPay: 122200 },
  { id: 6, month: "Sep 2025", baseSalary: 120000, bonus: 3000, deductions: 5000, netPay: 118000 },
];

const tableHeader = [
  { id: "checkbox",   label: ""            },
  { id: "month",      label: "Month"       },
  { id: "baseSalary", label: "Base Salary" },
  { id: "bonus",      label: "Bonus"       },
  { id: "deductions", label: "Deductions"  },
  { id: "netPay",     label: "Net Pay"     },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "payroll_checkbox",
  "ps_month",
  "ps_base_salary",
  "ps_bonus",
  "ps_deductions",
  "ps_net_pay",
  "ps_download",
];

const Salary = () => {
  const [filters,      setFilters]      = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredData = mockPayslips.filter(() => true);

  // ── Row selection ─────────────────────────────────────────────────────
  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === filteredData.length ? [] : filteredData.map((r) => r.id)
    );
  };

  // ── Download single row ───────────────────────────────────────────────
  const handleDownload = (row) => {
    console.log("Download payslip:", row);
  };

  // ── Export selected ───────────────────────────────────────────────────
  const handleExport = () => {
    const toExport = filteredData.filter((r) => selectedRows.includes(r.id));
    console.log("Export payslips:", toExport);
    setExportSuccess(true);
  };

  return (
    <Box>
      {/* ── Page header ── */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <HeaderText
            title="Salary & Payslips"
            subtitle="View your salary details and payslip history"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel={
                selectedRows.length > 0
                  ? `Export (${selectedRows.length})`
                  : "Export PDF"
              }
              variant="gradient"
              startIcon={
                <img src={ExportIcon} alt="export" style={{ width: 15, height: 15 }} />
              }
              handlePressBtn={handleExport}
            />
          </Box>
        </Grid>
      </Grid>

     

   

      {/* ── Filter ── */}
      <Filter mode="salary_history" onFilterChange={(f) => setFilters(f)} />

      {/* ── Table ── */}
      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={filteredData}
          displayRows={displayRows}
          isLoading={false}
          onDownloadClick={handleDownload}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      </Box>

      <SuccessPopup
        open={exportSuccess}
        onClose={() => setExportSuccess(false)}
        message={`${selectedRows.length} payslip(s) exported successfully`}
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default Salary;