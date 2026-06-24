// hooks/projectDocument.js — FULL REPLACEMENT
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

  // ── Upload — optimistic update: prepend the returned doc immediately,
  // no second fetchDocuments() call needed. The backend returns the fully
  // populated document so the table row is complete straight away.
  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title",        formData.title);
      payload.append("documentType", formData.documentType || formData.type || "other");
      payload.append("assigneeIds",  JSON.stringify(formData.assigneeIds || []));

      const fileToSend = formData.file || formData.files?.[0];
      if (fileToSend) payload.append("file", fileToSend);

      const response = await uploadProjectDocumentApi(projectId, payload);
      if (response?.status === 200 || response?.status === 201) {
        const newDoc = response.data.data.document;
        // ✅ Prepend directly — no re-fetch, dialog closes instantly
        setDocuments((prev) => [{ ...newDoc, _source: "project" }, ...prev]);
        return { success: true, message: "Document uploaded successfully." };
      }
      const msg = response?.data?.message || "Failed to upload document.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false); // ✅ loading stops as soon as upload responds
    }
  }, [projectId]);

  // ── Delete — optimistic removal, no re-fetch
  const deleteDocument = useCallback(async (documentId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteProjectDocumentApi(projectId, documentId);
      if (response?.status === 200 || response?.status === 201) {
        // ✅ Remove locally — no re-fetch
        setDocuments((prev) => prev.filter((d) => d._id !== documentId));
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
  }, [projectId]);

  const downloadDocument = useCallback(async (documentId) => {
    const url   = `${baseUrl}admin/projects/${projectId}/documents/${documentId}/download`;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError("Failed to download document."); return; }
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