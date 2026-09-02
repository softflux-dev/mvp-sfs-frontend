import { useState, useCallback, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import {
  getEmployeeDocumentsApi,
  uploadEmployeeDocumentApi,
  deleteEmployeeDocumentApi,
  downloadEmployeeDocumentApi,
} from "../../api/modules/document";
import { baseUrl } from "../../api/index";

// Fetches the zip as a blob and triggers a save via an in-page <a> click —
// avoids window.open's top-level navigation, which is what makes dev
// tunnels (*.devtunnels.ms) show their consent interstitial repeatedly.
// CHANGED: this was previously called by downloadDocument below without
// ever being defined here (it only existed in hooks/projectDocument.js and
// hooks/sharedDocument.js), which threw a ReferenceError on every
// multi-file download and surfaced as "Failed to download document."
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
      const filesToSend = formData.files?.length ? formData.files : (formData.file ? [formData.file] : []);
      const uploadedFiles = await Promise.all(
        filesToSend.map((f) => uploadToCloudinary(f, "employee-documents"))
      );
      const files = uploadedFiles.map((u) => ({
        fileName: u.fileName, filePath: u.url, fileSize: u.fileSize,
      }));

      const payload = {
        title:        formData.title,
        documentType: formData.documentType || "other",
        files,
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
  try {
    const res = await downloadEmployeeDocumentApi(employeeId, documentId);
    if (res?.status === 200 || res?.status === 201) {
      const { fileUrl, fileName, isZip } = res.data.data;
     if (isZip) {
        await downloadZipViaFetch(
          `${baseUrl.replace(/\/$/, "")}/admin/employees/${employeeId}/documents/${documentId}/download-zip`,
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