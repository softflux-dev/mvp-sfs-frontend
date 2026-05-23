const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary
 * @param {File}   file        — the File object
 * @param {string} folder      — e.g. "employees", "documents", "tasks"
 * @returns {Promise<{ url, publicId, fileName, fileSize }>}
 */
export const uploadToCloudinary = async (file, folder = "general") => {
  const formData = new FormData();
  formData.append("file",          file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder",        folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();

  return {
    url:       data.secure_url,                                    // store this in DB
    publicId:  data.public_id,                                     // for deletion
    fileName:  file.name,
    fileSize:  (data.bytes / (1024 * 1024)).toFixed(1) + " MB",
  };
};

/**
 * Delete a file from Cloudinary — needs backend for signed delete
 * For unsigned preset, deletion must go through your backend
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
};