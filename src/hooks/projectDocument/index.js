import { useState, useCallback, useEffect } from "react";
import {
  getProjectDocumentsApi,
  uploadProjectDocumentApi,
  deleteProjectDocumentApi,
} from "../../api/modules/projectDocument";
import { getSharedDocumentsApi, downloadSharedDocumentApi } from "../../api/modules/sharedDocument";

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
      const [projRes, sharedRes] = await Promise.all([
        getProjectDocumentsApi(projectId),
        getSharedDocumentsApi({ projectId }),
      ]);

      const projDocs = (projRes?.status === 200 || projRes?.status === 201)
        ? (projRes.data.data.documents || []).map((d) => ({ ...d, _source: "project" }))
        : [];

      const sharedDocs = (sharedRes?.status === 200 || sharedRes?.status === 201)
        ? (sharedRes.data.data.documents || []).map((d) => ({ ...d, _source: "shared" }))
        : [];

      setDocuments([...projDocs, ...sharedDocs]);
      return { success: true };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title",        formData.title);
      payload.append("documentType", formData.documentType || "other");
      if (formData.file) payload.append("file", formData.file);

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

  const deleteDocument = useCallback(async (documentId, source = "project") => {
    // shared docs are read-only here
    if (source === "shared") {
      setError("Shared documents can only be deleted from Document Management.");
      return { success: false };
    }
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

  const downloadDocument = useCallback(async (documentId, source = "project") => {
    if (source === "shared") {
      try {
        const res = await downloadSharedDocumentApi(documentId);
        const disposition = res.headers?.["content-disposition"] || "";
        const nameMatch   = disposition.match(/filename="?([^";\n]+)"?/);
        const fileName    = nameMatch?.[1]?.trim() || "document";
        const blob = new Blob([res.data], {
          type: res.headers?.["content-type"] || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      } catch {
        setError("Failed to download document.");
      }
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";
    const url     = `${baseUrl}admin/projects/${projectId}/documents/${documentId}/download`;
    const token   = localStorage.getItem("token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a       = document.createElement("a");
        a.href = blobUrl; a.download = "";
        a.click(); URL.revokeObjectURL(blobUrl);
      })
      .catch(() => setError("Failed to download document."));
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