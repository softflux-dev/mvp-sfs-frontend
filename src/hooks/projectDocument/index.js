import { useState, useCallback, useEffect } from "react";
import {
  getProjectDocumentsApi,
  uploadProjectDocumentApi,
  deleteProjectDocumentApi,
} from "../../api/modules/projectDocument";

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
      const response = await getProjectDocumentsApi(projectId);
      if (response?.status === 200 || response?.status === 201) {
        setDocuments(response.data.data.documents || []);
        return { success: true };
      } else {
        const msg = response?.data?.message || "Failed to fetch documents.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
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
      } else {
        const msg = response?.data?.message || "Failed to upload document.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [projectId, fetchDocuments]);

  const deleteDocument = useCallback(async (documentId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteProjectDocumentApi(projectId, documentId);
      if (response?.status === 200 || response?.status === 201) {
        await fetchDocuments();
        return { success: true, message: "Document deleted successfully." };
      } else {
        const msg = response?.data?.message || "Failed to delete document.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [projectId, fetchDocuments]);

  const downloadDocument = useCallback((documentId) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";
    const url     = `${baseUrl}admin/projects/${projectId}/documents/${documentId}/download`;
    const token   = localStorage.getItem("token");

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a       = document.createElement("a");
        a.href        = blobUrl;
        a.download    = "";
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => setError("Failed to download document."));
  }, [projectId]);

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

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