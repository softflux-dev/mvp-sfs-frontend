import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
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
      let fileUrl = "", fileName = "";
      if (formData.file) {
        const uploaded = await uploadToCloudinary(formData.file, "shared-documents");
        fileUrl  = uploaded.url;
        fileName = uploaded.fileName;
      }

      const payload = {
        title:        formData.title,
        documentType: formData.documentType || formData.type || "other",
        assigneeIds:  formData.assigneeIds || [],
        fileUrl,
        fileName,
      };

      const res = await uploadSharedDocumentApi(payload);
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
    if (res?.status === 200 || res?.status === 201) {
      const { fileUrl, fileName } = res.data.data;
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName || "";
      a.target = "_blank";
      a.click();
    } else {
      setError("Failed to download document.");
    }
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