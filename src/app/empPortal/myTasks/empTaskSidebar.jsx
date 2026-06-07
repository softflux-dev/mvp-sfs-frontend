// src/app/empPortal/myTasks/empTaskSidebar.jsx
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

const EmpTaskSidebar = ({ task = {}, onStatusUpdate }) => {
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState(task.taskStatus || "");
  const [statusSuccess,  setStatusSuccess]  = useState(false);

  useEffect(() => {
    setSelectedStatus(task.taskStatus || "");
  }, [task.taskStatus]);

  const taskId = task?._id || task?.id;

  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>

        {/* ── Update Status — disabled overlay for ALL roles ─────────────── */}
        <Box sx={{ position: "relative" }}>

          {/* Content underneath overlay */}
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3 }}>
            <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2}>
              Update Status
            </Typography>
            <CustomSelect
              value={selectedStatus}
              onChange={() => {}}
              fullWidth
              height="45px"
              inputBgColor="#F5F5F5"
              displayEmpty
              disabled
              sx={{ mb: 2 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </CustomSelect>
            <CustomButton
              btnLabel="Update Status"
              variant="gradient"
              handlePressBtn={() => {}}
              disabled
              sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%" }}
            />
          </Box>

          {/* Overlay — always visible for every role */}
          <Box
            sx={{
              position:        "absolute",
              inset:           0,
              borderRadius:    "16px",
              backgroundColor: "rgba(255,255,255,0.72)",
              backdropFilter:  "blur(3px)",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              cursor:          "not-allowed",
              zIndex:          2,
            }}
          >
            <Typography
              fontSize="12px"
              fontWeight={600}
              textAlign="center"
              sx={{
                color:           "#AA2493",
                backgroundColor: "#F3E8FB",
                px:              2,
                py:              0.75,
                borderRadius:    "20px",
                border:          "1px solid #E8C8F5",
                userSelect:      "none",
                mx:              2,
              }}
            >
              Use the pipeline to update task status
            </Typography>
          </Box>
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
                projectName:  task?.project?.projectName || task?.project || "",
                moduleName:   task?.module?.title || task?.module?.moduleName || task?.module || "",
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