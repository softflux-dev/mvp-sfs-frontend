import { useState, useRef,useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate }     from "react-router-dom";

import CustomButton       from "../../../../components/customButton";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import AddTask            from "./addTask";
import { useTask }        from "../../../../hooks/task";
import { useModule }      from "../../../../hooks/module";
import { useDepartment }  from "../../../../hooks/department";
import { getEmployeesApi } from "../../../../api/modules/employee"; 

const tableHeader = [
  { id: "task",      label: "Task"       },
  { id: "module",    label: "Module"     },
  { id: "assignees", label: "Assignees"  },
  { id: "priority",  label: "Priority"   },
  { id: "startDate", label: "Start Date" },
  { id: "endDate",   label: "End Date"   },
  { id: "status",     label: "Pipeline"      }, 
  { id: "taskStatus", label: "Task Status"   },
  { id: "actions",   label: "Actions"    },
];

const displayRows = [
  "task",
  "module",
  "task_assignees",
  "task_priority",
  "task_start_date",
  "task_end_date",
  "project_status",
   "task_status", 
  "actions_menu",
];

const TasksTab = ({ project = {} }) => {
  const navigate = useNavigate();

  const {
    tasks,
    loading,
    actionLoading,
    error,
    deptEmployees,
    deptEmpLoading,
    createTask,
    updateTask,
    deleteTask,
    fetchEmployeesByDepartment,
    handleFilterChange,
  } = useTask(project.id);

  // modules for dropdown
  const { modules } = useModule(project.id);

  // departments for dropdown
  const { departments, fetchDepartments } = useDepartment();
  const [allEmployees, setAllEmployees] = useState([]);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const confirmDialogRef = useRef();

  useEffect(() => {
  getEmployeesApi({ limit: 100 }).then((res) => {
    if (res?.status === 200 || res?.status === 201) {
      setAllEmployees(res.data.data.employees || []);
    }
  });
}, []);

  // ── Map API shape → table row ─────────────────────────────────────────────
  const tableData = tasks.map((t) => ({
    id:        t._id,
    task:      t.title,
    module:    t.module?.title   || "—",
    moduleId:  t.module?._id    || "",
    assignees:    (t.assignees || []).map((a) => a.fullName || "").join(", ") || "—",
    assigneeIds:  (t.assignees || []).map((a) => a._id),
    assigneeNames: (t.assignees || []).map((a) => a.fullName || ""),
    priority:  t.priority
      ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
      : "—",
    startDate: t.startDate
      ? new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    endDate: t.endDate
      ? new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    startDateRaw: t.startDate || null,   
    endDateRaw:   t.endDate   || null,
    status: t.status
      ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
      : "—",
    taskStatus: t.taskStatus
    ? t.taskStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—",    
    departmentId: t.department?._id || "",
    description:  t.description    || "",
  }));

  const menuOptions = [
    { value: "view",   label: "View"                     },
    { value: "edit",   label: "Edit"                     },
    { value: "delete", label: "Delete", color: "#FF0000" },
  ];

  const handleMenuAction = (action, row) => {
    if (action === "view") {
     navigate(`/projects/tasks/${row.id}`, { state: { task: row, canEdit: true, role: "admin" } });
    }
    if (action === "edit") {
      setEditingTask(row);
      setModalOpen(true);
    }
    if (action === "delete") {
      confirmDialogRef.current?.open({
        title:       "Delete Task?",
        description: `"${row.task}" will be permanently removed.`,
        confirmText: "Yes, Delete",
        cancelText:  "Cancel",
        onConfirm: async () => {
          const result = await deleteTask(row.id);
          if (result.success) {
            setSuccessMsg(result.message);
            setShowSuccess(true);
          } else {
            setApiError(result.message);
          }
        },
      });
    }
  };

  const handleSave = async (formData) => {
    const payload = {
      title:       formData.title,
      module:      formData.module      || null,
      department:  formData.department  || null,
      assignees:   formData.assigneeIds || [],
      priority:    formData.priority    || "medium",
      status:      formData.pipelineStatus || "planning",  
      taskStatus:  formData.taskStatus  || "new",
      startDate:   formData.startDate   || null,
      endDate:     formData.endDate     || null,
      description: formData.description || "",
    };

    let result;
    if (editingTask) {
      result = await updateTask(editingTask.id, payload);
    } else {
      result = await createTask(payload);
    }

    if (result.success) {
      setSuccessMsg(result.message);
      setShowSuccess(true);
      setModalOpen(false);
      setEditingTask(null);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* Filter + Add button */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box flex={1}>
        <Filter
          mode="tasks"
          employees={allEmployees}        
          onFilterChange={(f) => {
            handleFilterChange({
              search:   f.search   || "",
              taskStatus: f.status || "",
              priority: f.priority || "",
              assignee: f.assignee || "",  
            });
          }}
        />
        </Box>
        <CustomButton
          btnLabel="+ Add Task"
          variant="gradient"
          handlePressBtn={() => { setEditingTask(null); setModalOpen(true); }}
        />
      </Box>

      {/* API error */}
      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      {/* Table */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={loading}
        />
      </Box>

      {/* Add / Edit Task dialog */}
      <AddTask
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); setApiError(""); }}
        onSave={handleSave}
        editingTask={editingTask}
        loading={actionLoading}
        apiError={apiError}
        // real dropdown data
        moduleOptions={modules}
        departmentOptions={departments}
        deptEmployees={deptEmployees}
        deptEmpLoading={deptEmpLoading}
        onDepartmentChange={fetchEmployeesByDepartment}
        allEmployees={allEmployees}  
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

export default TasksTab;