// projectDetailTabs/planViewerDialog.jsx
// Interactive "viewer" GUI: drag/edit the flowchart boxes, edit + drag + check
// the use cases (with AI detail), then Finalize (below) to generate tasks from
// the CHECKED use cases.
import { Box, Typography } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../../components";
import CustomButton from "../../../../components/customButton";
import PlanFlowchartEditor from "./planFlowchartEditor";
import PlanUseCasesChecklist from "./planUseCasesChecklist";

const PlanViewerDialog = ({
  open,
  onClose,
  moduleTitle = "",
  flowchart = { nodes: [], edges: [] },
  useCases = [],
  onFlowchartChange,
  onUseCasesChange,
  onDetail,
  onSave,
  saving = false,
  onFinalize,
  finalizing = false,
  editable = true,
}) => {
  const selected = useCases.filter((u) => u.checked !== false).length;

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="920px" fullWidth>
      <DialogHeader
        title={`${editable ? "Edit & finalize plan" : "Plan"}${moduleTitle ? ` — ${moduleTitle}` : ""}`}
        onClose={onClose}
      />

      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 1 }}>
          {/* Flowchart */}
          <Box>
            <Typography fontSize={15} fontWeight={600} mb={1.25}>Workflow flowchart</Typography>
            <PlanFlowchartEditor value={flowchart} onChange={onFlowchartChange} editable={editable} />
          </Box>

          {/* Use cases */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontSize={15} fontWeight={600}>Use cases</Typography>
              <Typography fontSize={12} color="text.secondary">{selected} selected for tasks</Typography>
            </Box>
            {editable && (
              <Typography fontSize={12} color="text.secondary" mb={1.25}>
                Check the use cases to include, edit or drag to reorder, use "Detail with AI" for a
                deeper implementation, then finalize to generate tasks.
              </Typography>
            )}
            <PlanUseCasesChecklist
              useCases={useCases}
              onChange={onUseCasesChange}
              editable={editable}
              onDetail={onDetail}
            />
          </Box>
        </Box>
      </DialogBody>

      {editable && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, px: 3, py: 2,
                   borderTop: "1px solid #F0F0F0" }}>
          <CustomButton
            btnLabel={saving ? "Saving..." : "Save plan"}
            variant="outlined"
            handlePressBtn={onSave}
            disabled={saving || finalizing}
          />
          <CustomButton
            btnLabel={finalizing ? "Finalizing..." : `Finalize & generate tasks (${selected})`}
            variant="gradient"
            handlePressBtn={onFinalize}
            disabled={finalizing || saving || selected === 0}
          />
        </Box>
      )}
    </DialogContainer>
  );
};

export default PlanViewerDialog;