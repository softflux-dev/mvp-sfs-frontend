import { useState } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton  from "../../../components/customButton";
import CustomSelect  from "../../../components/customSelect";
import SuccessPopup  from "../../../components/popups/confirmationDialog";
import SubmitWorkBox from "./submitWorkBox";
import AllBugsBox    from "./allBugsBox";

// ← removed: ViewWorkDialog import
// ← removed: viewDialogOpen state

const STATUS_OPTIONS = [
  { value: "new",          label: "New"          },
  { value: "in_progress",  label: "In Progress"  },
  { value: "under_review", label: "Under Review" },
  { value: "completed",    label: "Completed"    },
];

const EmpTaskSidebar = ({ task = {}, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusSuccess,  setStatusSuccess]  = useState(false);

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    onStatusUpdate?.(selectedStatus);
    setStatusSuccess(true);
  };

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
            fullWidth height="45px" inputBgColor="#F5F5F5" displayEmpty sx={{ mb: 2 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </CustomSelect>
          <CustomButton
            btnLabel="Update Status"
            variant="gradient"
            handlePressBtn={handleStatusUpdate}
            sx={{ height: "46px", fontSize: "14px", fontWeight: 600, width: "100%" }}
          />
        </Box>

        {/* Submit Work + All Work — dialogs managed internally */}
        <SubmitWorkBox />

        {/* Add Bug Report + All Bugs */}
        <AllBugsBox
          task={task}
          onViewAllBugs={() => navigate("/employee/bugs", {
            state: {
              taskTitle:    task?.title    || "My Task",
              taskStatus:   task?.status   || "In Progress",
              projectName:  task?.project  || "Project Alpha",
              moduleName:   task?.module   || "",
              taskPriority: task?.priority || "Medium",
            },
          })}
        />

      </Box>

      <SuccessPopup
        open={statusSuccess}
        onClose={() => setStatusSuccess(false)}
        message="Status updated successfully"
        autoClose autoCloseDelay={2000}
      />
    </>
  );
};

export default EmpTaskSidebar;