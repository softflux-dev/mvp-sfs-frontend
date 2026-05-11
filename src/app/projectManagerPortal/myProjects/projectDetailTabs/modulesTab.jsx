import { useState, useRef } from "react";
import { Box, Grid } from "@mui/material";
import CustomButton       from "../../../../components/customButton";
import ModuleCard         from "../../../../components/cards/moduleCard";
import AddModule          from "./addModule";
import ConfirmationDialog from "../../../../components/popups/confirmation";        // ✅ forwardRef — Cancel/Yes
import SuccessPopup       from "../../../../components/popups/confirmationDialog";  // ✅ auto-close success

const mockModules = [
  { id: 1, title: "Product Catalog", description: "Product listing and detail pages", status: "Development", tasksLabel: "8/12 tasks", progress: 87, members: [], showActions: false },
  { id: 2, title: "Product Catalog", description: "Product listing and detail pages", status: "Planning",    tasksLabel: "8/12 tasks", progress: 87, members: [], showActions: true  },
  { id: 3, title: "Product Catalog", description: "Product listing and detail pages", status: "Planning",    tasksLabel: "8/12 tasks", progress: 87, members: [], showActions: false },
];

const ModulesTab = ({ project = {} }) => {
  const [modules,       setModules]       = useState(mockModules);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAddModule = () => {
    setEditingModule(null);
    setModalOpen(true);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (mod) => {
    setEditingModule(mod);
    setModalOpen(true);
  };

  // ── Delete — open forwardRef confirmation first ───────────────────────────
  const handleDelete = (moduleId) => {
    confirmDialogRef.current?.open({
      title: "Confirmation !",
      description: "Are you sure you want to Delete this ?",
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: () => {
        // ✅ only runs when user clicks Yes
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        setDeleteSuccess(true);
      },
    });
  };

  // ── Save (add or edit) ───────────────────────────────────────────────────
  const handleSave = (formData) => {
    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? {
                ...m,
                title:       formData.moduleName,
                description: formData.description,
                status:      formData.status,
              }
            : m
        )
      );
    } else {
      setModules((prev) => [
        ...prev,
        {
          id:          Date.now(),
          title:       formData.moduleName,
          description: formData.description,
          status:      formData.status,
          tasksLabel:  "0/0 tasks",
          progress:    0,
          members:     [],
          showActions: true,
        },
      ]);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Add Module button ─────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <CustomButton
          btnLabel="+ Add Module"
          variant="gradient"
          handlePressBtn={handleAddModule}
        />
      </Box>

      {/* ── Module cards grid ─────────────────────────────────────────────── */}
      <Grid container spacing={3}>
        {modules.map((mod) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={mod.id}>
            <ModuleCard
              title={mod.title}
              description={mod.description}
              status={mod.status}
              tasksLabel={mod.tasksLabel}
              progress={mod.progress}
              members={mod.members}
              showActions={mod.showActions}
              onEdit={() => handleEdit(mod)}
              onDelete={() => handleDelete(mod.id)}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Add / Edit dialog ─────────────────────────────────────────────── */}
      <AddModule
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingModule(null); }}
        onSave={handleSave}
        editingModule={editingModule}
      />

      {/* ── Step 1: Delete confirmation (confirmation.jsx — forwardRef) ──── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Step 2: Delete success auto-close (confirmationDialog.jsx) ───── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Successfully Deleted."
        autoClose
        autoCloseDelay={2000}
      />

    </Box>
  );
};

export default ModulesTab;