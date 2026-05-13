import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton       from "../../../../components/customButton";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import { MoreVerticalIcon } from "lucide-react";
import AddTask         from "./addTask";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";

const ASSIGNEE_OPTIONS = [
  { value: "sara_ahmed", label: "Sara Ahmed" },
  { value: "jon",        label: "Jon"        },
  { value: "peter",      label: "Peter"      },
  { value: "sarah",      label: "Sarah"      },
];

const mockTasks = [
  { id: 1, task: "Design product card component",      module: "Product Catalog", assigneeIds: ["sara_ahmed"],         assigneeAvatar: "", priority: "High", startDate:"May 1, 2026",   endDate: "Jun 30, 2026", status: "Completed"   },
  { id: 2, task: "Implement product search & filters", module: "Product Catalog", assigneeIds: ["sara_ahmed", "jon"],  assigneeAvatar: "", priority: "High", startDate: "May 1, 2026", endDate:"Jun 30, 2026", status: "Planning"    },
  { id: 3, task: "Product image gallery",              module: "Checkout Flow",   assigneeIds: ["peter"],              assigneeAvatar: "", priority: "Low", startDate: "May 1, 2026",   endDate: "Jun 30, 2026", status: "Development" },
  { id: 4, task: "Cart state management",              module: "Checkout Flow",   assigneeIds: ["sara_ahmed", "peter", "sarah"], assigneeAvatar: "", priority: "Medium", startDate: "May 1, 2026",  endDate: "Jun 30, 2026", status: "Testing" },
  { id: 5, task: "Payment gateway integration",        module: "Product Catalog", assigneeIds: ["sarah"],              assigneeAvatar: "", priority: "Low",  startDate: "May 1, 2026",   endDate: "Jun 30, 2026", status: "Planning"    },
  { id: 6, task: "Order management CRUD",              module: "Product Catalog", assigneeIds: ["jon", "sarah"],       assigneeAvatar: "", priority: "High", startDate: "May 1, 2026",   endDate:"Jun 30, 2026", status: "Review"      },
  { id: 7, task: "Product reviews section",            module: "Checkout Flow",   assigneeIds: ["sara_ahmed", "jon", "peter", "sarah"], assigneeAvatar: "", priority: "Medium",startDate: "May 1, 2026", endDate: "Jun 30, 2026", status: "Completed" },
];

const tableHeader = [
  { id: "task",      label: "Task"      },
  { id: "module",    label: "Module"    },
  { id: "assignees", label: "Assignees" },
  { id: "priority",  label: "Priority"  },
  { id: "startDate", label: "Start Date" },
  { id: "endDate",  label: "End Date"  },
  { id: "status",    label: "Status"    },
  { id: "actions",   label: "Actions"   },
];

const displayRows = [
  "task",
  "module",
  "task_assignees",  
  "task_priority",
  "task_start_date",
  "task_end_date",
  "project_status",
  "actions_menu",
];

const TasksTab = ({ project = {} }) => {
  const navigate = useNavigate();
  const [tasks,         setTasks]         = useState(mockTasks);
  const [filters,       setFilters]       = useState({});
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [viewTask,      setViewTask]      = useState(null);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  const handleMenuAction = (action, row) => {
    if (action === "view") {
      navigate(`/projects/tasks/${row.id}`, { state: { task: row, canEdit: true } });
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

  const handleSave = (formData) => {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                task:        formData.title,
                module:      formData.module,
                assigneeIds: formData.assigneeIds,
                priority:    capitalize(formData.priority),
                status:      capitalize(formData.status),
                startDate: formData.startDate
                ? new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "-",
                endDate:    formData.endDate
                  ? new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : t.endDate,
              }
            : t
        )
      );
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id:          Date.now(),
          task:        formData.title,
          module:      formData.module,
          assigneeIds: formData.assigneeIds,
          assigneeAvatar: "",
          priority:    capitalize(formData.priority),
          status:      capitalize(formData.status),
          startDate: formData.startDate
          ? new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "-",
          endDate:    formData.endDate
            ? new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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

      <AddTask
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editingTask={editingTask}
      />

  

      <ConfirmationDialog ref={confirmDialogRef} />

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