import { useState, useCallback, useEffect } from "react";
import {
  getEmployeeDocumentsApi,
  uploadEmployeeDocumentApi,
  deleteEmployeeDocumentApi,
} from "../../api/modules/document";
import { getSharedDocumentsApi } from "../../api/modules/sharedDocument";
import { downloadSharedDocumentApi } from "../../api/modules/sharedDocument";

export const useDocument = (employeeId) => {
  const [documents,     setDocuments]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Fetch both employee-specific docs AND shared docs assigned to this employee ──
  const fetchDocuments = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const [empRes, sharedRes] = await Promise.all([
        getEmployeeDocumentsApi(employeeId),
        getSharedDocumentsApi({ assigneeId: employeeId }),
      ]);

      const empDocs = (empRes?.status === 200 || empRes?.status === 201)
        ? (empRes.data.data.documents || []).map((d) => ({ ...d, _source: "employee" }))
        : [];

      const sharedDocs = (sharedRes?.status === 200 || sharedRes?.status === 201)
        ? (sharedRes.data.data.documents || []).map((d) => ({ ...d, _source: "shared" }))
        : [];

      setDocuments([...empDocs, ...sharedDocs]);

      if (!empRes || (empRes.status !== 200 && empRes.status !== 201)) {
        setError(empRes?.data?.message || "Failed to fetch employee documents.");
      }

      return { success: true };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // ── Upload (always employee-specific) ─────────────────────────────────────
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
  }, [employeeId, fetchDocuments]);

  // ── Delete (only employee-specific docs can be deleted from here) ──────────
  const deleteDocument = useCallback(async (documentId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteEmployeeDocumentApi(employeeId, documentId);

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
  }, [employeeId, fetchDocuments]);

  // ── Download — route to the right API based on source ─────────────────────
  const downloadDocument = useCallback(async (documentId, source = "employee") => {
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

    // employee-specific download
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";
    const url     = `${baseUrl}admin/employees/${employeeId}/documents/${documentId}/download`;
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
  }, [employeeId]);

  useEffect(() => { fetchDocuments(); }, [employeeId]);

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