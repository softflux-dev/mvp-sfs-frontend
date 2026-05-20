import { useState, useCallback, useEffect } from "react";
import {
  getBugReportsApi,
  createBugReportApi,
  updateBugReportApi,
  deleteBugReportApi,
  bugScreenshotUrl,
} from "../../api/modules/task";

export const useBugReports = (taskId) => {
  const [bugs,         setBugs]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [actionLoading,setActionLoading]= useState(false);
  const [error,        setError]        = useState("");
  const [filters,      setFilters]      = useState({ search: "", severity: "", status: "" });

  const fetchBugs = useCallback(async (customParams = {}) => {
    if (!taskId) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        search:   customParams.search   ?? filters.search,
        severity: customParams.severity ?? filters.severity,
        status:   customParams.status   ?? filters.status,
      };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await getBugReportsApi(taskId, params);
      if (res?.status === 200 || res?.status === 201) {
        // Normalise screenshot paths to full URLs
        const raw = res.data.data.bugs || [];
        const normalised = raw.map((b) => ({
          ...b,
          screenshots: (b.screenshots || []).map((s, i) => ({
            ...s,
            url: bugScreenshotUrl(taskId, b._id, i),
          })),
        }));
        setBugs(normalised);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch bugs.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setLoading(false); }
  }, [taskId, filters]);

  const createBug = useCallback(async (formData) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      // Build multipart form
      const fd = new FormData();
      const { screenshots, ...fields } = formData;
      Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      (screenshots || []).forEach((s) => { if (s.file) fd.append("screenshots", s.file); });

      const res = await createBugReportApi(taskId, fd);
      if (res?.status === 200 || res?.status === 201) {
        await fetchBugs();
        return { success: true, message: "Bug report created successfully." };
      }
      const msg = res?.data?.message || "Failed to create bug report.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [taskId, fetchBugs]);

  const updateBug = useCallback(async (bugId, formData) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      const fd = new FormData();
      const { screenshots, ...fields } = formData;
      Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      // Only upload new screenshots (ones with a .file property)
      (screenshots || []).filter((s) => s.file).forEach((s) => fd.append("screenshots", s.file));

      const res = await updateBugReportApi(taskId, bugId, fd);
      if (res?.status === 200 || res?.status === 201) {
        await fetchBugs();
        return { success: true, message: "Bug report updated successfully." };
      }
      const msg = res?.data?.message || "Failed to update bug report.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [taskId, fetchBugs]);

  const deleteBug = useCallback(async (bugId) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      const res = await deleteBugReportApi(taskId, bugId);
      if (res?.status === 200 || res?.status === 201) {
        setBugs((prev) => prev.filter((b) => b._id !== bugId));
        return { success: true, message: "Bug report deleted successfully." };
      }
      const msg = res?.data?.message || "Failed to delete bug report.";
      setError(msg); return { success: false, message: msg };
    } catch { setError("Something went wrong."); return { success: false, message: "Something went wrong." }; }
    finally   { setActionLoading(false); }
  }, [taskId]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  }, []);

  useEffect(() => { fetchBugs(); }, [taskId, filters]);

  return { bugs, loading, actionLoading, error, fetchBugs, createBug, updateBug, deleteBug, handleFilterChange };
};