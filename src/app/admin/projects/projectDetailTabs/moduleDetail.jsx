// projectDetailTabs/moduleDetail.jsx
// Module detail page. The plan is edited + finalized in the viewer GUI
// (drag/edit flowchart boxes, edit/drag/check use cases + AI detail, Finalize → tasks).
import { useState, useEffect, useRef } from "react";
import { Box, Typography, Chip, IconButton, CircularProgress } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import CustomButton       from "../../../../components/customButton";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import { usePlan }        from "../../../../hooks/plan";
import PlanFlowchartEditor from "./planFlowchartEditor";
import PlanViewerDialog   from "./planViewerDialog";
import PlanTaskReviewDialog from "./planTaskReviewDialog";
import backIcon from "../../../../assets/icons/downlaod-back-btn.svg";

const EMPTY_FLOW = { nodes: [], edges: [] };

const MODULE_STATUS_CFG = {
  planning:    { bg: "#E9D5FF", color: "#7C3AED" },
  development: { bg: "#FEF3C7", color: "#D97706" },
  testing:     { bg: "#DBEAFE", color: "#2563EB" },
  review:      { bg: "#FEF9C3", color: "#CA8A04" },
  completed:   { bg: "#D1FAE5", color: "#059669" },
};

const PLAN_LABEL = {
  none:            { text: "No plan yet",     color: "#9CA3AF" },
  draft:           { text: "Plan in draft",   color: "#D97706" },
  tasks_generated: { text: "Tasks generated", color: "#059669" },
};

const Step = ({ done, active, label, last }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5,
               color: done ? "#059669" : active ? "#AA2493" : "text.secondary" }}>
      {done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
      <Typography fontSize={13} fontWeight={active ? 600 : 400}>{label}</Typography>
    </Box>
    {!last && <ChevronRightIcon sx={{ fontSize: 16, color: "#D1D5DB" }} />}
  </Box>
);

const Meta = ({ label, value, valueColor }) => (
  <Box>
    <Typography fontSize={11} color="text.secondary" mb={0.3}>{label}</Typography>
    <Typography fontSize={14} fontWeight={700} sx={{ color: valueColor || "text.primary" }}>{value}</Typography>
  </Box>
);

const ModuleDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, moduleId } = useParams();
  const role = location.state?.role || "admin";

  const {
    module, plan, taskCount, loading, generating, savingPlan, error,
    fetchDetail, generate, savePlan, detailUseCase, generateTasks, commitTasks,
  } = usePlan(projectId, moduleId);

  // Local editable copies (seeded from the saved plan)
  const [flowchart, setFlowchart] = useState(EMPTY_FLOW);
  const [useCases,  setUseCases]  = useState([]);

  const [viewerOpen,    setViewerOpen]    = useState(false);
  const [reviewOpen,    setReviewOpen]    = useState(false);
  const [proposedTasks, setProposedTasks] = useState([]);
  const [finalizing,    setFinalizing]    = useState(false);
  const [committing,    setCommitting]    = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [localError,    setLocalError]    = useState("");

  const confirmRef = useRef();

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  useEffect(() => {
    const fc = plan.flowchart && Array.isArray(plan.flowchart.nodes) ? plan.flowchart : EMPTY_FLOW;
    setFlowchart(fc);
    setUseCases((plan.useCases || []).map((u) => ({ ...u, checked: u.checked !== false })));
  }, [plan]);

  const hasPlan   = plan.status && plan.status !== "none";
  const committed = plan.status === "tasks_generated";
  const planCfg   = PLAN_LABEL[plan.status] || PLAN_LABEL.none;
  const statusCfg = MODULE_STATUS_CFG[module?.status] || { bg: "#F5F5F5", color: "#757575" };
  const selectedCount = useCases.filter((u) => u.checked !== false).length;

  const tasksBase = role === "pm" ? `/pm-projects/${projectId}` : `/projects/${projectId}`;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setLocalError("");
    const res = await generate();
    if (res.success) setViewerOpen(true);          // jump straight into the GUI
    else setLocalError(res.message || "Failed to generate plan.");
  };

  const handleSave = async () => {
    setLocalError("");
    const res = await savePlan(flowchart, useCases);
    if (res.success) { setSuccessMsg("Plan saved."); setShowSuccess(true); }
    else setLocalError(res.message || "Failed to save plan.");
  };

  // Ask AI for a detailed implementation of one use case; store it on that use case.
  const handleDetail = async (uc) => {
    const res = await detailUseCase(uc.title, uc.description);
    if (res.success) {
      setUseCases((prev) => prev.map((u) => (u.id === uc.id ? { ...u, details: res.details } : u)));
    } else {
      setLocalError(res.message || "Failed to generate detail.");
    }
    return res;
  };

  const handleFinalize = async () => {
    setLocalError("");
    setFinalizing(true);
    const saved = await savePlan(flowchart, useCases);   // persist edits + checks
    if (!saved.success) { setFinalizing(false); setLocalError(saved.message); return; }
    const res = await generateTasks();                   // uses checked use cases
    setFinalizing(false);
    if (res.success) {
      setProposedTasks(res.tasks);
      setViewerOpen(false);
      setReviewOpen(true);
    } else {
      setLocalError(res.message || "Failed to generate tasks.");
    }
  };

  const handleCommit = async (edited) => {
    setCommitting(true);
    const res = await commitTasks(edited);
    setCommitting(false);
    if (res.success) {
      setReviewOpen(false);
      setSuccessMsg(res.message || "Tasks added.");
      setShowSuccess(true);
    } else {
      setLocalError(res.message || "Failed to add tasks.");
    }
  };

  if (loading && !module) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  return (
    <>
      {/* Back */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          Back to modules
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography fontSize="20px" fontWeight={700}>{module?.title || "—"}</Typography>
            {module?.category?.label && (
              <Chip label={module.category.label}
                sx={{ height: 24, fontSize: 12, borderRadius: "8px",
                      backgroundColor: "#F3E8FB", color: "#AA2493" }} />
            )}
            {module?.status && (
              <Chip label={module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                sx={{ height: 24, fontSize: 12, borderRadius: "8px",
                      backgroundColor: statusCfg.bg, color: statusCfg.color }} />
            )}
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                   gap: 2, backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2 }}>
          <Meta label="Progress" value={`${module?.progress ?? 0}%`} />
          <Meta label="Tasks" value={`${module?.completedTasks ?? 0} / ${module?.totalTasks ?? 0}`} />
          <Meta label="Plan status" value={planCfg.text} valueColor={planCfg.color} />
          <Meta label="Generated by" value={plan.model || "—"} />
        </Box>
      </Box>

      {/* Lifecycle stepper */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap",
                 backgroundColor: "#F5F5F5", borderRadius: "10px", px: 2, py: 1.25, mb: 2 }}>
        <Step done={hasPlan} active={!hasPlan} label="Generate plan" />
        <Step done={committed} active={hasPlan && !committed} label="Edit, check & finalize" />
        <Step done={committed} active={hasPlan && !committed} label="Generate tasks" />
        <Step done={false} active={committed} label="Assign to employees (PM)" last />
      </Box>

      {/* Error banner */}
      {(error || localError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error || localError}</Typography>
        </Box>
      )}

      {/* No plan → empty state */}
      {!hasPlan ? (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 6, textAlign: "center" }}>
          <Typography fontSize={16} fontWeight={600} mb={0.5}>Generate a plan for this module</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2.5}>
            AI creates a workflow flowchart and use cases. You then edit, check the ones you want,
            and finalize to turn them into tasks.
          </Typography>
          <CustomButton
            btnLabel={generating ? "Generating..." : "Generate plan"}
            variant="gradient"
            handlePressBtn={handleGenerate}
            disabled={generating}
          />
        </Box>
      ) : (
        <>
          {/* Plan summary card */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
              <Typography fontSize={16} fontWeight={600}>Plan</Typography>
              <CustomButton
                btnLabel={committed ? "Open viewer" : "Open viewer — edit & finalize"}
                variant="gradient"
                handlePressBtn={() => setViewerOpen(true)}
              />
            </Box>

            {/* Read-only mini flowchart */}
            <Typography fontSize={12} color="text.secondary" mb={0.75}>Workflow</Typography>
            <PlanFlowchartEditor value={flowchart} editable={false} height={240} />

            {/* Use case summary */}
            <Typography fontSize={13} color="text.secondary" mt={2}>
              {useCases.length} use case{useCases.length === 1 ? "" : "s"} · {selectedCount} selected for tasks
            </Typography>
          </Box>

          {/* Generated tasks card */}
          {committed && (
            <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px" }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography fontSize={16} fontWeight={600}>Generated tasks</Typography>
                  <Typography fontSize={13} color="text.secondary" mt={0.5}>
                    {taskCount} task{taskCount === 1 ? "" : "s"} added to this module. Assign them from the task view.
                  </Typography>
                </Box>
                <CustomButton btnLabel="View tasks" variant="gradient"
                  handlePressBtn={() => navigate(`${tasksBase}?tab=5`)} />
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <PlanViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        moduleTitle={module?.title}
        flowchart={flowchart}
        useCases={useCases}
        onFlowchartChange={setFlowchart}
        onUseCasesChange={setUseCases}
        onDetail={handleDetail}
        onSave={handleSave}
        saving={savingPlan}
        onFinalize={handleFinalize}
        finalizing={finalizing}
        editable={!committed}
      />
      <PlanTaskReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        tasks={proposedTasks}
        loading={committing}
        onCommit={handleCommit}
      />
      <ConfirmationDialog ref={confirmRef} />
      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default ModuleDetail;