// src/app/admin/reports/tabs/attendanceReportTab.jsx — 
import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import PaginatedTable from "../../../../components/dynamicTable";
import { getAttendanceSummaryApi } from "../../../../api/modules/attendance";
import { useCompanyProfile }       from "../../../../hooks/companySettings";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../../utils/reportPdfExport";

const tableHeader = [
  { id: "name",           label: "Employee"     },
  { id: "present",        label: "Present"      },
  { id: "absent",         label: "Absent"       },
  { id: "leave",          label: "Leave"        },
  { id: "attendanceRate", label: "Attendance %" },
];

const displayRows = [
  "att_report_member",
  "att_report_present",
  "att_report_absent",
  "att_report_leave",
  "att_report_rate",
];

const resolveDefaultPeriod = (summary) => {
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear  = now.getFullYear();

  const hasPeriod = (m, y) => summary.some((r) => r.monthIndex === m && r.yearNum === y);

  if (hasPeriod(curMonth, curYear)) return { month: curMonth, year: curYear };

  const prev = new Date(curYear, curMonth - 1, 1);
  if (hasPeriod(prev.getMonth(), prev.getFullYear())) {
    return { month: prev.getMonth(), year: prev.getFullYear() };
  }

  if (summary.length) {
    const sorted = [...summary].sort((a, b) =>
      b.yearNum - a.yearNum || b.monthIndex - a.monthIndex
    );
    return { month: sorted[0].monthIndex, year: sorted[0].yearNum };
  }

  return { month: curMonth, year: curYear };
};

const AttendanceReportTab = forwardRef((props, ref) => {
  const [summary,      setSummary]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentDate,  setCurrentDate]  = useState(null);

  const { profile: companyProfile } = useCompanyProfile(); // ← NEW

  useEffect(() => {
    setLoading(true);
    getAttendanceSummaryApi({ months: 12 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const raw = res.data.data.summary || [];
        setSummary(raw);
        setCurrentDate(resolveDefaultPeriod(raw));
      }
    }).finally(() => setLoading(false));
  }, []);

  const year      = currentDate?.year;
  const month     = currentDate?.month;
  const monthName = currentDate
    ? new Date(year, month, 1).toLocaleString("default", { month: "long" })
    : "";

  const handlePrev = () => setCurrentDate({ month: month - 1 < 0 ? 11 : month - 1, year: month - 1 < 0 ? year - 1 : year });
  const handleNext = () => setCurrentDate({ month: month + 1 > 11 ? 0 : month + 1, year: month + 1 > 11 ? year + 1 : year });

  const now = new Date();
  const isAtCurrentMonth = currentDate && year === now.getFullYear() && month === now.getMonth();

  const tableData = useMemo(() => {
    if (!currentDate) return [];
    return summary
      .filter((r) => r.monthIndex === month && r.yearNum === year && r.name)
      .map((r) => {
        const totalMarked = r.totalPresent + r.totalAbsent + r.totalLeave;
        const rate = totalMarked > 0 ? Math.round((r.totalPresent / totalMarked) * 100) : 0;
        return {
          id:             r.id,
          name:           r.name,
          present:        r.totalPresent,
          absent:         r.totalAbsent,
          leave:          r.totalLeave,
          attendanceRate: rate,
        };
      });
  }, [summary, month, year, currentDate]);

  useImperativeHandle(ref, () => ({
    exportData: async () => {
      if (!currentDate) return;

      const branding = {
        logoUrl:     companyProfile?.logoUrl     || "",
        companyName: companyProfile?.companyName || "",
      };

      const doc = await createReportDoc("Attendance Report", `${monthName} ${year}`, branding);

      const totalPresent = tableData.reduce((s, r) => s + r.present, 0);
      const totalAbsent  = tableData.reduce((s, r) => s + r.absent, 0);
      const avgRate = tableData.length
        ? Math.round(tableData.reduce((s, r) => s + r.attendanceRate, 0) / tableData.length)
        : 0;

      let y = addSummaryCards(doc, [
        { label: "Employees",      value: tableData.length },
        { label: "Total Present",  value: totalPresent, color: [4, 195, 115] },
        { label: "Total Absent",   value: totalAbsent,  color: [255, 0, 0] },
        { label: "Avg Attendance", value: `${avgRate}%` },
      ]);

      addReportTable(doc, {
        head: ["Employee", "Present", "Absent", "Leave", "Attendance %"],
        body: tableData.map((r) => [r.name, String(r.present), String(r.absent), String(r.leave), `${r.attendanceRate}%`]),
        startY: y,
        companyName: branding.companyName,
      });

      savePdf(doc, `attendance-report-${monthName}-${year}.pdf`.toLowerCase());
    },
  }));

  if (loading || !currentDate) {
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

      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
        />
      </Box>
    </Box>
  );
});

export default AttendanceReportTab;