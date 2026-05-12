// tabs/departmentTab.jsx
import { useState, useRef } from "react";
import { Box, Typography, Grid } from "@mui/material";

import CustomInputLabel   from "../../../../components/customInputLabel";
import TextInput          from "../../../../components/textInput";
import CustomButton       from "../../../../components/customButton";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../../components";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import addIcon             from "../../../../assets/icons/add-icon.svg";

// ── Mock departments ──────────────────────────────────────────────────────────
const mockDepartments = [
  { id: 1, name: "Engineering",       description: "Software development and technical operations", employees: 12 },
  { id: 2, name: "Human Resources",   description: "Recruitment, onboarding, and employee relations", employees: 4 },
  { id: 3, name: "Finance",           description: "Budgeting, payroll, and financial reporting",   employees: 5 },
  { id: 4, name: "Product",           description: "Product strategy, design, and roadmap",         employees: 6 },
  { id: 5, name: "Marketing",         description: "Brand, campaigns, and growth initiatives",      employees: 7 },
];

const tableHeader = [
  { id: "name",        label: "Department Name" },
  { id: "description", label: "Description"     },
  { id: "employees",   label: "Employees"       },
  { id: "actions",     label: "Actions"         },
];

const displayRows = [
  "dept_name",
  "dept_description",
  "dept_employees",
  "actions_menu",
];

const EMPTY_FORM = { name: "", description: "" };

// ── Add / Edit dialog ─────────────────────────────────────────────────────────
const DepartmentDialog = ({ open, onClose, onSave, editingDept }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // sync form when opening
  useState(() => {
    if (open) {
      setForm(editingDept
        ? { name: editingDept.name || "", description: editingDept.description || "" }
        : { ...EMPTY_FORM }
      );
    }
  }, [open, editingDept]);

  // keep in sync via effect pattern inline
  const prevOpen = useRef(false);
  if (open !== prevOpen.current) {
    prevOpen.current = open;
    if (open) {
      // intentional — runs synchronously during render for dialog open
    }
  }

  const [localForm, setLocalForm] = useState({ ...EMPTY_FORM });

  // proper effect-less sync: reset on open
  const openRef   = useRef(false);
  const stateInit = useRef(false);

  if (open && !openRef.current) {
    openRef.current   = true;
    stateInit.current = false;
  }
  if (!open && openRef.current) {
    openRef.current = false;
  }

  // Use a separate controlled state that mirrors what we need
  const [controlled, setControlled] = useState({ name: "", description: "" });
  const lastEditRef = useRef(null);

  if (open && editingDept !== lastEditRef.current) {
    lastEditRef.current = editingDept;
    const next = editingDept
      ? { name: editingDept.name || "", description: editingDept.description || "" }
      : { ...EMPTY_FORM };
    // schedule via microtask to avoid setState-during-render warning
    Promise.resolve().then(() => setControlled(next));
  }

  const set = (field) => (e) =>
    setControlled((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = controlled.name.trim() !== "";

  const handleClose = () => {
    setControlled({ ...EMPTY_FORM });
    lastEditRef.current = null;
    onClose();
  };

  const handleSave = () => {
    onSave?.(controlled);
    setControlled({ ...EMPTY_FORM });
    lastEditRef.current = null;
    onClose();
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="480px" fullWidth>
      <DialogHeader
        title={editingDept ? "Edit Department" : "Add Department"}
        onClose={handleClose}
      />
      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <CustomInputLabel label="Department Name *" />
            <TextInput
              placeholder="Enter Department Name"
              value={controlled.name}
              onChange={set("name")}
              inputBgColor="#fff"
              fullWidth
            />
          </Box>
          <Box>
            <CustomInputLabel label="Description" />
            <TextInput
              placeholder="Enter Description"
              value={controlled.description}
              onChange={set("description")}
              inputBgColor="#fff"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </Box>
      </DialogBody>
      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText={editingDept ? "Update" : "Add Department"}
        isConfirmBtnDisable={!isValid}
        variant="gradient"
      />
    </DialogContainer>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────
const DepartmentTab = () => {
  const [departments,  setDepartments]  = useState(mockDepartments);
  const [openModal,    setOpenModal]    = useState(false);
  const [editingDept,  setEditingDept]  = useState(null);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [deleteSuccess,setDeleteSuccess]= useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  const confirmDialogRef = useRef();

  const menuOptions = [
    { value: "edit",   label: "Edit"               },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  const handleMenuAction = (action, row) => {
    if (action === "edit") {
      setEditingDept(row);
      setOpenModal(true);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Department?",
        description: `"${row.name}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: () => {
          setDepartments((prev) => prev.filter((d) => d.id !== row.id));
          setSuccessMsg("Department deleted successfully");
          setDeleteSuccess(true);
        },
      });
    }
  };

  const handleSave = (data) => {
    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? { ...d, ...data } : d))
      );
      setSuccessMsg("Department updated successfully");
    } else {
      setDepartments((prev) => [
        ...prev,
        { id: Date.now(), employees: 0, ...data },
      ]);
      setSuccessMsg("Department added successfully");
    }
    setEditingDept(null);
    setSaveSuccess(true);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 3 }}>

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <Grid container alignItems="center" mb={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography fontSize="18px" fontWeight={600} color="text.darkGray">
            Departments
          </Typography>
          <Typography fontSize="13px" color="text.secondary">
            Manage your company departments
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box display="flex" justifyContent="flex-end">
            <CustomButton
              btnLabel="Add Department"
              variant="gradient"
              handlePressBtn={() => { setEditingDept(null); setOpenModal(true); }}
              startIcon={<img src={addIcon} alt="Add" />}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={departments}
        displayRows={displayRows}
        menuOptions={menuOptions}
        onMenuAction={handleMenuAction}
        isLoading={false}
      />

      {/* ── Add / Edit dialog ─────────────────────────────────────────────── */}
      <DepartmentDialog
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingDept(null); }}
        onSave={handleSave}
        editingDept={editingDept}
      />

      {/* ── Confirm delete ────────────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Success popups ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default DepartmentTab;