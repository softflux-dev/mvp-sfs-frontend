import { useState, useCallback, useEffect } from "react";
import {
  getProjectTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  getEmployeesByDepartmentApi,
  getEmployeeTasksApi,
  pmGetTasksApi,
  pmGetProjectTasksApi,
  pmCreateTaskApi,
  pmUpdateTaskApi,
  pmDeleteTaskApi,
  empGetMyTasksApi,
  getTaskDetailApi,
  addCommentApi,
  updateTaskStatusApi,
  submitWorkApi,
  getSubmissionsApi,
} from "../../api/modules/task";

// ── Hook: admin project tasks (TasksTab inside ProjectDetail) ─────────────────
export const useTask = (projectId) => {
  const [tasks,         setTasks]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [filters,       setFilters]       = useState({ search: "", status: "", priority: "", module: "", category: "" });
  const [deptEmployees,  setDeptEmployees]  = useState([]);
  const [deptEmpLoading, setDeptEmpLoading] = useState(false);

  const fetchTasks = useCallback(async (customParams = {}) => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        search:   customParams.search   ?? filters.search,
        status:   customParams.status   ?? filters.status, 
        priority: customParams.priority ?? filters.priority,
        module:   customParams.module   ?? filters.module,
        category: customParams.category ?? filters.category,
      };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await getProjectTasksApi(projectId, params);
      if (res?.status === 200 || res?.status === 201) {
        setTasks(Array.isArray(res.data.data.tasks) ? res.data.data.tasks : []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch tasks.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  const fetchEmployeesByDepartment = useCallback(async (departmentId) => {
    if (!departmentId || !projectId) { setDeptEmployees([]); return; }
    setDeptEmpLoading(true);
    try {
      const res = await getEmployeesByDepartmentApi(projectId, departmentId);
      setDeptEmployees(res?.status === 200 || res?.status === 201 ? res.data.data.employees || [] : []);
    } catch { setDeptEmployees([]); }
    finally   { setDeptEmpLoading(false); }
  }, [projectId]);

  // In useTask hook, createTask callback:
const createTask = useCallback(async (payload) => {
  setActionLoading(true);
  try {
    const res = await createTaskApi(projectId, payload);
    if (res?.status === 200 || res?.status === 201) {
      await fetchTasks();
      return {
        success: true,
        message: "Task created successfully.",
        data: res.data.data,      
      };
    }
    const msg = res?.data?.message || "Failed to create task.";
    setError(msg);
    return { success: false, message: msg };
  } catch {
    setError("Something went wrong.");
    return { success: false, message: "Something went wrong." };
  } finally {
    setActionLoading(false);
  }
}, [projectId, fetchTasks]);

  const updateTask = useCallback(async (taskId, payload) => {
    setActionLoading(true);
    try {
      const res = await updateTaskApi(projectId, taskId, payload);
      if (res?.status === 200 || res?.status === 201) { await fetchTasks(); return { success: true, message: "Task updated successfully." }; }
      const msg = res?.data?.message || "Failed to update task.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [projectId, fetchTasks]);

  const deleteTask = useCallback(async (taskId) => {
    setActionLoading(true);
    try {
      const res = await deleteTaskApi(projectId, taskId);
      if (res?.status === 200 || res?.status === 201) { await fetchTasks(); return { success: true, message: "Task deleted successfully." }; }
      const msg = res?.data?.message || "Failed to delete task.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [projectId, fetchTasks]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  }, []);

  useEffect(() => { fetchTasks(); }, [projectId, filters]);

  return { tasks, loading, actionLoading, error, deptEmployees, deptEmpLoading, fetchTasks, fetchEmployeesByDepartment, createTask, updateTask, deleteTask, handleFilterChange };
};

// ── Hook: admin employee tasks (EmployeeDetail tasks tab) ─────────────────────
export const useEmployeeTask = (employeeId) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchTasks = useCallback(async (params = {}) => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getEmployeeTasksApi(employeeId, params);
      if (res?.status === 200 || res?.status === 201) {
        setTasks(Array.isArray(res.data.data.tasks) ? res.data.data.tasks : []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch tasks.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { fetchTasks(); }, [employeeId]);

  return { tasks, loading, error, fetchTasks };
};

// ── Hook: PM task management (all tasks across PM's projects) ─────────────────
export const usePMTasks = () => {
  const [tasks,         setTasks]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [filters,       setFilters]       = useState({ search: "", status: "", priority: "", project: "" });

  const fetchTasks = useCallback(async (customParams = {}) => {
  setLoading(true);
  setError("");
  try {
    const params = { ...filters, ...customParams };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    const res = await pmGetTasksApi(params);
    if (res?.status === 200 || res?.status === 201) {
      const raw = Array.isArray(res.data.data.tasks) ? res.data.data.tasks : [];
      
      // ── Normalize populated objects to flat strings ──────────────────
   const normalized = raw.map((t) => ({
  ...t,
  id:          t._id,
  title: t.title,
  task:        t.title,
  projectName: t.project?.projectName || t.project || "—",
  projectId:   t.project?._id         || t.project || "",
  module:      t.module?.title        || t.module  || "—",
  moduleId:    t.module?._id          || "",
  assignees:     t.assignees || [],                                    
  assigneeIds:   (t.assignees || []).map((a) => a._id),
  assigneeNames: (t.assignees || []).map((a) => a.fullName || ""),
  assigneeAvatars: (t.assignees || []).map((a) => a.avatar || ""),
  priority:    t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "—",
  startDate:   t.startDate ? new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  endDate:     t.endDate   ? new Date(t.endDate).toLocaleDateString("en-US",   { month: "short", day: "numeric", year: "numeric" }) : "—",
  startDateRaw: t.startDate || null,     
  endDateRaw:   t.endDate   || null,   
 status: t.status || "", 
  taskStatus:  t.taskStatus
    ? t.taskStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—",                               
  departmentId: t.department?._id || "",
  description:  t.description    || "",
  comments:    t.commentCount        || 0,
  attachments: t.attachments?.length || 0,
}));

      setTasks(normalized);
      return { success: true };
    }
    const msg = res?.data?.message || "Failed to fetch tasks.";
    setError(msg); return { success: false, message: msg };
  } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
  finally   { setLoading(false); }
}, [filters]);

  const createTask = useCallback(async (projectId, payload) => {
  setActionLoading(true);
  try {
    const res = await pmCreateTaskApi(projectId, payload);
    if (res?.status === 200 || res?.status === 201) {
      await fetchTasks();
      return {
        success: true,
        message: "Task created successfully.",
        data: res.data.data,          
      };
    }
    const msg = res?.data?.message || "Failed to create task.";
    setError(msg); return { success: false, message: msg };
  } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
  finally   { setActionLoading(false); }
}, [fetchTasks]);

  const updateTask = useCallback(async (projectId, taskId, payload) => {
    setActionLoading(true);
    try {
      const res = await pmUpdateTaskApi(projectId, taskId, payload);
      if (res?.status === 200 || res?.status === 201) { 
        await fetchTasks(); 
        return { success: true, message: "Task updated successfully." }; }
      const msg = res?.data?.message || "Failed to update task.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (projectId, taskId) => {
    setActionLoading(true);
    try {
      const res = await pmDeleteTaskApi(projectId, taskId);
      if (res?.status === 200 || res?.status === 201) { await fetchTasks(); return { success: true, message: "Task deleted successfully." }; }
      const msg = res?.data?.message || "Failed to delete task.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [fetchTasks]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  }, []);

  useEffect(() => { fetchTasks(); }, [filters]);

  return { tasks, loading, actionLoading, error, fetchTasks, createTask, updateTask, deleteTask, handleFilterChange };
};

// ── Hook: employee my tasks ───────────────────────────────────────────────────
export const useMyTasks = () => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
 const [filters, setFilters] = useState({ search: "", status: "", priority: "", project: "" });
 const [projectStagesMap, setProjectStagesMap] = useState({});



  const fetchTasks = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search:   customParams.search   ?? filters.search,
        status:   customParams.status   ?? filters.status,
        priority: customParams.priority ?? filters.priority,
        project:  customParams.project  ?? filters.project,
      };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await empGetMyTasksApi(params);
     if (res?.status === 200 || res?.status === 201) {
        const raw = Array.isArray(res.data.data.tasks) ? res.data.data.tasks : [];
        const stagesMap = res.data.data.projectStagesMap || {};
      // In useMyTasks fetchTasks, update the normalized map:
      const normalized = raw.map((t) => ({
        ...t,
        id:           t._id,
        title:        t.title,
        task:         t.title,
        projectName:  t.project?.projectName || t.project || "—",
        projectId:      t.project?._id         || t.project || "", 
        project:      t.project?.projectName || t.project || "—",
        module:       t.module?.title        || t.module  || "—",
        assignees:    t.assignees            || [],
        assigneeIds:    (t.assignees || []).map((a) => a._id    || a),      
        assigneeNames:  (t.assignees || []).map((a) => a.fullName || ""),   
        assigneeAvatars:(t.assignees || []).map((a) => a.avatar  || ""),   
        assigneeName: t.assignees?.[0]?.fullName || "",
        assigneeAvatar: t.assignees?.[0]?.avatar || "",
        priority:     t.priority
          ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
          : "—",
        deadline:     t.endDate
          ? new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "",
        startDate:    t.startDate
          ? new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "—",
        endDate:      t.endDate
          ? new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "—",
         status:         t.status    || "",        // raw — kanban uses this for column matching
        taskStatus:   t.taskStatus
          ? t.taskStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "—",                               // formatted — list view displays this
          comments:    t.commentCount    || 0,
          attachments: t.attachments?.length || 0,
      }));
      setTasks(normalized);
      setProjectStagesMap(stagesMap);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch tasks.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setLoading(false); }
  }, [filters]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  }, []);

  useEffect(() => { fetchTasks(); }, [filters]);

  return { tasks, loading, error, fetchTasks, handleFilterChange, projectStagesMap  };
};

// ── Hook: unified task detail (comments, attachments, activity, submissions) ───
export const useTaskDetail = (taskId) => {
  const [task,          setTask]          = useState(null);
  const [comments,      setComments]      = useState([]);
  const [activityLogs,  setActivityLogs]  = useState([]);
  const [submissions,   setSubmissions]   = useState([]);
  const [stages,        setStages]        = useState([]);   // ← NEW
  const [loading,       setLoading]       = useState(false);
  const [commentLoading,setCommentLoading]= useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error,         setError]         = useState("");
 
  const fetchDetail = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError("");
    try {
      const [detailRes, subRes] = await Promise.all([
        getTaskDetailApi(taskId),
        getSubmissionsApi(taskId),
      ]);
      if (detailRes?.status === 200 || detailRes?.status === 201) {
        const { task: t, comments: c, activityLogs: a, stages: s } = detailRes.data.data;
        setTask(t || null);
        setComments(Array.isArray(c) ? c : []);
        setActivityLogs(Array.isArray(a) ? a : []);
        setStages(Array.isArray(s) ? s : []);   // ← NEW
      } else {
        setError(detailRes?.data?.message || "Failed to fetch task detail.");
      }
      if (subRes?.status === 200 || subRes?.status === 201) {
        setSubmissions(subRes.data.data.submissions || []);
      }
    } catch { setError("Something went wrong."); }
    finally   { setLoading(false); }
  }, [taskId]);
 
  const sendComment = useCallback(async (text) => {
    if (!text?.trim() || !taskId) return { success: false };
    setCommentLoading(true);
    try {
      const res = await addCommentApi(taskId, text);
      if (res?.status === 200 || res?.status === 201) {
        setComments((prev) => [...prev, res.data.data.comment]);
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setCommentLoading(false); }
  }, [taskId]);
 
  const updateStatus = useCallback(async (status) => {
    if (!taskId) return { success: false };
    setStatusLoading(true);
    try {
      const res = await updateTaskStatusApi(taskId, status);
      if (res?.status === 200 || res?.status === 201) {
        setTask((prev) => prev ? { ...prev, taskStatus: status } : prev);
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setStatusLoading(false); }
  }, [taskId]);
 
  const submitWork = useCallback(async (formData) => {
    if (!taskId) return { success: false };
    setSubmitLoading(true);
    try {
      const res = await submitWorkApi(taskId, formData);
      if (res?.status === 200 || res?.status === 201) {
        setSubmissions((prev) => [res.data.data.submission, ...prev]);
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch { return { success: false, message: "Something went wrong." }; }
    finally   { setSubmitLoading(false); }
  }, [taskId]);
 
  useEffect(() => { fetchDetail(); }, [taskId]);
 
  return {
    task, comments, activityLogs, submissions, stages,   // ← stages added
    loading, commentLoading, statusLoading, submitLoading, error,
    fetchDetail, sendComment, updateStatus, submitWork,
  };
};