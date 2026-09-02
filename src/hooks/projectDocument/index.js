// hooks/projectDocument.js — 
import { useState, useCallback, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import {
  getProjectDocumentsApi,
  uploadProjectDocumentApi,
  deleteProjectDocumentApi,
   downloadProjectDocumentApi,
} from "../../api/modules/projectDocument";
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
      const filesToSend = formData.files?.length ? formData.files : (formData.file ? [formData.file] : []);

      const uploadedFiles = await Promise.all(
        filesToSend.map((f) => uploadToCloudinary(f, "project-documents"))
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
        const { fileUrl, fileName, isZip } = res.data.data;
                if (isZip) {
          await downloadZipViaFetch(
            `${baseUrl.replace(/\/$/, "")}/admin/projects/${projectId}/documents/${documentId}/download-zip`,
            `${fileName || "documents"}.zip`
          );
          return;
        }
        // Cloudinary serves PDFs inline by default (no Content-Disposition
        // header for cross-origin requests), so the `download` attribute
        // alone doesn't force a save dialog — inject fl_attachment to make
        // Cloudinary itself set that header.
        const forceDownloadUrl = fileUrl.includes("/upload/")
          ? fileUrl.replace("/upload/", "/upload/fl_attachment/")
          : fileUrl;
        const a = document.createElement("a");
        a.href     = forceDownloadUrl;
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