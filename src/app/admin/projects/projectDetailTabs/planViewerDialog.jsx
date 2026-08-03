// projectDetailTabs/planViewerDialog.jsx
// Interactive "viewer" GUI, in sequence:
//   1) Use cases — edit, drag, check the ones to keep, "Detail with AI" per case.
//   2) Once finalized, "Generate flowchart" builds the diagram FROM the checked
//      use cases only. The flowchart section appears after that, editable
//      (drag boxes, double-click to rename).
//   3) "Finalize & generate tasks" builds tasks from the flowchart + use cases.
import { Box, Typography } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../../components";
import CustomButton from "../../../../components/customButton";
import PlanFlowchartEditor from "./planFlowchartEditor";
import PlanUseCasesChecklist from "./planUseCasesChecklist";

const PlanViewerDialog = ({
  open,
  onClose,
  moduleTitle = "",
  planStatus = "usecases_draft",   // usecases_draft | flowchart_ready | tasks_generated
  useCases = [],
  onUseCasesChange,
  onDetail,
  onSaveUseCases,
  savingUseCases = false,
  onGenerateFlowchart,
  generatingFlowchart = false,
  flowchart = { nodes: [], edges: [] },
  onFlowchartChange,
  onSaveFlowchart,
  savingFlowchart = false,
  onGenerateTasks,
  generatingTasks = false,
}) => {
  const selected = useCases.filter((u) => u.checked !== false).length;
  const hasFlowchart = planStatus === "flowchart_ready" || planStatus === "tasks_generated";
  const committed = planStatus === "tasks_generated";

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="920px" fullWidth>
      <DialogHeader
        title={`${committed ? "Plan" : "Edit & finalize plan"}${moduleTitle ? ` — ${moduleTitle}` : ""}`}
        onClose={onClose}
      />

      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 1 }}>

          {/* Step 1 — Use cases */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontSize={15} fontWeight={600}>1. Use cases</Typography>
              <Typography fontSize={12} color="text.secondary">{selected} selected</Typography>
            </Box>
            {!committed && (
              <Typography fontSize={12} color="text.secondary" mb={1.25}>
                Check the use cases to include, edit or drag to reorder, use "Detail with AI" for a
                deeper implementation. The flowchart below is generated only from what's checked here.
              </Typography>
            )}
            <PlanUseCasesChecklist
              useCases={useCases}
              onChange={onUseCasesChange}
              editable={!committed}
              onDetail={onDetail}
            />

            {!committed && (
              <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1.5}>
                <CustomButton
                  btnLabel={savingUseCases ? "Saving..." : "Save use cases"}
                  variant="outlined"
                  handlePressBtn={onSaveUseCases}
                  disabled={savingUseCases || generatingFlowchart}
                />
                <CustomButton
                  btnLabel={
                    generatingFlowchart
                      ? "Generating flowchart..."
                      : hasFlowchart
                        ? `Regenerate flowchart (${selected})`
                        : `Generate flowchart (${selected})`
                  }
                  variant="gradient"
                  handlePressBtn={onGenerateFlowchart}
                  disabled={generatingFlowchart || savingUseCases || selected === 0}
                />
              </Box>
            )}
          </Box>

          {/* Step 2 — Flowchart (only after it's been generated from finalized use cases) */}
          {hasFlowchart && (
            <Box>
              <Typography fontSize={15} fontWeight={600} mb={1.25}>
                2. Workflow flowchart <Typography component="span" fontSize={12} color="text.secondary">
                  — built from your finalized use cases
                </Typography>
              </Typography>
              <PlanFlowchartEditor value={flowchart} onChange={onFlowchartChange} editable={!committed} height={460} />

              {!committed && (
                <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1.5}>
                  <CustomButton
                    btnLabel={savingFlowchart ? "Saving..." : "Save flowchart"}
                    variant="outlined"
                    handlePressBtn={onSaveFlowchart}
                    disabled={savingFlowchart || generatingTasks}
                  />
                  <CustomButton
                    btnLabel={generatingTasks ? "Finalizing..." : "Finalize & generate tasks"}
                    variant="gradient"
                    handlePressBtn={onGenerateTasks}
                    disabled={generatingTasks || savingFlowchart}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogBody>
    </DialogContainer>
  );
};

export default PlanViewerDialog;