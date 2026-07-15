import { useState, useCallback, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import {
  getEmployeeDocumentsApi,
  uploadEmployeeDocumentApi,
  deleteEmployeeDocumentApi,
} from "../../api/modules/document";
import { downloadSharedDocumentApi } from "../../api/modules/sharedDocument";
import { baseUrl } from "../../api/index";

export const useDocument = (employeeId) => {
  const [documents,     setDocuments]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  // ── Only fetch employee-specific docs — shared mirror is for employee portal only
  const fetchDocuments = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getEmployeeDocumentsApi(employeeId);
      if (res?.status === 200 || res?.status === 201) {
        setDocuments(res.data.data.documents || []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch documents.";
      setError(msg);
      return { success: false };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      let fileUrl = "", fileName = "";
      if (formData.file) {
        const uploaded = await uploadToCloudinary(formData.file, "employee-documents");
        fileUrl  = uploaded.url;
        fileName = uploaded.fileName;
      }

      const payload = {
        title:        formData.title,
        documentType: formData.documentType || "other",
        fileUrl,
        fileName,
      };

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

  const downloadDocument = useCallback(async (documentId) => {
    const url = `${baseUrl}admin/employees/${employeeId}/documents/${documentId}/download`;
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