import { useState, useRef } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton       from "../../../../components/customButton";
import ModuleCard         from "../../../../components/cards/moduleCard";
import AddModule          from "./addModule";
import AddModuleCategory  from "./addModuleCategory";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import { useModule }      from "../../../../hooks/module";
import { useModuleCategory } from "../../../../hooks/moduleCategory";

const ModulesTab = ({ project = {}, role = "admin" }) => {
  const navigate = useNavigate();
  const {
  modules, loading, actionLoading, error,
  createModule, updateModule, deleteModule,
} = useModule(project.id, role);

const { moduleCategories, fetchModuleCategories } = useModuleCategory(project.id, role);

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [apiError,      setApiError]      = useState("");

  const confirmDialogRef = useRef();

  // ── Navigate to the module detail page (admin vs PM base path) ─────────────
  const detailBase = role === "pm" ? `/pm-projects/${project.id}` : `/projects/${project.id}`;
  const handleViewDetail = (moduleId) =>
    navigate(`${detailBase}/modules/${moduleId}`, { state: { role } });

  const handleAddModule = () => { setEditingModule(null); setModalOpen(true); };
  const handleEdit = (mod) => { setEditingModule(mod); setModalOpen(true); };

  const handleDelete = (mod) => {
    confirmDialogRef.current?.open({
      title:       "Delete Module?",
      description: `"${mod.title}" will be permanently removed.`,
      confirmText: "Yes, Delete",
      cancelText:  "Cancel",
      onConfirm: async () => {
        const result = await deleteModule(mod.id);
        if (result.success) { setSuccessMsg(result.message); setShowSuccess(true); }
        else setApiError(result.message);
      },
    });
  };

  const handleSave = async (formData) => {
    const payload = {
      title:       formData.moduleName,
      description: formData.description || "",
      status:      formData.status      || "planning",
      category:    formData.category    || null,
    };
    const result = editingModule
      ? await updateModule(editingModule.id, payload)
      : await createModule(payload);

    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setModalOpen(false);
      setEditingModule(null);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  // ── Map API shape → ModuleCard props (now includes plan status) ────────────
  const moduleCards = modules.map((mod) => ({
    id:          mod._id,
    title:       mod.title,
    description: mod.description || "",
    status:      mod.status ? mod.status.charAt(0).toUpperCase() + mod.status.slice(1) : "Planning",
    tasksLabel:  `${mod.completedTasks ?? 0}/${mod.totalTasks ?? 0} tasks`,
    progress:    mod.progress ?? 0,
    members:     (mod.members || []).map((m) => m.avatar || ""),
    categoryId:  mod.category?._id   || "",
    categoryLabel: mod.category?.label || "",
    planStatus:  mod.plan?.status || "none",
  }));

  return (
    <Box sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="flex-end" gap={1.5} mb={3}>
        <CustomButton btnLabel="+ Add Category" variant="outlined"
          handlePressBtn={() => setCategoryModalOpen(true)} />
        <CustomButton btnLabel="+ Add Module" variant="gradient" handlePressBtn={handleAddModule} />
      </Box>

      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}>
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      ) : moduleCards.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <Typography fontSize={14} color="text.secondary">
            No modules yet. Click "+ Add Module" to create one.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {moduleCards.map((mod) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={mod.id}>
              <ModuleCard
                title={mod.title}
                description={mod.description}
                status={mod.status}
                tasksLabel={mod.tasksLabel}
                progress={mod.progress}
                members={mod.members}
                categoryLabel={mod.categoryLabel}
                planStatus={mod.planStatus}
                onEdit={() => handleEdit(mod)}
                onDelete={() => handleDelete(mod)}
                onViewDetail={() => handleViewDetail(mod.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddModule
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingModule(null); setApiError(""); }}
        onSave={handleSave}
        editingModule={editingModule}
        loading={actionLoading}
        categoryOptions={moduleCategories}
      />
     <AddModuleCategory
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={() => fetchModuleCategories()}
        projectId={project.id}
      />
      <ConfirmationDialog ref={confirmDialogRef} />
      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default ModulesTab;