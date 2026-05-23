import { useState, useEffect, useCallback } from "react";
import {
  getSharedDocumentsApi,
  uploadSharedDocumentApi,
  deleteSharedDocumentApi,
  downloadSharedDocumentApi,
} from "../../api/modules/sharedDocument";

export const useSharedDocument = (options = {}) => {
  const { pmId = null } = options; // pass PM's user id when role is PM

  const [documents,     setDocuments]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");

  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      // If PM, always filter by their id so they only see their own docs
      const finalParams = pmId
        ? { ...params, assigneeId: pmId }
        : params;

      const res = await getSharedDocumentsApi(finalParams);
      if (res?.status === 200 || res?.status === 201) {
        setDocuments(res.data.data.documents || []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch documents.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [pmId]);

  const uploadDocument = useCallback(async (formData) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await uploadSharedDocumentApi(formData);
      if (res?.status === 200 || res?.status === 201) {
        await fetchDocuments();
        return { success: true, message: "Document uploaded successfully." };
      }
      const msg = res?.data?.message || "Failed to upload document.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await deleteSharedDocumentApi(id);
      if (res?.status === 200 || res?.status === 201) {
        await fetchDocuments();
        return { success: true, message: "Document deleted successfully." };
      }
      const msg = res?.data?.message || "Failed to delete document.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDocuments]);

  const downloadDocument = useCallback(async (id) => {
    try {
      const res = await downloadSharedDocumentApi(id);
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
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [pmId]); // re-fetch if pmId changes

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