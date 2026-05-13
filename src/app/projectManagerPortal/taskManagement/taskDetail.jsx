import { useLocation } from "react-router-dom";
import UnifiedTaskDetail from "../../../shared/taskDetail/UnifiedTaskDetail";
import AddTaskDialog     from "./addTaskDialog";

const TaskDetail = () => {
  const task = useLocation().state?.task || {};
  return (
    <UnifiedTaskDetail
      backLabel="Back to Task Management"
      EditDialog={AddTaskDialog}
    />
  );
};

export default TaskDetail;