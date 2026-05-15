import { useState, useCallback, useEffect } from "react";
import {
  getEmployeeDocumentsApi,
  uploadEmployeeDocumentApi,
  deleteEmployeeDocumentApi,
} from "../../api/modules/document";

export const useDocument = (employeeId) => {
  const [documents,     setDocuments]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getEmployeeDocumentsApi(employeeId);

      if (response?.status === 200 || response?.status === 201) {
        const { documents: data } = response.data.data;
        setDocuments(Array.isArray(data) ? data : []);
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
  }, [employeeId]);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title",        formData.title);
      payload.append("documentType", formData.documentType || "other");
      if (formData.file) payload.append("file", formData.file);

      const response = await uploadEmployeeDocumentApi(employeeId, payload);

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
  }, [employeeId, fetchDocuments]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteDocument = useCallback(async (documentId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteEmployeeDocumentApi(employeeId, documentId);

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
  }, [employeeId, fetchDocuments]);

  // ── Download (opens in new tab) ────────────────────────────────────────────
  const downloadDocument = useCallback((documentId) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";
    const url     = `${baseUrl}admin/employees/${employeeId}/documents/${documentId}/download`;
    const token   = localStorage.getItem("token");

    // fetch as blob so we can pass auth header
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
  }, [employeeId]);

  // ── Auto-fetch when employeeId changes ────────────────────────────────────
  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

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