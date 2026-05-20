import { useState, useEffect } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton  from "../../../components/customButton";
import CustomSelect  from "../../../components/customSelect";
import SuccessPopup  from "../../../components/popups/confirmationDialog";
import SubmitWorkBox from "./submitWorkBox";
import AllBugsBox    from "./allBugsBox";

const STATUS_OPTIONS = [
  { value: "new",          label: "New"          },
  { value: "in_progress",  label: "In Progress"  },
  { value: "under_review", label: "Under Review" },
  { value: "completed",    label: "Completed"    },
];

/**
 * EmpTaskSidebar
 *
 * Props:
 *   task            — the task object (must include _id or id)
 *   onStatusUpdate  — async fn(status) → { success, message }
 *                     called after optimistic UI; should call updateTaskStatusApi
 */
const EmpTaskSidebar = ({ task = {}, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(task.taskStatus || "");
  const [statusLoading,  setStatusLoading]  = useState(false);
  const [statusSuccess,  setStatusSuccess]  = useState(false);
  const [statusError,    setStatusError]    = useState("");


   useEffect(() => {
    setSelectedStatus(task.taskStatus || "");
  }, [task.taskStatus]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setStatusLoading(true);
    setStatusError("");
    try {
      const result = await onStatusUpdate?.(selectedStatus);
      if (result?.success !== false) {
        setStatusSuccess(true);
      } else {
        setStatusError(result?.message || "Failed to update status.");
      }
    } catch {
      setStatusError("Something went wrong.");
    } finally {
      setStatusLoading(false);
    }
  };

  const taskId = task?._id || task?.id;

  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>

        {/* Update Status */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
            Update Status
          </Typography>
          <CustomSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth
            height="45px"
            inputBgColor="#F5F5F5"
            displayEmpty
            sx={{ mb: 2 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </CustomSelect>
          {statusError && (
            <Typography fontSize="12px" color="error" mb={1}>{statusError}</Typography>
          )}
          <CustomButton
            btnLabel={statusLoading ? "Updating..." : "Update Status"}
            variant="gradient"
            handlePressBtn={handleStatusUpdate}
            disabled={statusLoading || !selectedStatus}
            sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%" }}
          />
        </Box>

        {/* Submit Work + All Work */}
        <SubmitWorkBox taskId={taskId} />

        {/* Add Bug Report + All Bugs */}
        <AllBugsBox
          task={task}
          taskId={taskId}
          onViewAllBugs={() =>
            navigate("/employee/bugs", {
              state: {
                taskId:       taskId,
                taskTitle:    task?.title    || "My Task",
                taskStatus:   task?.status   || "In Progress",
                projectName: task?.project?.projectName || task?.project || "Project Alpha",
                moduleName: task?.module?.title || task?.module?.moduleName || task?.module || "",
                taskPriority: task?.priority || "Medium",
              },
            })
          }
        />

      </Box>

      <SuccessPopup
        open={statusSuccess}
        onClose={() => setStatusSuccess(false)}
        message="Status updated successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default EmpTaskSidebar;