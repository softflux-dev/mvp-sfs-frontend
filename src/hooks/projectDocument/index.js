// hooks/projectDocument.js — 
import { useState, useCallback, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
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
      let fileUrl = "", fileName = "", fileSize = "";
      const fileToSend = formData.file || formData.files?.[0];
      if (fileToSend) {
        const uploaded = await uploadToCloudinary(fileToSend, "project-documents");
        fileUrl  = uploaded.url;
        fileName = uploaded.fileName;
        fileSize = uploaded.fileSize;
      }

      const payload = {
        title:        formData.title,
        documentType: formData.documentType || formData.type || "other",
        assigneeIds:  formData.assigneeIds || [],
        fileUrl,
        fileName,
        fileSize,
      };

      const response = await uploadProjectDocumentApi(projectId, payload);
      if (response?.status === 200 || response?.status === 201) {
        const newDoc = response.data.data.document;
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
      setActionLoading(false);
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
    try {
      const res = await downloadProjectDocumentApi(projectId, documentId);
      if (res?.status === 200 || res?.status === 201) {
        const { fileUrl, fileName } = res.data.data;
        const a = document.createElement("a");
        a.href     = fileUrl;
        a.download = fileName || "";
        a.target   = "_blank";
        a.click();
      } else {
        setError("Failed to download document.");
      }
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