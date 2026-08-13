// projectDetailTabs/moduleDetail.jsx
// Module detail page. Plan lifecycle, in order:
//   1) Generate use cases → user checks/edits/finalizes them
//   2) Generate flowchart FROM the finalized use cases → drag/edit boxes
//   3) Finalize & generate tasks → review → commit to module (unassigned)
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
import PlanUseCasesChecklist from "./planUseCasesChecklist";
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
  none:            { text: "No plan yet",       color: "#9CA3AF" },
  usecases_draft:  { text: "Use cases drafted", color: "#D97706" },
  flowchart_ready: { text: "Flowchart ready",   color: "#2563EB" },
  tasks_generated: { text: "Tasks generated",   color: "#059669" },
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

const DESCRIPTION_CLAMP_LINES = 3;

const ExpandableDescription = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight + 1);
    }
  }, [text]);

  return (
    <Box mb={2}>
      <Typography
        ref={textRef}
        fontSize={13}
        color="text.secondary"
        sx={!expanded ? {
          display: "-webkit-box",
          WebkitLineClamp: DESCRIPTION_CLAMP_LINES,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } : undefined}
      >
        {text}
      </Typography>
      {(isClamped || expanded) && (
        <Typography
          fontSize={12}
          fontWeight={600}
          sx={{ color: "#AA2493", cursor: "pointer", mt: 0.5 }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show less" : "Show more"}
        </Typography>
      )}
    </Box>
  );
};

const ModuleDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, moduleId } = useParams();
  const role = location.state?.role || "admin";

 const {
  module, plan, taskCount, loading, error,
  generatingUC, savingUC, generatingFC, savingFC,
  fetchDetail,
  generateUseCases, saveUseCases, detailUseCase,
  generateFlowchart, saveFlowchart,
  generateTasks, commitTasks,
} = usePlan(projectId, moduleId, role);   

  // Local editable copies (seeded from the saved plan)
  const [useCases,  setUseCases]  = useState([]);
  const [flowchart, setFlowchart] = useState(EMPTY_FLOW);

  const [viewerOpen,     setViewerOpen]     = useState(false);
  const [reviewOpen,     setReviewOpen]     = useState(false);
  const [proposedTasks,  setProposedTasks]  = useState([]);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [committing,     setCommitting]     = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [localError,     setLocalError]     = useState("");

  const confirmRef = useRef();

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  useEffect(() => {
    setUseCases((plan.useCases || []).map((u) => ({ ...u, checked: u.checked !== false })));
    const fc = plan.flowchart && Array.isArray(plan.flowchart.nodes) ? plan.flowchart : EMPTY_FLOW;
    setFlowchart(fc);
  }, [plan]);

  const hasUseCases  = plan.status && plan.status !== "none";
  const hasFlowchart = plan.status === "flowchart_ready" || plan.status === "tasks_generated";
  const committed    = plan.status === "tasks_generated";
  const planCfg       = PLAN_LABEL[plan.status] || PLAN_LABEL.none;
  const statusCfg      = MODULE_STATUS_CFG[module?.status] || { bg: "#F5F5F5", color: "#757575" };
  const selectedCount = useCases.filter((u) => u.checked !== false).length;

  const tasksBase = role === "pm" ? `/pm-projects/${projectId}` : `/projects/${projectId}`;

  // ── Stage 1 — generate use cases ────────────────────────────────────────────
  const handleGenerateUseCases = async () => {
    setLocalError("");
    const res = await generateUseCases();
    if (res.success) setViewerOpen(true);
    else setLocalError(res.message || "Failed to generate use cases.");
  };

  const handleSaveUseCases = async () => {
    setLocalError("");
    const res = await saveUseCases(useCases);
    if (res.success) { setSuccessMsg("Use cases saved."); setShowSuccess(true); }
    else setLocalError(res.message || "Failed to save use cases.");
  };

  // instructions is optional — the user's own steering prompt for this use case
  const handleDetail = async (uc, instructions) => {
    const res = await detailUseCase(uc.title, uc.description, instructions);
    if (res.success) {
      setUseCases((prev) => prev.map((u) => (u.id === uc.id ? { ...u, details: res.details } : u)));
    } else {
      setLocalError(res.message || "Failed to generate detail.");
    }
    return res;
  };

  // ── Stage 2 — generate flowchart FROM the finalized (checked) use cases ────
  const handleGenerateFlowchart = async () => {
    setLocalError("");
    const saved = await saveUseCases(useCases);       // persist checks/edits first
    if (!saved.success) { setLocalError(saved.message); return; }
    const res = await generateFlowchart();            // backend uses checked use cases
    if (!res.success) setLocalError(res.message || "Failed to generate flowchart.");
  };

  const handleSaveFlowchart = async () => {
    setLocalError("");
    const res = await saveFlowchart(flowchart);
    if (res.success) { setSuccessMsg("Flowchart saved."); setShowSuccess(true); }
    else setLocalError(res.message || "Failed to save flowchart.");
  };

  // ── Stage 3 — generate tasks from flowchart + finalized use cases ─────────
  const handleGenerateTasks = async () => {
    setLocalError("");
    setGeneratingTasks(true);
    const savedFc = await saveFlowchart(flowchart);   // persist any drag/edits first
    if (!savedFc.success) { setGeneratingTasks(false); setLocalError(savedFc.message); return; }
    const res = await generateTasks();
    setGeneratingTasks(false);
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

        {module?.description && (
          <ExpandableDescription text={module.description} />
        )}

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
        <Step done={hasUseCases} active={!hasUseCases} label="Generate use cases" />
        <Step done={hasFlowchart} active={hasUseCases && !hasFlowchart} label="Finalize use cases" />
        <Step done={hasFlowchart} active={hasUseCases && !hasFlowchart} label="Generate flowchart" />
        <Step done={committed} active={hasFlowchart && !committed} label="Generate tasks" />
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
      {!hasUseCases ? (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 6, textAlign: "center" }}>
          <Typography fontSize={16} fontWeight={600} mb={0.5}>Generate use cases for this module</Typography>
          <Typography fontSize={13} color="text.secondary" mb={2.5}>
            AI drafts the use cases first. Check the ones you want and finalize them —
            only then is the flowchart generated, built specifically from what you kept.
          </Typography>
          <CustomButton
            btnLabel={generatingUC ? "Generating..." : "Generate use cases"}
            variant="gradient"
            handlePressBtn={handleGenerateUseCases}
            disabled={generatingUC}
          />
        </Box>
      ) : (
        <>
          {/* Header row + open-viewer button */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
              <Typography fontSize={16} fontWeight={600}>Plan</Typography>
              <CustomButton
                btnLabel={
                  committed ? "Open viewer"
                    : hasFlowchart ? "Open viewer — generate tasks"
                    : "Open viewer — finalize use cases"
                }
                variant="gradient"
                handlePressBtn={() => setViewerOpen(true)}
              />
            </Box>
            <Typography fontSize={13} color="text.secondary">
              {useCases.length} use case{useCases.length === 1 ? "" : "s"} · {selectedCount} finalized
              {hasFlowchart ? " · flowchart generated" : " · flowchart not generated yet"}
            </Typography>
          </Box>

          {/* Saved use cases — read-only view of what's on this module */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 2 }}>
            <Typography fontSize={16} fontWeight={600} mb={1.5}>Use cases</Typography>
            <PlanUseCasesChecklist
              useCases={useCases}
              onChange={setUseCases}
              editable={false}
              onDetail={handleDetail}
            />
          </Box>

          {/* Workflow flowchart — read-only preview, full toolbar (fit/download) */}
          {hasFlowchart && (
            <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 2 }}>
              <Typography fontSize={16} fontWeight={600} mb={1.5}>Workflow flowchart</Typography>
              <PlanFlowchartEditor value={flowchart} editable={false} height={320} />
            </Box>
          )}

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
        planStatus={plan.status}
        useCases={useCases}
        onUseCasesChange={setUseCases}
        onDetail={handleDetail}
        onSaveUseCases={handleSaveUseCases}
        savingUseCases={savingUC}
        onGenerateFlowchart={handleGenerateFlowchart}
        generatingFlowchart={generatingFC}
        flowchart={flowchart}
        onFlowchartChange={setFlowchart}
        onSaveFlowchart={handleSaveFlowchart}
        savingFlowchart={savingFC}
        onGenerateTasks={handleGenerateTasks}
        generatingTasks={generatingTasks}
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