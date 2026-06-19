import { useState, useCallback, useEffect } from "react";
import {
  getProjectDocumentsApi,
  uploadProjectDocumentApi,
  deleteProjectDocumentApi,
} from "../../api/modules/projectDocument";
import { baseUrl } from "../../api/index";

export const useProjectDocument = (projectId) => {
  const [documents,     setDocuments]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Fetch — ProjectDocument is now the single source of truth for this
  // tab. It already carries assigneeIds (who this was shared with), so
  // there's no need to separately merge in SharedDocument records — that
  // call never actually filtered by project (SharedDocument has no project
  // field), so it was returning either nothing useful or unrelated docs.
  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getProjectDocumentsApi(projectId);
      if (res?.status === 200 || res?.status === 201) {
        const docs = (res.data.data.documents || []).map((d) => ({ ...d, _source: "project" }));
        setDocuments(docs);
        return { success: true };
      }
      setError(res?.data?.message || "Failed to fetch documents.");
      return { success: false };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // ── Upload — now includes assigneeIds (selected team members to share
  // with) alongside the existing title/documentType/file fields.
  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title",        formData.title);
      payload.append("documentType", formData.documentType || formData.type || "other");
      payload.append("assigneeIds",  JSON.stringify(formData.assigneeIds || []));

      // Accept either a single `file` or a `files` array (the new dialog
      // uses `files`, the older one used `file` — support both safely).
      const fileToSend = formData.file || formData.files?.[0];
      if (fileToSend) payload.append("file", fileToSend);

      const response = await uploadProjectDocumentApi(projectId, payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchDocuments();
        return { success: true, message: "Document uploaded successfully." };
      }
      const msg = response?.data?.message || "Failed to upload document.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [projectId, fetchDocuments]);

  // ── Delete — project documents only now (no shared-doc branch needed,
  // since the project tab no longer merges in SharedDocument records).
  const deleteDocument = useCallback(async (documentId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteProjectDocumentApi(projectId, documentId);
      if (response?.status === 200 || response?.status === 201) {
        await fetchDocuments();
        return { success: true, message: "Document deleted successfully." };
      }
      const msg = response?.data?.message || "Failed to delete document.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [projectId, fetchDocuments]);

  // ── Download — fixed to use the shared `baseUrl` (single source of
  // truth, see src/api/index.js) instead of a stale/incorrect env var name.
  const downloadDocument = useCallback(async (documentId) => {
    const url   = `${baseUrl}admin/projects/${projectId}/documents/${documentId}/download`;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setError("Failed to download document.");
        return;
      }
      const blob    = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href = blobUrl;
      a.download = "";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setError("Failed to download document.");
    }
  }, [projectId]);

  useEffect(() => { fetchDocuments(); }, [projectId]);

  return {
    documents,
    loading,
    actionLoading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  };
};