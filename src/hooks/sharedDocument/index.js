import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import {
  getSharedDocumentsApi,
  uploadSharedDocumentApi,
  deleteSharedDocumentApi,
  downloadSharedDocumentApi,
} from "../../api/modules/sharedDocument";
import { baseUrl } from "../../api/index";

// Fetches the zip as a blob and triggers a save via an in-page <a> click —
// avoids window.open's top-level navigation, which is what makes dev
// tunnels (*.devtunnels.ms) show their consent interstitial repeatedly.
const downloadZipViaFetch = async (url, filename) => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Zip download failed");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
};

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
      const filesToSend = formData.files?.length ? formData.files : (formData.file ? [formData.file] : []);
      const uploadedFiles = await Promise.all(
        filesToSend.map((f) => uploadToCloudinary(f, "shared-documents"))
      );
      const files = uploadedFiles.map((u) => ({
        fileName: u.fileName, filePath: u.url, fileSize: u.fileSize,
      }));

      const payload = {
        title:        formData.title,
        documentType: formData.documentType || formData.type || "other",
        assigneeIds:  formData.assigneeIds || [],
        files,
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
      const { fileUrl, fileName, isZip } = res.data.data;
      if (isZip) {
        await downloadZipViaFetch(
          `${baseUrl.replace(/\/$/, "")}/documents/${id}/download-zip`,
          `${fileName || "documents"}.zip`
        );
        return;
      }
      const forceDownloadUrl = fileUrl.includes("/upload/")
        ? fileUrl.replace("/upload/", "/upload/fl_attachment/")
        : fileUrl;
      const a = document.createElement("a");
      a.href = forceDownloadUrl;
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