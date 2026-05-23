import { useState, useCallback, useEffect } from "react";
import {
  getBugReportsApi,
  createBugReportApi,
  updateBugReportApi,
  deleteBugReportApi,
} from "../../api/modules/task";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

export const useBugReports = (taskId) => {
  const [bugs,          setBugs]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [filters,       setFilters]       = useState({ search: "", severity: "", status: "" });

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
        // screenshots now have direct Cloudinary URLs stored in DB
        setBugs(res.data.data.bugs || []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch bugs.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [taskId, filters]);

  const createBug = useCallback(async (formData) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      const { screenshots, ...fields } = formData;

      // ── Upload new screenshots to Cloudinary first ────────────────────
      const uploadedScreenshots = await Promise.all(
        (screenshots || [])
          .filter((s) => s.file) // only new files
          .map(async (s) => {
            const result = await uploadToCloudinary(s.file, "bugs");
            return {
              url:      result.url,
              publicId: result.publicId,
              fileName: result.fileName,
              fileSize: result.fileSize,
            };
          })
      );

      // ── Send JSON to backend (no multipart needed) ────────────────────
      const payload = {
        ...fields,
        screenshots: uploadedScreenshots,
      };

      const res = await createBugReportApi(taskId, payload);
      if (res?.status === 200 || res?.status === 201) {
        await fetchBugs();
        return { success: true, message: "Bug report created successfully." };
      }
      const msg = res?.data?.message || "Failed to create bug report.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      setError(err.message || "Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [taskId, fetchBugs]);

  const updateBug = useCallback(async (bugId, formData) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      const { screenshots, ...fields } = formData;

      // ── Upload only NEW screenshots (ones with .file) ─────────────────
      const newUploads = await Promise.all(
        (screenshots || [])
          .filter((s) => s.file)
          .map(async (s) => {
            const result = await uploadToCloudinary(s.file, "bugs");
            return {
              url:      result.url,
              publicId: result.publicId,
              fileName: result.fileName,
              fileSize: result.fileSize,
            };
          })
      );

      // ── Keep existing screenshots (ones without .file, already have url) ─
      const existingScreenshots = (screenshots || [])
        .filter((s) => !s.file && s.url)
        .map((s) => ({
          url:      s.url,
          publicId: s.publicId || "",
          fileName: s.fileName || "",
          fileSize: s.fileSize || "",
        }));

      const payload = {
        ...fields,
        screenshots: [...existingScreenshots, ...newUploads],
      };

      const res = await updateBugReportApi(taskId, bugId, payload);
      if (res?.status === 200 || res?.status === 201) {
        await fetchBugs();
        return { success: true, message: "Bug report updated successfully." };
      }
      const msg = res?.data?.message || "Failed to update bug report.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      setError(err.message || "Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [taskId, fetchBugs]);

  const deleteBug = useCallback(async (bugId) => {
    if (!taskId) return { success: false };
    setActionLoading(true);
    try {
      const res = await deleteBugReportApi(taskId, bugId);
      if (res?.status === 200 || res?.status === 201) {
        setBugs((prev) => prev.filter((b) => b._id !== bugId));
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to delete bug report.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [taskId]);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  }, []);

  useEffect(() => { fetchBugs(); }, [taskId, filters]);

  return { bugs, loading, actionLoading, error, fetchBugs, createBug, updateBug, deleteBug, handleFilterChange };
};