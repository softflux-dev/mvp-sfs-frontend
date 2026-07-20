import { useState, useEffect, useRef } from "react";
import { Box, Grid, Typography, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";

import HeaderText                from "../../../components/headerText";
import StatsCard                 from "../../../components/cards/statsCard";
import Filter                    from "../../../components/filterBar/filter";
import PaginatedTable            from "../../../components/dynamicTable";
import CustomButton              from "../../../components/customButton";
import WorkloadDistributionChart from "./workloadDistributionChart";
import TaskCompletionSpeedChart  from "./taskCompletionSpeedChart";
import { usePerformance }        from "../../../hooks/performance";
import { useDepartment }         from "../../../hooks/department";
import { createReportDoc, addSummaryCards, addReportTable, savePdf } from "../../../utils/reportPdfExport";

import completionIcon from "../../../assets/icons/task-completion.svg";
import overdueIcon    from "../../../assets/icons/overdue-time.svg";
import performerIcon  from "../../../assets/icons/employees.svg";
import balanceIcon    from "../../../assets/icons/attendance-icon.svg";
import viewIcon       from "../../../assets/icons/view.svg";
import exportIcon     from "../../../assets/icons/upload-doc-icon.svg";

const perfTableHeader = [
  { id: "name",           label: "Employee"    },
  { id: "department",     label: "Department"  },
  { id: "assigned",       label: "Assigned"    },
  { id: "completed",      label: "Completed"   },
  { id: "inProgress",     label: "In Progress" },
  { id: "delayed",        label: "Overdue"     },
  { id: "avgTime",        label: "Avg Time"    },
  { id: "completionRate", label: "Rate"        },
  { id: "actions",        label: "Actions"     },
];

const perfDisplayRows = [
  "employee_details",
  "department",
  "perf_assigned",
  "perf_completed",
  "perf_in_progress",
  "perf_delayed",
  "perf_avg_time",
  "perf_completion_rate",
  "perf_view",
];

const delayedTableHeader = [
  { id: "taskName",    label: "Task"         },
  { id: "assignee",    label: "Assignee"     },
  { id: "project",     label: "Project"      },
  { id: "deadline",    label: "Deadline"     },
  { id: "daysOverdue", label: "Days Overdue" },
];

const delayedDisplayRows = [
  "task_name",
  "task_assignees",
  "task_project",
  "task_due_date",
  "perf_days_overdue",
];

const Performance = () => {
  const navigate = useNavigate();
  const { departments, fetchDepartments } = useDepartment();
  const { data, loading, fetchPerformance } = usePerformance();

  const [filters, setFilters] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchDepartments({ limit: 100 });
  }, []);

  const handleFilterChange = (f) => {
    setFilters(f);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPerformance({ search: f.search || "", department: f.department || "" });
    }, 350);
  };

  const stats = data?.stats || { avgCompletionRate: "0%", overdueTasks: 0, topPerformer: "—", workloadBalance: "—" };
  const members = data?.members || [];
  const delayed = data?.delayed || [];
  const workload = data?.workload || [];
  const speedChart = data?.speedChart || { data: [], lineConfig: [] };

  const statsData = [
    { id: 1, title: "Avg Completion Rate", value: stats.avgCompletionRate, description: "Across all employees", icon: completionIcon },
    { id: 2, title: "Overdue Tasks",       value: String(stats.overdueTasks), description: "Needs attention", icon: overdueIcon },
    { id: 3, title: "Top Performer",       value: stats.topPerformer, description: "Highest completion rate", icon: performerIcon },
    { id: 4, title: "Workload Balance",    value: stats.workloadBalance, description: stats.workloadBalance === "Good" ? "Evenly distributed" : "Some employees overloaded", icon: balanceIcon },
  ];

  // ── Export ────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (loading || !data) return;

    const doc = createReportDoc("Performance Monitoring Report");

    let y = addSummaryCards(doc, [
      { label: "Avg Completion Rate", value: stats.avgCompletionRate },
      { label: "Overdue Tasks",       value: String(stats.overdueTasks), color: [255, 0, 0] },
      { label: "Top Performer",       value: stats.topPerformer },
      { label: "Workload Balance",    value: stats.workloadBalance, color: stats.workloadBalance === "Good" ? [4, 195, 115] : [255, 151, 47] },
    ]);

    // ── Employee performance table ──────────────────────────────────────
    y = addReportTable(doc, {
      head: ["Employee", "Department", "Assigned", "Completed", "In Progress", "Overdue", "Avg Time", "Rate"],
      body: members.map((m) => [
        m.name, m.department, String(m.assigned), String(m.completed),
        String(m.inProgress), String(m.delayed), m.avgTime, `${m.completionRate}%`,
      ]),
      startY: y,
    });

    // ── Workload distribution table ─────────────────────────────────────
    if (workload.length) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Workload Distribution", 14, y + 10);

      y = addReportTable(doc, {
        head: ["Employee", "Active Tasks"],
        body: workload.map((w) => [w.name, String(w.activeTasks)]),
        startY: y + 14,
      });
    }

    // ── Delayed tasks table ──────────────────────────────────────────────
    if (delayed.length) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Delayed Tasks", 14, 20);

      addReportTable(doc, {
        head: ["Task", "Assignee(s)", "Project", "Deadline", "Days Overdue"],
        body: delayed.map((t) => [
          t.taskName,
          (t.assigneeNames || []).join(", ") || "Unassigned",
          t.project,
          t.dueDate,
          String(t.daysOverdue),
        ]),
        startY: 26,
      });
    }

    savePdf(doc, `performance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid item size={{ xs: 12, md: 8 }}>
          <HeaderText title="Performance Monitoring" subtitle="Track employee productivity and project delivery" />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Export Report"
              variant="gradient"
              startIcon={<img src={exportIcon} alt="Export" />}
              handlePressBtn={handleExport}
              isDisabled={loading || !data}
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {statsData.map((stat) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            {loading ? (
              <Box sx={{ backgroundColor: "#fff", borderRadius: "30px", p: 2, height: "130px" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Skeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="55%" height={16} />
              </Box>
            ) : (
              <StatsCard title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} isHighlighted={stat.isHighlighted} />
            )}
          </Grid>
        ))}
      </Grid>

      <Filter mode="performance" departments={departments} onFilterChange={handleFilterChange} />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={perfTableHeader}
          tableData={members}
          displayRows={perfDisplayRows}
          viewIcon={viewIcon}
          onViewClick={(row) => navigate(`/employees/${row.id}`)}
          isLoading={loading}
        />
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }} alignItems="stretch">
        <Grid item size={{ xs: 12, md: 6 }}>
          <WorkloadDistributionChart data={workload} loading={loading} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TaskCompletionSpeedChart data={speedChart.data} lineConfig={speedChart.lineConfig} loading={loading} />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary" mb={2}>
          Delayed Tasks
        </Typography>
        <Box bgcolor="#fff" borderRadius="25px" p={1}>
          <PaginatedTable
            tableHeader={delayedTableHeader}
            tableData={delayed}
            displayRows={delayedDisplayRows}
            isLoading={loading}
            showPagination={true}
          />
        </Box>
      </Box>
    </>
  );
};

export default Performance;