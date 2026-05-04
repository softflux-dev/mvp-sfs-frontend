import { useState, useRef } from "react";
import { Box } from "@mui/material";
import CustomButton       from "../../../../components/customButton";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import { MoreVerticalIcon } from "lucide-react";
import AddTask         from "./addTask";
import ViewTaskDialog  from "./viewTaskDialog";
import ConfirmationDialog from "../../../../components/popups/confirmation";       // forwardRef — Cancel/Yes
import SuccessPopup       from "../../../../components/popups/confirmationDialog"; // auto-close success

const mockTasks = [
  { id: 1, task: "Design product card component",      module: "Product Catalog", assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "High",   deadline: "Jun 30, 2026", status: "Completed"   },
  { id: 2, task: "Implement product search & filters", module: "Product Catalog", assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "High",   deadline: "Jun 30, 2026", status: "Planning"    },
  { id: 3, task: "Product image gallery",              module: "Checkout Flow",   assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "Low",    deadline: "Jun 30, 2026", status: "Development" },
  { id: 4, task: "Cart state management",              module: "Checkout Flow",   assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "Medium", deadline: "Jun 30, 2026", status: "Testing"     },
  { id: 5, task: "Payment gateway integration",        module: "Product Catalog", assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "Low",    deadline: "Jun 30, 2026", status: "Planning"    },
  { id: 6, task: "Order management CRUD",              module: "Product Catalog", assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "High",   deadline: "Jun 30, 2026", status: "Review"      },
  { id: 7, task: "Product reviews section",            module: "Checkout Flow",   assigneeName: "Sara Ahmed", assigneeAvatar: "", priority: "Medium", deadline: "Jun 30, 2026", status: "Completed"   },
];

const tableHeader = [
  { id: "task",     label: "Task"     },
  { id: "module",   label: "Module"   },
  { id: "assignee", label: "Assignee" },
  { id: "priority", label: "Priority" },
  { id: "deadline", label: "Deadline" },
  { id: "status",   label: "Status"   },
  { id: "actions",  label: "Actions"  },
];

const displayRows = [
  "task",
  "module",
  "task_assignee",
  "task_priority",
  "deadline",
  "project_status",
  "actions_menu",
];

const TasksTab = ({ project = {} }) => {
  const [tasks,         setTasks]         = useState(mockTasks);
  const [filters,       setFilters]       = useState({});
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [viewTask,      setViewTask]      = useState(null);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  // ── Menu actions ──────────────────────────────────────────────────────────
  const handleMenuAction = (action, row) => {
    if (action === "view") {
      setViewTask(row);
      setViewOpen(true);
    }
    if (action === "edit") {
      setEditingTask(row);
      setModalOpen(true);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title: "Confirmation !",
        description: "Are you sure you want to Delete this ?",
        confirmText: "Yes",
        cancelText: "Cancel",
        onConfirm: () => {
          setTasks((prev) => prev.filter((t) => t.id !== row.id));
          setDeleteSuccess(true);
        },
      });
    }
  };

  // ── Save (add or edit) ────────────────────────────────────────────────────
  const handleSave = (formData) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                task:         formData.title,
                module:       formData.module,
                assigneeName: formData.assignee,
                priority:     formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1),
                status:       formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
                deadline:     formData.deadline
                  ? new Date(formData.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : t.deadline,
              }
            : t
        )
      );
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id:           Date.now(),
          task:         formData.title,
          module:       formData.module,
          assigneeName: formData.assignee,
          assigneeAvatar: "",
          priority:     formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1),
          status:       formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
          deadline:     formData.deadline
            ? new Date(formData.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "-",
        },
      ]);
    }
  };

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit"                     },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Filter row + Add Task button ─────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box flex={1}>
          <Filter mode="tasks" onFilterChange={setFilters} />
        </Box>
        <CustomButton
          btnLabel="+ Add Task"
          variant="gradient"
          handlePressBtn={() => { setEditingTask(null); setModalOpen(true); }}
        />
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tasks}
          displayRows={displayRows}
          menuIcon={MoreVerticalIcon}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={false}
        />
      </Box>

      {/* ── Add / Edit Task dialog ────────────────────────────────────────── */}
      <AddTask
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editingTask={editingTask}
      />

      {/* ── View Details dialog ───────────────────────────────────────────── */}
      <ViewTaskDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        task={viewTask}
      />

      {/* ── Delete confirmation (confirmation.jsx — forwardRef) ───────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success auto-close (confirmationDialog.jsx) ───────────── */}
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

export default TasksTab;